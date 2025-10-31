import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { AlertCircle, CheckCircle, AlertTriangle, XCircle, ArrowLeft, Zap, Activity, Brain, Shield } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { MedicalScan } from '@/types/database';
import { LoadingScreen } from '@/components/LoadingScreen';

const { width } = Dimensions.get('window');

export default function ScanResultScreen() {
  const { scanId } = useLocalSearchParams<{ scanId: string }>();
  const [scan, setScan] = useState<MedicalScan | null>(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    fetchScanResult();
  }, [scanId]);

  useEffect(() => {
    if (!loading && scan) {
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
    }
  }, [loading, scan]);

  const fetchScanResult = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_scans')
        .select('*')
        .eq('id', scanId)
        .single();

      if (error) throw error;
      setScan(data);
    } catch (error) {
      console.error('Error fetching scan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = () => {
    switch (scan?.risk_level) {
      case 'low':
        return <CheckCircle color="#00FF88" size={52} />;
      case 'medium':
        return <AlertTriangle color="#FFB800" size={52} />;
      case 'high':
        return <AlertCircle color="#FF4444" size={52} />;
      case 'critical':
        return <XCircle color="#FF0066" size={52} />;
      default:
        return null;
    }
  };

  const getRiskColor = () => {
    switch (scan?.risk_level) {
      case 'low':
        return '#00FF88';
      case 'medium':
        return '#FFB800';
      case 'high':
        return '#FF4444';
      case 'critical':
        return '#FF0066';
      default:
        return '#999';
    }
  };

  const getRiskGradient = () => {
    switch (scan?.risk_level) {
      case 'low':
        return ['#00FF88', '#00CC6A'];
      case 'medium':
        return ['#FFB800', '#FF9500'];
      case 'high':
        return ['#FF4444', '#FF2D2D'];
      case 'critical':
        return ['#FF0066', '#CC0052'];
      default:
        return ['#666', '#999'];
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return '#00FF88';
    if (score >= 0.6) return '#FFB800';
    return '#FF4444';
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!scan) {
    return (
      <View style={styles.errorContainer}>
        <Zap color="#666" size={64} />
        <Text style={styles.errorText}>Scan not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.errorButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Gradient */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Zap color="#00D4FF" size={28} />
          <Text style={styles.title}>Scan Results</Text>
        </View>
        <View style={styles.headerPattern} />
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Scan Image with Modern Card */}
        <Card style={styles.imageCard}>
          <View style={styles.cardHeader}>
            <Activity color="#00D4FF" size={20} />
            <Text style={styles.cardTitle}>Medical Scan</Text>
          </View>
          <Image source={{ uri: scan.image_url }} style={styles.scanImage} />
          <View style={styles.imageOverlay}>
            <Text style={styles.imageLabel}>{scan.scan_type.toUpperCase()} SCAN</Text>
          </View>
        </Card>

        {/* Risk Assessment with Gradient */}
        <Card style={styles.riskCard}>
          <View style={[styles.riskGradient, {
            backgroundColor: getRiskGradient()[0],
            shadowColor: getRiskColor()
          }]} />
          <View style={styles.riskHeader}>
            <View style={styles.riskIconContainer}>
              {getRiskIcon()}
              <View style={[styles.riskPulse, { backgroundColor: getRiskColor() }]} />
            </View>
            <View style={styles.riskInfo}>
              <Text style={styles.riskLabel}>AI RISK ASSESSMENT</Text>
              <Text style={[styles.riskLevel, { color: getRiskColor() }]}>
                {scan.risk_level?.toUpperCase()}
              </Text>
              <View style={styles.riskBar}>
                <View
                  style={[
                    styles.riskProgress,
                    {
                      width: `${(scan.ai_confidence_score || 0) * 100}%`,
                      backgroundColor: getRiskColor()
                    }
                  ]}
                />
              </View>
            </View>
          </View>
        </Card>

        {/* AI Analysis Section */}
        <Card style={styles.analysisCard}>
          <View style={styles.cardHeader}>
            <Brain color="#00D4FF" size={20} />
            <Text style={styles.cardTitle}>AI ANALYSIS</Text>
          </View>

          <View style={styles.analysisGrid}>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Scan Type</Text>
              <Text style={styles.analysisValue}>{scan.scan_type.toUpperCase()}</Text>
            </View>

            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Confidence Score</Text>
              <View style={styles.confidenceContainer}>
                <Text style={[
                  styles.confidenceValue,
                  { color: getConfidenceColor(scan.ai_confidence_score || 0) }
                ]}>
                  {((scan.ai_confidence_score || 0) * 100).toFixed(1)}%
                </Text>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceFill,
                      {
                        width: `${(scan.ai_confidence_score || 0) * 100}%`,
                        backgroundColor: getConfidenceColor(scan.ai_confidence_score || 0)
                      }
                    ]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Model Version</Text>
              <View style={styles.modelContainer}>
                <Shield color="#00D4FF" size={16} />
                <Text style={styles.modelValue}>{scan.model_version}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Detected Condition */}
        {scan.detected_condition && (
          <Card style={styles.conditionCard}>
            <View style={styles.cardHeader}>
              <AlertCircle color="#FFB800" size={20} />
              <Text style={styles.cardTitle}>DETECTED CONDITION</Text>
            </View>
            <View style={styles.conditionContent}>
              <Text style={styles.conditionText}>{scan.detected_condition}</Text>
            </View>
          </Card>
        )}

        {/* Recommendation */}
        {scan.recommendation && (
          <Card style={styles.recommendationCard}>
            <View style={styles.cardHeader}>
              <CheckCircle color="#00FF88" size={20} />
              <Text style={styles.cardTitle}>RECOMMENDATION</Text>
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationText}>{scan.recommendation}</Text>
            </View>
          </Card>
        )}

        {/* Heatmap */}
        {scan.heatmap_url && (
          <Card style={styles.heatmapCard}>
            <View style={styles.cardHeader}>
              <Activity color="#FF0066" size={20} />
              <Text style={styles.cardTitle}>ATTENTION HEATMAP</Text>
            </View>
            <Image source={{ uri: scan.heatmap_url }} style={styles.heatmapImage} />
            <View style={styles.heatmapOverlay}>
              <Text style={styles.heatmapLabel}>AI FOCUS AREAS</Text>
            </View>
            <Text style={styles.heatmapCaption}>
              Highlighted areas indicate regions of interest detected by the AI model
            </Text>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Book Consultation"
            onPress={() => router.push('/(tabs)/clinics')}
            variant="primary"
            style={styles.actionButton}
            icon="calendar"
          />
          <Button
            title="New Scan"
            onPress={() => router.push('/(tabs)/scan')}
            variant="outline"
            style={styles.actionButton}
            icon="zap"
          />
        </View>

        {/* Disclaimer */}
        <Card style={styles.disclaimer}>
          <View style={styles.disclaimerHeader}>
            <Shield color="#FFB800" size={18} />
            <Text style={styles.disclaimerTitle}>IMPORTANT NOTICE</Text>
          </View>
          <Text style={styles.disclaimerText}>
            This AI analysis is for informational purposes only. Please consult with a qualified
            healthcare professional for proper diagnosis and treatment.
          </Text>
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  header: {
    height: 160,
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 12,
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  content: {
    paddingTop: 24,
  },
  imageCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#1A1F2E',
    borderWidth: 1,
    borderColor: '#2D3748',
    overflow: 'hidden',
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
  scanImage: {
    width: '100%',
    height: 280,
    resizeMode: 'contain',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 212, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A0F1C',
    letterSpacing: 1,
  },
  riskCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#1A1F2E',
    borderWidth: 1,
    borderColor: '#2D3748',
    overflow: 'hidden',
    position: 'relative',
  },
  riskGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  riskIconContainer: {
    position: 'relative',
    marginRight: 20,
  },
  riskPulse: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.6,
  },
  riskInfo: {
    flex: 1,
  },
  riskLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B9CB1',
    marginBottom: 8,
    letterSpacing: 1,
  },
  riskLevel: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textShadowColor: 'rgba(255,255,255,0.1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  riskBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  riskProgress: {
    height: '100%',
    borderRadius: 3,
  },
  analysisCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  analysisGrid: {
    padding: 16,
  },
  analysisItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  analysisLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  confidenceContainer: {
    alignItems: 'flex-end',
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  confidenceBar: {
    width: 80,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  modelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modelValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 6,
  },
  conditionCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  conditionContent: {
    padding: 16,
  },
  conditionText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    fontWeight: '500',
  },
  recommendationCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  recommendationContent: {
    padding: 16,
  },
  recommendationText: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 22,
    fontWeight: '500',
  },
  heatmapCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  heatmapImage: {
    width: '100%',
    height: 280,
    resizeMode: 'contain',
  },
  heatmapOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 0, 102, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heatmapLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  heatmapCaption: {
    fontSize: 12,
    color: '#6C757D',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
    paddingTop: 0,
  },
  actions: {
    padding: 24,
    gap: 16,
  },
  actionButton: {
    width: '100%',
  },
  disclaimer: {
    marginHorizontal: 24,
    marginBottom: 40,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 184, 0, 0.3)',
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFB800',
    marginLeft: 8,
    letterSpacing: 1,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#FFB800',
    lineHeight: 20,
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#001F3F',
  },
  errorText: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 24,
    marginTop: 16,
    fontWeight: '600',
    opacity: 0.8,
  },
  errorButton: {
    width: '100%',
  },
});
