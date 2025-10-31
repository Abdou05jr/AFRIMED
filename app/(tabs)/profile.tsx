import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import {
  User,
  FileText,
  Settings,
  LogOut,
  Shield,
  Calendar,
  Scan,
  Heart,
  Brain,
  Eye,
  Bell,
  Lock,
  HelpCircle,
  Award,
  ChevronRight,
  Crown,
  Zap
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { MedicalScan } from '@/types/database';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const [scanStats, setScanStats] = useState({
    total: 0,
    brain: 0,
    heart: 0,
    eye: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const avatarScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchUserStats();

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
      Animated.spring(avatarScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchUserStats = async () => {
    try {
      // Total scans
      const { count: totalCount, error: totalError } = await supabase
        .from('medical_scans')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Scan type counts
      const { count: brainCount, error: brainError } = await supabase
        .from('medical_scans')
        .select('*', { count: 'exact', head: true })
        .eq('scan_type', 'brain');

      const { count: heartCount, error: heartError } = await supabase
        .from('medical_scans')
        .select('*', { count: 'exact', head: true })
        .eq('scan_type', 'heart');

      const { count: eyeCount, error: eyeError } = await supabase
        .from('medical_scans')
        .select('*', { count: 'exact', head: true })
        .eq('scan_type', 'eye');

      setScanStats({
        total: totalCount || 0,
        brain: brainCount || 0,
        heart: heartCount || 0,
        eye: eyeCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserStats();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const getMembershipLevel = () => {
    const scanCount = scanStats.total;
    if (scanCount >= 50) return { level: 'Expert', color: '#FFD700', icon: Crown };
    if (scanCount >= 20) return { level: 'Advanced', color: '#C0C0C0', icon: Award };
    if (scanCount >= 10) return { level: 'Intermediate', color: '#CD7F32', icon: Zap };
    return { level: 'Beginner', color: '#00D4FF', icon: User };
  };

  const membership = getMembershipLevel();
  const MembershipIcon = membership.icon;

  const renderStatCard = (title: string, value: number, icon: React.ReactNode, color: string, index: number) => (
    <Animated.View
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
      <LinearGradient
        colors={[color + '20', color + '10']}
        style={styles.statCard}
      >
        <View style={styles.statIconContainer}>
          {icon}
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{title}</Text>
      </LinearGradient>
    </Animated.View>
  );

  const renderMenuItem = (icon: React.ReactNode, text: string, onPress: () => void, isLast = false, badge?: string) => (
    <TouchableOpacity
      style={[styles.menuItem, isLast && styles.menuItemLast]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          {icon}
        </View>
        <Text style={styles.menuText}>{text}</Text>
        {badge && (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <ChevronRight size={20} color="#8E8E93" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#00D4FF', '#001F3F']}
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
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Manage your health account</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00D4FF']}
            tintColor="#00D4FF"
          />
        }
      >
        {/* Profile Card */}
        <Animated.View
          style={[
            styles.profileSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Animated.View
                style={[
                  styles.avatarContainer,
                  { transform: [{ scale: avatarScale }] }
                ]}
              >
                <LinearGradient
                  colors={['#00D4FF', '#001F3F']}
                  style={styles.avatarGradient}
                >
                  <User color="white" size={32} />
                </LinearGradient>
                <View style={[styles.membershipBadge, { backgroundColor: membership.color }]}>
                  <MembershipIcon size={12} color="white" />
                </View>
              </Animated.View>

              <View style={styles.profileInfo}>
                <Text style={styles.name}>{profile?.full_name || 'Valued User'}</Text>
                <Text style={styles.email}>{profile?.email}</Text>
                {profile?.country && (
                  <Text style={styles.country}>📍 {profile.country}</Text>
                )}
                <View style={styles.membershipContainer}>
                  <Text style={[styles.membershipText, { color: membership.color }]}>
                    {membership.level} Member
                  </Text>
                  <Text style={styles.scanCount}>{scanStats.total} scans completed</Text>
                </View>
              </View>
            </View>

            <View style={styles.memberSince}>
              <Calendar size={14} color="#8E8E93" />
              <Text style={styles.memberSinceText}>
                Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Scan Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scan Analytics</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(
              'Total Scans',
              scanStats.total,
              <Scan color="#00D4FF" size={20} />,
              '#00D4FF',
              0
            )}
            {renderStatCard(
              'Brain MRI',
              scanStats.brain,
              <Brain color="#00D4FF" size={20} />,
              '#00D4FF',
              1
            )}
            {renderStatCard(
              'Heart Scans',
              scanStats.heart,
              <Heart color="#00D4FF" size={20} />,
              '#FF6B6B',
              2
            )}
            {renderStatCard(
              'Eye Scans',
              scanStats.eye,
              <Eye color="#4CD964" size={20} />,
              '#4CD964',
              3
            )}
          </View>
        </View>

        {/* Health Records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Records</Text>
          <Card style={styles.menuCard}>
            {renderMenuItem(
              <FileText color="#00D4FF" size={22} />,
              'My Medical Scans',
              () => router.push('/my-scans'),
              false,
              scanStats.total > 0 ? `${scanStats.total}` : undefined
            )}
            {renderMenuItem(
              <Heart color="#00D4FF" size={22} />,
              'Health History',
              () => router.push('/health-history')
            )}
            {renderMenuItem(
              <Bell color="#FF9500" size={22} />,
              'Scan Notifications',
              () => router.push('/notifications'),
              true
            )}
          </Card>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Settings</Text>
          <Card style={styles.menuCard}>
            {renderMenuItem(
              <Settings color="#8E8E93" size={22} />,
              'App Settings',
              () => router.push('/settings')
            )}
            {renderMenuItem(
              <Lock color="#4CD964" size={22} />,
              'Privacy & Security',
              () => router.push('/privacy')
            )}
            {renderMenuItem(
              <HelpCircle color="#007AFF" size={22} />,
              'Help & Support',
              () => router.push('/support')
            )}
            {profile?.is_admin && renderMenuItem(
              <Shield color="#FFD700" size={22} />,
              'Admin Dashboard',
              () => router.push('/admin'),
              true,
              'Admin'
            )}
          </Card>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <LogOut color="#FF3B30" size={22} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>MedScan Africa v2.1.0</Text>
          <Text style={styles.appTagline}>AI-Powered Medical Diagnostics</Text>
          <View style={styles.techStack}>
            <Text style={styles.techText}>Powered by TensorFlow AI</Text>
            <Text style={styles.techText}>Secured by Hedera Blockchain</Text>
          </View>
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
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  profileSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  membershipBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  country: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  membershipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  membershipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scanCount: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  memberSinceText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 72) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  menuCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 12,
  },
  menuBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  menuBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  signOutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    padding: 24,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
  },
  techStack: {
    alignItems: 'center',
  },
  techText: {
    fontSize: 10,
    color: '#8E8E93',
    marginBottom: 2,
  },
  bottomSpacer: {
    height: 40,
  },
});
