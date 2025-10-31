import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { Heart, Plus, TrendingUp, Users, Target, Clock, Shield, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { DonationRequest } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function DonationsScreen() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [myRequests, setMyRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'my-requests'>('explore');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const tabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchDonationRequests();
    if (user) {
      fetchMyRequests();
    }
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
  }, [user]);

  const fetchDonationRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_requests')
        .select('*')
        .eq('verification_status', 'verified')
        .order('urgency_level', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching donation requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyRequests(data || []);
    } catch (error) {
      console.error('Error fetching my requests:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDonationRequests();
    if (user) {
      fetchMyRequests();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getProgressPercentage = (raised: number, needed: number) => {
    return Math.min((raised / needed) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return '#4CD964';
      case 'pending':
        return '#FF9500';
      case 'funded':
        return '#007AFF';
      case 'rejected':
        return '#FF3B30';
      default:
        return '#999';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return '#FF3B30';
      case 'high':
        return '#FF9500';
      case 'medium':
        return '#FFCC00';
      case 'low':
        return '#4CD964';
      default:
        return '#00D4FF';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <Zap size={14} color="#FF3B30" />;
      case 'high':
        return <TrendingUp size={14} color="#FF9500" />;
      default:
        return <Clock size={14} color="#6C757D" />;
    }
  };

  const handleTabChange = (tab: 'explore' | 'my-requests') => {
    setActiveTab(tab);
    Animated.spring(tabAnim, {
      toValue: tab === 'explore' ? 0 : 1,
      useNativeDriver: true,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderDonationCard = (request: DonationRequest, index: number) => (
    <Animated.View
      key={request.id}
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
            pathname: '/donation-detail',
            params: { requestId: request.id },
          });
        }}
      >
        <Card style={styles.requestCard}>
          <LinearGradient
            colors={['rgba(255, 59, 48, 0.03)', 'rgba(255, 59, 48, 0.01)']}
            style={styles.cardGradient}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.titleSection}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['#00D4FF', '#00A8CC']}
                    style={styles.iconGradient}
                  >
                    <Heart color="white" size={20} />
                  </LinearGradient>
                </View>
                <View style={styles.titleContainer}>
                  <Text style={styles.requestTitle}>{request.title}</Text>
                  <View style={styles.urgencyContainer}>
                    {getUrgencyIcon(request.urgency_level || 'medium')}
                    <Text style={[
                      styles.urgencyText,
                      { color: getUrgencyColor(request.urgency_level || 'medium') }
                    ]}>
                      {request.urgency_level || 'medium'} urgency
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(request.status) + '20' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(request.status) }
                ]}>
                  {request.status}
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.requestDescription} numberOfLines={2}>
              {request.description}
            </Text>

            {/* Progress Section */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Funding Progress</Text>
                <Text style={styles.progressPercentage}>
                  {getProgressPercentage(request.amount_raised, request.amount_needed).toFixed(0)}%
                </Text>
              </View>

              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getProgressPercentage(request.amount_raised, request.amount_needed)}%`,
                      backgroundColor: getProgressPercentage(request.amount_raised, request.amount_needed) === 100 ? '#4CD964' : '#FF3B30'
                    }
                  ]}
                />
              </View>

              <View style={styles.amountContainer}>
                <Text style={styles.amountRaised}>
                  ${request.amount_raised.toLocaleString()} raised
                </Text>
                <Text style={styles.amountNeeded}>
                  ${(request.amount_needed - request.amount_raised).toLocaleString()} needed
                </Text>
              </View>
            </View>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.footerInfo}>
                <View style={styles.infoItem}>
                  <Users size={14} color="#666" />
                  <Text style={styles.infoText}>
                    {request.donor_count || 0} donors
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Clock size={14} color="#666" />
                  <Text style={styles.infoText}>
                    {new Date(request.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {request.verification_status === 'verified' && (
                <View style={styles.verifiedBadge}>
                  <Shield size={12} color="#4CD964" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const totalRaised = requests.reduce((sum, r) => sum + r.amount_raised, 0);
  const totalNeeded = requests.reduce((sum, r) => sum + r.amount_needed, 0);
  const overallProgress = totalNeeded > 0 ? (totalRaised / totalNeeded) * 100 : 0;

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
          <Text style={styles.title}>Medical Aid</Text>
          <Text style={styles.subtitle}>
            Support life-saving treatments and healthcare access
          </Text>
        </Animated.View>

        {/* Overall Progress */}
        <Animated.View
          style={[
            styles.overallProgress,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.overallProgressHeader}>
            <Text style={styles.overallProgressTitle}>Community Impact</Text>
            <Text style={styles.overallProgressPercentage}>
              {overallProgress.toFixed(0)}%
            </Text>
          </View>
          <View style={styles.overallProgressBar}>
            <View
              style={[
                styles.overallProgressFill,
                { width: `${overallProgress}%` }
              ]}
            />
          </View>
          <View style={styles.overallStats}>
            <Text style={styles.overallStat}>
              ${totalRaised.toLocaleString()} raised
            </Text>
            <Text style={styles.overallStat}>
              {requests.length} active campaigns
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange('explore')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'explore' && styles.activeTabText
            ]}>
              Explore Campaigns
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange('my-requests')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'my-requests' && styles.activeTabText
            ]}>
              My Requests
            </Text>
          </TouchableOpacity>
        </View>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              transform: [
                {
                  translateX: tabAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, width / 2 - 24]
                  })
                }
              ]
            }
          ]}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF3B30']}
            tintColor="#FF3B30"
          />
        }
      >
        {activeTab === 'explore' ? (
          <>
            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <LinearGradient
                colors={['#4CD964', '#2E8B57']}
                style={styles.statCard}
              >
                <TrendingUp color="white" size={28} />
                <Text style={styles.statValue}>${totalRaised.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Total Raised</Text>
              </LinearGradient>

              <LinearGradient
                colors={['#007AFF', '#0056B3']}
                style={styles.statCard}
              >
                <Target color="white" size={28} />
                <Text style={styles.statValue}>{requests.length}</Text>
                <Text style={styles.statLabel}>Active Campaigns</Text>
              </LinearGradient>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading medical aid campaigns...</Text>
              </View>
            ) : requests.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Heart color="#999" size={48} />
                <Text style={styles.emptyTitle}>No Campaigns Available</Text>
                <Text style={styles.emptyText}>
                  Check back later for new medical aid requests
                </Text>
              </Card>
            ) : (
              requests.map((request, index) => renderDonationCard(request, index))
            )}
          </>
        ) : (
          <>
            {myRequests.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Heart color="#999" size={48} />
                <Text style={styles.emptyTitle}>No Requests Yet</Text>
                <Text style={styles.emptyText}>
                  Create your first medical aid request to get started
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => router.push('/create-donation')}
                >
                  <Text style={styles.createButtonText}>Create Request</Text>
                </TouchableOpacity>
              </Card>
            ) : (
              myRequests.map((request, index) => renderDonationCard(request, index))
            )}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            router.push('/create-donation');
          }}
        >
          <LinearGradient
            colors={['#FF3B30', '#FF6B6B']}
            style={styles.fabGradient}
          >
            <Plus color="#FFF" size={28} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
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
    lineHeight: 22,
  },
  overallProgress: {
    paddingHorizontal: 24,
  },
  overallProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overallProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  overallProgressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  overallProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overallStat: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  tabsContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
  },
  activeTabText: {
    color: '#00D4FF',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: width / 2 - 24,
    height: 3,
    backgroundColor: '#00D4FF',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  requestCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  titleContainer: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  urgencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  requestDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountRaised: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  amountNeeded: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  footerInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 217, 100, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  verifiedText: {
    color: '#4CD964',
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  emptyCard: {
    margin: 24,
    padding: 40,
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
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
