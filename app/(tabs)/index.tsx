import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import { Brain, Heart, Eye, AlertCircle, TrendingUp, Calendar, Clock, Zap, ArrowRight, Stethoscope } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { MedicalScan } from '@/types/database';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { profile } = useAuth();
  const [recentScans, setRecentScans] = useState<MedicalScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalScans: 0,
    criticalCases: 0,
    monthlyGrowth: 12.5
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchRecentScans();
    calculateStats();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for scan buttons
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const fetchRecentScans = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_scans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentScans(data || []);
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = () => {
    // In a real app, this would come from your database
    setStats({
      totalScans: recentScans.length,
      criticalCases: recentScans.filter(scan => scan.risk_level === 'critical').length,
      monthlyGrowth: 12.5
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecentScans();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getScanIcon = (type: string) => {
    const icons = {
      brain: { icon: Brain, color: '#001F3F', gradient: ['#001F3F', '#000814'] },
      heart: { icon: Heart, color: '#001F3F', gradient: ['#001F3F', '#000814'] },
      eye: { icon: Eye, color: '#001F3F', gradient: ['#001F3F', '#000814'] }
    };

    const scanType = icons[type as keyof typeof icons] || icons.brain;
    const IconComponent = scanType.icon;

    return (
      <LinearGradient
        colors={scanType.gradient}
        style={styles.scanIconGradient}
      >
        <IconComponent color="white" size={24} />
      </LinearGradient>
    );
  };

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'low':
        return '#4CD964';
      case 'medium':
        return '#FF9500';
      case 'high':
        return '#FF3B30';
      case 'critical':
        return '#8B0000';
      default:
        return '#000814';
    }
  };

  const getRiskGradient = (level?: string) => {
    switch (level) {
      case 'low':
        return ['#4CD964', '#2E8B57'];
      case 'medium':
        return ['#FF9500', '#FF7300'];
      case 'high':
        return ['#FF3B30', '#D70015'];
      case 'critical':
        return ['#8B0000', '#600000'];
      default:
        return ['#001F3F', '#000814'];
    }
  };

  const handleQuickScan = (type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(tabs)/scan',
      params: { presetType: type }
    });
  };

  const renderScanCard = (scan: MedicalScan, index: number) => (
    <Animated.View
      key={scan.id}
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 30],
              outputRange: [0, 30 - (index * 5)]
            })
          }
        ]
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({
            pathname: '/scan-detail',
            params: { scanId: scan.id },
          });
        }}
      >
        <Card style={styles.scanCard}>
          <View style={styles.scanHeader}>
            <View style={styles.scanInfo}>
              {getScanIcon(scan.scan_type)}
              <View style={styles.scanDetails}>
                <Text style={styles.scanType}>
                  {scan.scan_type.charAt(0).toUpperCase() + scan.scan_type.slice(1)} Analysis
                </Text>
                <View style={styles.scanMeta}>
                  <Clock size={12} color="#6C757D" />
                  <Text style={styles.scanDate}>
                    {new Date(scan.created_at).toLocaleDateString()} • {new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            </View>

            {scan.risk_level && (
              <LinearGradient
                colors={getRiskGradient(scan.risk_level)}
                style={styles.riskBadge}
              >
                <Zap size={12} color="white" />
                <Text style={styles.riskText}>{scan.risk_level.toUpperCase()}</Text>
              </LinearGradient>
            )}
          </View>

          {scan.detected_condition && (
            <View style={styles.conditionSection}>
              <Text style={styles.conditionLabel}>Detected Condition</Text>
              <Text style={styles.condition}>{scan.detected_condition}</Text>
            </View>
          )}

          <View style={styles.scanFooter}>
            <Text style={styles.viewReport}>View Full Report</Text>
            <ArrowRight size={16} color="#00D4FF" />
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <LinearGradient
        colors={['#FFFFFF', '#001F3F']}
        style={styles.headerGradient}
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{profile?.full_name || 'Valued User'} 👋</Text>
            <Text style={styles.subtitle}>Your health insights and analytics</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.charAt(0) || 'U'}
            </Text>
          </View>
        </Animated.View>

        {/* Stats Overview */}
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Stethoscope size={20} color="#000814" />
            </View>
            <Text style={styles.statValue}>{stats.totalScans}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <AlertCircle size={20} color="#FF0066" />
            </View>
            <Text style={styles.statValue}>{stats.criticalCases}</Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <TrendingUp size={20} color="#00FF88" />
            </View>
            <Text style={styles.statValue}>+{stats.monthlyGrowth}%</Text>
            <Text style={styles.statLabel}>Growth</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Medical Scan</Text>
            <Text style={styles.sectionSubtitle}>AI-powered diagnostics</Text>
          </View>

          <Card style={styles.quickActions}>
            <View style={styles.scanGrid}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={() => handleQuickScan('brain')}
                >
                  <LinearGradient
                    colors={['#001F3F', '#000814']}
                    style={styles.scanButtonGradient}
                  >
                    <Brain color="white" size={32} />
                  </LinearGradient>
                  <Text style={styles.scanLabel}>Brain MRI</Text>
                  <Text style={styles.scanDescription}>Tumor Detection</Text>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => handleQuickScan('heart')}
              >
                <LinearGradient
                  colors={['#001F3F', '#000814']}
                  style={styles.scanButtonGradient}
                >
                  <Heart color="white" size={32} />
                </LinearGradient>
                <Text style={styles.scanLabel}>Heart Scan</Text>
                <Text style={styles.scanDescription}>Cardiac Analysis</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => handleQuickScan('eye')}
              >
                <LinearGradient
                  colors={['#001F3F', '#000814']}
                  style={styles.scanButtonGradient}
                >
                  <Eye color="white" size={32} />
                </LinearGradient>
                <Text style={styles.scanLabel}>Eye Scan</Text>
                <Text style={styles.scanDescription}>Retina Analysis</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Recent Scans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Medical Scans</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Card style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading your medical scans...</Text>
            </Card>
          ) : recentScans.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <AlertCircle color="#8E8E93" size={48} />
                <Text style={styles.emptyTitle}>No Scans Yet</Text>
                <Text style={styles.emptyText}>
                  Start with a quick medical scan to get AI-powered health insights
                </Text>
              </View>
            </Card>
          ) : (
            recentScans.map((scan, index) => renderScanCard(scan, index))
          )}
        </View>

        {/* Emergency Help Card */}
        <View style={styles.section}>
          <Card style={styles.helpCard}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.helpCardGradient}
            >
              <View style={styles.helpContent}>
                <View>
                  <Text style={styles.helpTitle}>Medical Emergency?</Text>
                  <Text style={styles.helpText}>
                    Connect with certified healthcare professionals immediately
                  </Text>
                </View>
                <Stethoscope size={32} color="rgba(255,255,255,0.8)" />
              </View>

              <TouchableOpacity
                style={styles.helpButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  router.push('/(tabs)/clinics');
                }}
              >
                <Text style={styles.helpButtonText}>Find Emergency Care</Text>
                <ArrowRight size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </LinearGradient>
          </Card>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    marginTop: -10,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: '#000814',
    fontWeight: '600',
  },
  quickActions: {
    borderRadius: 20,
    padding: 20,
  },
  scanGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  scanButton: {
    flex: 1,
    alignItems: 'center',
  },
  scanButtonGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  scanDescription: {
    fontSize: 11,
    color: '#6C757D',
    textAlign: 'center',
  },
  scanCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scanInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  scanIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scanDetails: {
    flex: 1,
  },
  scanType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  scanMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scanDate: {
    fontSize: 12,
    color: '#6C757D',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  riskText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  conditionSection: {
    marginBottom: 12,
  },
  conditionLabel: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '600',
    marginBottom: 2,
  },
  condition: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  scanFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  viewReport: {
    fontSize: 14,
    color: '#000814',
    fontWeight: '600',
  },
  loadingCard: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 20,
  },
  helpCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  helpCardGradient: {
    padding: 24,
  },
  helpContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  helpButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 40,
  },
});
