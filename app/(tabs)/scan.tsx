import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Animated, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Brain, Heart, Eye, Camera, Upload, Zap, Scan, Shield, Activity } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ScanType } from '@/types/database';
import { aiModelService } from '@/services/aiModelService';
import { storageService } from '@/services/storageService';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

export default function ScanScreen() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<ScanType | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  const scanTypes = [
    { 
      type: 'brain' as ScanType, 
      label: 'Brain MRI', 
      icon: Brain, 
      color: '#00D4FF',
      gradient: ['#00D4FF', '#0099CC'],
      description: 'Neurological analysis'
    },
    { 
      type: 'heart' as ScanType, 
      label: 'Heart Scan', 
      icon: Heart, 
      color: '#FF0066',
      gradient: ['#FF0066', '#CC0052'],
      description: 'Cardiovascular assessment'
    },
    { 
      type: 'eye' as ScanType, 
      label: 'Eye Scan', 
      icon: Eye, 
      color: '#00FF88',
      gradient: ['#00FF88', '#00CC6A'],
      description: 'Ophthalmic examination'
    },
  ];

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      startPulseAnimation();
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      startPulseAnimation();
    }
  };

  const analyzeScan = async () => {
    if (!selectedType || !imageUri || !user) {
      Alert.alert('Error', 'Please select a scan type and upload an image');
      return;
    }

    setAnalyzing(true);

    try {
      const imageUrl = await storageService.uploadScanImage(user.id, selectedType, imageUri);
      const prediction = await aiModelService.analyzeScan(selectedType, imageUri);
      const heatmapUrl = await aiModelService.generateHeatmap(selectedType, imageUri);

      const { data: scanData, error } = await supabase
        .from('medical_scans')
        .insert({
          user_id: user.id,
          scan_type: selectedType,
          image_url: imageUrl,
          ai_confidence_score: prediction.confidence,
          detected_condition: prediction.condition,
          risk_level: prediction.riskLevel,
          recommendation: prediction.recommendation,
          heatmap_url: heatmapUrl,
          model_version: prediction.modelVersion,
        })
        .select()
        .single();

      if (error) throw error;

      router.push({
        pathname: '/(tabs)/scan-result',
        params: { scanId: scanData.id },
      });
    } catch (error) {
      console.error('Error analyzing scan:', error);
      Alert.alert('Analysis Error', 'Failed to analyze scan. Please try again with a clearer image.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSelectedTypeData = () => {
    return scanTypes.find(type => type.type === selectedType);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Gradient */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Zap color="#00D4FF" size={32} />
            <Text style={styles.title}>AI Medical Scan</Text>
          </View>
          <Text style={styles.subtitle}>
            Advanced AI-powered medical image analysis
          </Text>
        </View>
        <View style={styles.headerPattern} />
      </View>

      <View style={styles.content}>
        {/* Scan Type Selection */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Scan color="#00D4FF" size={20} />
            <Text style={styles.cardTitle}>SELECT SCAN TYPE</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Choose the type of medical scan you want to analyze
          </Text>
          <View style={styles.typeGrid}>
            {scanTypes.map(({ type, label, icon: Icon, color, gradient, description }) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeCard,
                  selectedType === type && [
                    styles.typeCardSelected,
                    { borderColor: color, shadowColor: color }
                  ],
                ]}
                onPress={() => setSelectedType(type)}
              >
                <View style={[
                  styles.typeIconContainer,
                  selectedType === type && { backgroundColor: `${color}20` }
                ]}>
                  <Icon 
                    color={selectedType === type ? color : '#8B9CB1'} 
                    size={36} 
                  />
                </View>
                <Text style={[
                  styles.typeLabel,
                  selectedType === type && { color }
                ]}>
                  {label}
                </Text>
                <Text style={styles.typeDescription}>
                  {description}
                </Text>
                {selectedType === type && (
                  <View style={[styles.selectionIndicator, { backgroundColor: color }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Image Upload Section */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Upload color="#00D4FF" size={20} />
            <Text style={styles.cardTitle}>UPLOAD IMAGE</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Upload a clear image of your medical scan for analysis
          </Text>

          {imageUri ? (
            <View style={styles.imagePreview}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageType}>
                    {getSelectedTypeData()?.label}
                  </Text>
                </View>
              </View>
              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={() => setImageUri(null)}
                >
                  <Text style={styles.changeButtonText}>Change Image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.analyzeButton}
                  onPress={analyzeScan}
                  disabled={analyzing}
                >
                  <Activity color="#FFFFFF" size={18} />
                  <Text style={styles.analyzeButtonText}>
                    {analyzing ? 'Analyzing...' : 'Analyze Now'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.uploadContainer}>
              <Animated.View style={[styles.uploadPlaceholder, { transform: [{ scale: pulseAnim }] }]}>
                <Scan color="#00D4FF" size={64} />
                <Text style={styles.uploadTitle}>Ready to Scan</Text>
                <Text style={styles.uploadDescription}>
                  Choose an image to begin AI analysis
                </Text>
              </Animated.View>
              
              <View style={styles.uploadButtons}>
                <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                  <View style={[styles.uploadIcon, { backgroundColor: '#FF006620' }]}>
                    <Camera color="#FF0066" size={24} />
                  </View>
                  <View style={styles.uploadText}>
                    <Text style={styles.uploadButtonTitle}>Take Photo</Text>
                    <Text style={styles.uploadButtonDescription}>Use camera</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.uploadDivider}>
                  <Text style={styles.uploadDividerText}>OR</Text>
                </View>

                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                  <View style={[styles.uploadIcon, { backgroundColor: '#00FF8820' }]}>
                    <Upload color="#00FF88" size={24} />
                  </View>
                  <View style={styles.uploadText}>
                    <Text style={styles.uploadButtonTitle}>Choose from Gallery</Text>
                    <Text style={styles.uploadButtonDescription}>Select existing image</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Card>

        {/* Requirements Card */}
        <Card style={styles.requirementsCard}>
          <View style={styles.cardHeader}>
            <Shield color="#FFB800" size={20} />
            <Text style={styles.cardTitle}>IMAGE REQUIREMENTS</Text>
          </View>
          <View style={styles.requirementsList}>
            <Text style={styles.requirement}>• High-quality, clear image</Text>
            <Text style={styles.requirement}>• Well-lit with good contrast</Text>
            <Text style={styles.requirement}>• Focus on the relevant area</Text>
            <Text style={styles.requirement}>• Minimum 1024x768 resolution</Text>
          </View>
        </Card>

        {/* Disclaimer */}
        <Card style={styles.disclaimer}>
          <View style={styles.disclaimerHeader}>
            <Shield color="#FFB800" size={18} />
            <Text style={styles.disclaimerTitle}>MEDICAL DISCLAIMER</Text>
          </View>
          <Text style={styles.disclaimerText}>
            This AI analysis is for informational purposes only and should not replace professional
            medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment.
            Results may vary and should be verified by medical professionals.
          </Text>
        </Card>

        {/* Analyze Button for when no image is selected */}
        {!imageUri && (
          <View style={styles.buttonContainer}>
            <Button
              title="Start Analysis"
              onPress={analyzeScan}
              disabled={!selectedType || !imageUri}
              loading={analyzing}
              size="large"
              icon="zap"
              style={styles.analyzeButtonLarge}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
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
    paddingTop: 24,
  },
  sectionCard: {
    marginHorizontal: 24,
    marginBottom: 20,
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
  sectionDescription: {
    fontSize: 14,
    color: '#8B9CB1',
    padding: 16,
    paddingTop: 0,
    paddingBottom: 20,
    lineHeight: 20,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#151A28',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  typeCardSelected: {
    backgroundColor: '#1A1F2E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  typeIconContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B9CB1',
    textAlign: 'center',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  uploadContainer: {
    padding: 16,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#151A28',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2D3748',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 14,
    color: '#8B9CB1',
    textAlign: 'center',
  },
  uploadButtons: {
    gap: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#151A28',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  uploadIcon: {
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  uploadText: {
    flex: 1,
  },
  uploadButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  uploadButtonDescription: {
    fontSize: 12,
    color: '#8B9CB1',
  },
  uploadDivider: {
    alignItems: 'center',
  },
  uploadDividerText: {
    color: '#8B9CB1',
    fontWeight: '600',
    fontSize: 12,
  },
  imagePreview: {
    padding: 16,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: '#151A28',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 212, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0A0F1C',
    letterSpacing: 1,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  changeButton: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D3748',
    alignItems: 'center',
  },
  changeButtonText: {
    color: '#8B9CB1',
    fontWeight: '600',
    fontSize: 16,
  },
  analyzeButton: {
    flex: 2,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#00D4FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  analyzeButtonText: {
    color: '#0A0F1C',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  requirementsCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  requirementsList: {
    padding: 16,
  },
  requirement: {
    fontSize: 14,
    color: '#FFB800',
    marginBottom: 8,
    fontWeight: '500',
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
  buttonContainer: {
    padding: 24,
    paddingTop: 0,
  },
  analyzeButtonLarge: {
    width: '100%',
  },
});
