import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  Dimensions,
  RefreshControl,
  TextInput,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { Building2, Phone, Mail, MapPin, Star, Search, Filter, ChevronRight, Clock, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/Card';
import { supabase } from '@/lib/supabase';
import { Clinic } from '@/types/database';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ClinicsScreen() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  const FILTERS = [
    { id: 'all', label: 'All Clinics' },
    { id: 'cardiology', label: 'Cardiology' },
    { id: 'neurology', label: 'Neurology' },
    { id: 'ophthalmology', label: 'Eye Care' },
    { id: 'general', label: 'General' }
  ];

  useEffect(() => {
    fetchClinics();
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
  }, []);

  useEffect(() => {
    filterClinics();
  }, [clinics, searchQuery, selectedFilter]);

  const fetchClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('is_verified', true)
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClinics(data || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterClinics = () => {
    let filtered = clinics;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(clinic =>
        clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.specialties?.some(specialty =>
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(clinic =>
        clinic.specialties?.some(specialty =>
          specialty.toLowerCase().includes(selectedFilter.toLowerCase())
        )
      );
    }

    setFilteredClinics(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClinics();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSearchFocus = () => {
    Animated.timing(searchAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSearchBlur = () => {
    Animated.timing(searchAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#4CD964';
    if (rating >= 4.0) return '#FFCC00';
    if (rating >= 3.0) return '#FF9500';
    return '#FF3B30';
  };

  const getWaitTimeColor = (time: string) => {
    if (time === '15-30 min') return '#4CD964';
    if (time === '30-60 min') return '#FFCC00';
    return '#FF9500';
  };

  const renderClinicCard = (clinic: Clinic, index: number) => (
    <Animated.View
      key={clinic.id}
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
            pathname: '/clinic-detail',
            params: { clinicId: clinic.id },
          });
        }}
      >
        <Card style={styles.clinicCard}>
          <LinearGradient
            colors={['rgba(0, 212, 255, 0.05)', 'rgba(0, 31, 63, 0.02)']}
            style={styles.cardGradient}
          >
            {/* Clinic Header */}
            <View style={styles.clinicHeader}>
              <View style={styles.clinicInfo}>
                <View style={styles.logoContainer}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.logoGradient}
                  >
                    <Building2 color="white" size={24} />
                  </LinearGradient>
                </View>
                <View style={styles.clinicDetails}>
                  <Text style={styles.clinicName}>{clinic.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Star color="#FFD700" size={14} fill="#FFD700" />
                    <Text style={styles.ratingText}>{clinic.rating || 4.5}</Text>
                    <Text style={styles.reviewCount}>({clinic.review_count || 124})</Text>
                  </View>
                </View>
              </View>

              <View style={styles.verifiedSection}>
                <View style={styles.verifiedBadge}>
                  <Star color="#4CD964" size={12} fill="#4CD964" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
                <ChevronRight color="#999" size={18} />
              </View>
            </View>

            {/* Clinic Description */}
            {clinic.description && (
              <Text style={styles.clinicDescription} numberOfLines={2}>
                {clinic.description}
              </Text>
            )}

            {/* Location & Info */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <MapPin color="#00D4FF" size={16} />
                <Text style={styles.infoText}>
                  {clinic.city}, {clinic.country}
                </Text>
              </View>

              {clinic.wait_time && (
                <View style={styles.infoRow}>
                  <Clock color={getWaitTimeColor(clinic.wait_time)} size={16} />
                  <Text style={[styles.infoText, { color: getWaitTimeColor(clinic.wait_time) }]}>
                    {clinic.wait_time} wait
                  </Text>
                </View>
              )}
            </View>

            {/* Specialties */}
            {clinic.specialties && clinic.specialties.length > 0 && (
              <View style={styles.specialtiesContainer}>
                {clinic.specialties.slice(0, 3).map((specialty, index) => (
                  <LinearGradient
                    key={index}
                    colors={['rgba(0, 212, 255, 0.1)', 'rgba(0, 31, 63, 0.05)']}
                    style={styles.specialtyBadge}
                  >
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </LinearGradient>
                ))}
                {clinic.specialties.length > 3 && (
                  <Text style={styles.moreText}>+{clinic.specialties.length - 3} more</Text>
                )}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleCall(clinic.phone)}
              >
                <LinearGradient
                  colors={['#00D4FF', '#00A8CC']}
                  style={styles.buttonGradient}
                >
                  <Phone color="white" size={18} />
                  <Text style={styles.actionButtonText}>Call Now</Text>
                </LinearGradient>
              </TouchableOpacity>

              {clinic.email && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.emailButton]}
                  onPress={() => handleEmail(clinic.email!)}
                >
                  <Mail color="#00D4FF" size={18} />
                  <Text style={[styles.actionButtonText, styles.emailButtonText]}>Email</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
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
          <Text style={styles.title}>Partner Clinics</Text>
          <Text style={styles.subtitle}>
            Find trusted healthcare providers near you
          </Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              transform: [
                {
                  scale: searchAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.02]
                  })
                }
              ]
            }
          ]}
        >
          <View style={styles.searchBar}>
            <Search color="#999" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search clinics, specialties, locations..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Filter color="#00D4FF" size={20} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive
              ]}
              onPress={() => {
                setSelectedFilter(filter.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Clinics List */}
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
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredClinics.length} {filteredClinics.length === 1 ? 'Clinic' : 'Clinics'} Found
          </Text>
          <Text style={styles.resultsSubtitle}>
            {selectedFilter !== 'all' ? `Filtered by ${FILTERS.find(f => f.id === selectedFilter)?.label}` : 'All verified clinics'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading trusted clinics...</Text>
          </View>
        ) : filteredClinics.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Building2 color="#999" size={48} />
            <Text style={styles.emptyTitle}>No Clinics Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No clinics available in your area at the moment'
              }
            </Text>
          </Card>
        ) : (
          filteredClinics.map((clinic, index) => renderClinicCard(clinic, index))
        )}

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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
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
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    marginRight: 8,
  },
  filterButton: {
    padding: 4,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: 'white',
  },
  filterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#00D4FF',
  },
  content: {
    flex: 1,
    marginTop: -10,
  },
  resultsHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  resultsCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  clinicCard: {
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
  clinicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clinicInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  logoContainer: {
    marginRight: 12,
  },
  logoGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  clinicDetails: {
    flex: 1,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  verifiedSection: {
    alignItems: 'flex-end',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 217, 100, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  verifiedText: {
    color: '#4CD964',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  clinicDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  specialtyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    fontSize: 12,
    color: '#00D4FF',
    fontWeight: '600',
  },
  moreText: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'center',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  emailButton: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  emailButtonText: {
    color: '#00D4FF',
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
  },
  bottomSpacer: {
    height: 40,
  },
});
