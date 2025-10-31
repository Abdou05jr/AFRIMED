import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Users, Activity, Heart, Building2, TrendingUp, Zap, Shield, Settings, AlertTriangle, BarChart3, Database } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

interface AdminStats {
  totalUsers: number;
  totalScans: number;
  totalDonations: number;
  totalClinics: number;
  pendingVerifications: number;
  todayScans: number;
  activeUsers: number;
  successRate: number;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalScans: 0,
    totalDonations: 0,
    totalClinics: 0,
    pendingVerifications: 0,
    todayScans: 0,
    activeUsers: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (!profile?.is_admin) {
      router.back();
      return;
    }
    fetchStats();
  }, [profile]);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [
        users, 
        scans, 
        donations, 
        clinics, 
        pending, 
        todayScansData,
        activeUsersData,
        successfulScans
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('medical_scans').select('*', { count: 'exact', head: true }),
        supabase.from('donation_requests').select('*', { count: 'exact', head: true }),
        supabase.from('clinics').select('*', { count: 'exact', head: true }),
        supabase.from('donation_requests').select('*', { count: 'exact', head: true }).eq('verification_status', 'unverified'),
        supabase.from('medical_scans').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('medical_scans').select('*', { count: 'exact', head: true }).gte('ai_confidence_score', 0.8),
      ]);

      const successRate = scans.count ? Math.round(((successfulScans.count || 0) / scans.count) * 100) : 0;

      setStats({
        totalUsers: users.count || 0,
        totalScans: scans.count || 0,
        totalDonations: donations.count || 0,
        totalClinics: clinics.count || 0,
        pendingVerifications: pending.count || 0,
        todayScans: todayScansData.count || 0,
        activeUsers: activeUsersData.count || 0,
        successRate,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatColor = (index: number) => {
    const colors = ['#00D4FF', '#00FF88', '#FF0066', '#FFB800', '#5856D6', '#FF2D55', '#32D74B', '#0A84FF'];
    return colors[index % colors.length];
  };

  const managementItems = [
    {
      icon: Users,
      title: 'Manage Users',
      description: 'View and manage user accounts',
      color: '#00D4FF',
      route: '/admin/users',
    },
    {
      icon: Heart,
      title: 'Verify Donations',
      description: 'Review donation requests',
      color: '#FF0066',
      route: '/admin/donations',
      badge: stats.pendingVerifications,
    },
    {
      icon: Building2,
      title: 'Manage Clinics',
      description: 'Partner clinic management',
      color: '#00FF88',
      route: '/admin/clinics',
    },
    {
      icon: Activity,
      title: 'Model Management',
      description: 'AI model performance',
      color: '#FFB800',
      route: '/admin/models',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Detailed usage analytics',
      color: '#5856D6',
      route: '/admin/analytics',
    },
    {
      icon: Database,
      title: 'System Health',
      description: 'Monitor system status',
      color: '#32D74B',
      route: '/admin/health',
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Zap color="#00D4FF" size={48} />
        <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Shield color="#00D4FF" size={28} />
            <Text style={styles.title}>Admin Dashboard</Text>
          </View>
          <Text style={styles.subtitle}>System Overview & Management</Text>
        </View>
        <View style={styles.headerPattern} />
      </View>

      <Animated.ScrollView 
        style={[styles.content, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK STATS</Text>
          <View style={styles.statsGrid}>
            {Object.entries(stats).map(([key, value], index) => (
              <Card key={key} style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: `${getStatColor(index)}20` }]}>
                  {index === 0 && <Users color={getStatColor(index)} size={20} />}
                  {index === 1 && <Activity color={getStatColor(index)} size={20} />}
                  {index === 2 && <Heart color={getStatColor(index)} size={20} />}
                  {index === 3 && <Building2 color={getStatColor(index)} size={20} />}
                  {index === 4 && <AlertTriangle color={getStatColor(index)} size={20} />}
                  {index === 5 && <TrendingUp color={getStatColor(index)} size={20} />}
                  {index === 6 && <Users color={getStatColor(index)} size={20} />}
                  {index === 7 && <BarChart3 color={getStatColor(index)} size={20} />}
                </View>
                <Text style={[styles.statValue, { color: getStatColor(index) }]}>
                  {value}{key === 'successRate' ? '%' : ''}
                </Text>
                <Text style={styles.statLabel}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <View style={[styles.statBar, { backgroundColor: `${getStatColor(index)}30` }]} />
              </Card>
            ))}
          </View>
        </View>

        {/* Alert Card */}
        {stats.pendingVerifications > 0 && (
          <Card style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View style={styles.alertIconContainer}>
                <AlertTriangle color="#FFB800" size={24} />
                <View style={styles.alertPulse} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Action Required</Text>
                <Text style={styles.alertDescription}>
                  {stats.pendingVerifications} donation requests need verification
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.alertButton}>
              <Text style={styles.alertButtonText}>Review Now</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* System Health */}
        <Card style={styles.healthCard}>
          <View style={styles.cardHeader}>
            <Activity color="#00FF88" size={20} />
            <Text style={styles.cardTitle}>SYSTEM HEALTH</Text>
          </View>
          <View style={styles.healthGrid}>
            <View style={styles.healthItem}>
              <Text style={styles.healthValue}>{stats.successRate}%</Text>
              <Text style={styles.healthLabel}>AI Accuracy</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthValue}>{stats.todayScans}</Text>
              <Text style={styles.healthLabel}>Scans Today</Text>
            </View>
            <View style={styles.healthItem}>
              <Text style={styles.healthValue}>{stats.activeUsers}</Text>
              <Text style={styles.healthLabel}>Active Users</Text>
            </View>
          </View>
        </Card>

        {/* Management Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MANAGEMENT TOOLS</Text>
          <View style={styles.managementGrid}>
            {managementItems.map((item, index) => (
              <TouchableOpacity 
                key={item.title}
                style={styles.managementCard}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.managementIcon, { backgroundColor: `${item.color}20` }]}>
                  <item.icon color={item.color} size={24} />
                  {item.badge && item.badge > 0 && (
                    <View style={[styles.badge, { backgroundColor: item.color }]}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.managementTitle}>{item.title}</Text>
                <Text style={styles.managementDescription}>{item.description}</Text>
                <View style={[styles.managementBorder, { backgroundColor: item.color }]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <View style={styles.cardHeader}>
            <TrendingUp color="#00D4FF" size={20} />
            <Text style={styles.cardTitle}>RECENT ACTIVITY</Text>
          </View>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <Text style={styles.activityText}>
                <Text style={styles.activityBold}>{stats.todayScans} scans</Text> processed today
              </Text>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <Text style={styles.activityText}>
                System running <Text style={styles.activityBold}>optimally</Text>
              </Text>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <Text style={styles.activityText}>
                <Text style={styles.activityBold}>{stats.pendingVerifications} items</Text> need attention
              </Text>
            </View>
          </View>
        </Card>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0F1C',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B9CB1',
    fontWeight: '600',
  },
  header: {
    height: 180,
    justifyContent: 'flex-end',
    padding: 24,
    paddingTop: 60,
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1A1F2E',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'linear-gradient(45deg, #00D4FF 0%, #FF0066 50%, #00FF88 100%)',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 8,
  },
  headerContent: {
    zIndex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 12,
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B9CB1',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B9CB1',
    marginBottom: 16,
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 72) / 2,
    backgroundColor: '#1A1F2E',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    position: 'relative',
    overflow: 'hidden',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B9CB1',
    fontWeight: '600',
  },
  statBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  alertCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FFB800',
    padding: 20,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  alertPulse: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: '#FFB800',
    borderRadius: 14,
    opacity: 0.4,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFB800',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#FFB800',
    opacity: 0.9,
  },
  alertButton: {
    backgroundColor: '#FFB800',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#0A0F1C',
    fontSize: 14,
    fontWeight: '700',
  },
  healthCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#1A1F2E',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00D4FF',
    marginLeft: 8,
    letterSpacing: 1,
  },
  healthGrid: {
    flexDirection: 'row',
    padding: 16,
  },
  healthItem: {
    flex: 1,
    alignItems: 'center',
  },
  healthValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  healthLabel: {
    fontSize: 12,
    color: '#8B9CB1',
    fontWeight: '600',
  },
  managementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  managementCard: {
    width: (width - 72) / 2,
    backgroundColor: '#1A1F2E',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    position: 'relative',
    overflow: 'hidden',
  },
  managementIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  managementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  managementDescription: {
    fontSize: 12,
    color: '#8B9CB1',
    lineHeight: 16,
  },
  managementBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  activityCard: {
    marginHorizontal: 24,
    marginBottom: 40,
    backgroundColor: '#1A1F2E',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  activityList: {
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D4FF',
    marginRight: 12,
  },
  activityText: {
    fontSize: 14,
    color: '#8B9CB1',
    flex: 1,
  },
  activityBold: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});