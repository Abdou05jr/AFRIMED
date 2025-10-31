import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated, Dimensions } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ArrowLeft, Upload, FileText, DollarSign, AlertCircle, Shield, Heart, Calendar, User } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { storageService } from '@/services/storageService';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

interface DocumentInfo {
  name: string;
  uri: string;
  type: string;
  size: number;
}

export default function CreateDonationScreen() {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amountNeeded, setAmountNeeded] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [medicalCondition, setMedicalCondition] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [timeline, setTimeline] = useState('');

  const [hospitalBill, setHospitalBill] = useState<DocumentInfo | null>(null);
  const [prescription, setPrescription] = useState<DocumentInfo | null>(null);
  const [diagnosis, setDiagnosis] = useState<DocumentInfo | null>(null);
  const [medicalReports, setMedicalReports] = useState<DocumentInfo | null>(null);

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const fadeAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const pickDocument = async (type: 'bill' | 'prescription' | 'diagnosis' | 'reports') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const documentInfo: DocumentInfo = {
          name: file.name,
          uri: file.uri,
          type: file.mimeType || 'application/octet-stream',
          size: file.size || 0,
        };

        switch (type) {
          case 'bill':
            setHospitalBill(documentInfo);
            break;
          case 'prescription':
            setPrescription(documentInfo);
            break;
          case 'diagnosis':
            setDiagnosis(documentInfo);
            break;
          case 'reports':
            setMedicalReports(documentInfo);
            break;
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const pickImage = async (type: 'bill' | 'prescription' | 'diagnosis' | 'reports') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        const documentInfo: DocumentInfo = {
          name: `medical_${type}_${Date.now()}.jpg`,
          uri: image.uri,
          type: 'image/jpeg',
          size: 0,
        };

        switch (type) {
          case 'bill':
            setHospitalBill(documentInfo);
            break;
          case 'prescription':
            setPrescription(documentInfo);
            break;
          case 'diagnosis':
            setDiagnosis(documentInfo);
            break;
          case 'reports':
            setMedicalReports(documentInfo);
            break;
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const getFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1048576).toFixed(1)} MB`;
  };

  const handleSubmit = async () => {
    if (!title || !description || !amountNeeded || !medicalCondition) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a donation request');
      return;
    }

    setLoading(true);

    try {
      // Upload documents if available
      let hospitalBillUrl = null;
      let prescriptionUrl = null;
      let diagnosisUrl = null;
      let medicalReportsUrl = null;

      if (hospitalBill) {
        hospitalBillUrl = await storageService.uploadDocument(user.id, 'hospital_bills', hospitalBill.uri);
      }
      if (prescription) {
        prescriptionUrl = await storageService.uploadDocument(user.id, 'prescriptions', prescription.uri);
      }
      if (diagnosis) {
        diagnosisUrl = await storageService.uploadDocument(user.id, 'diagnosis', diagnosis.uri);
      }
      if (medicalReports) {
        medicalReportsUrl = await storageService.uploadDocument(user.id, 'medical_reports', medicalReports.uri);
      }

      const { data, error } = await supabase
        .from('donation_requests')
        .insert({
          user_id: user.id,
          title,
          description,
          medical_condition: medicalCondition,
          hospital_name: hospitalName,
          timeline: timeline,
          amount_needed: parseFloat(amountNeeded),
          amount_raised: 0,
          urgency_level: urgency,
          status: 'pending',
          verification_status: 'unverified',
          hospital_bill_url: hospitalBillUrl,
          prescription_url: prescriptionUrl,
          diagnosis_url: diagnosisUrl,
          medical_reports_url: medicalReportsUrl,
        })
        .select()
        .single();

      if (error) throw error;

      Alert.alert(
        'Request Submitted Successfully',
        'Your donation request has been submitted and is pending verification. You will be notified once it is approved.',
        [
          {
            text: 'View Status',
            onPress: () => router.push('/(tabs)/donation')
          },
          {
            text: 'Back to Home',
            onPress: () => router.push('/(tabs)'),
            style: 'default'
          }
        ]
      );
    } catch (error) {
      console.error('Error creating donation request:', error);
      Alert.alert('Submission Error', 'Failed to create donation request. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'low': return '#00FF88';
      case 'medium': return '#FFB800';
      case 'high': return '#FF0066';
      default: return '#00D4FF';
    }
  };

  const DocumentUploadSection = ({ title, description, document, onPickDocument, onPickImage }: any) => (
    <View style={styles.uploadSection}>
      <Text style={styles.uploadTitle}>{title}</Text>
      <Text style={styles.uploadDescription}>{description}</Text>

      {document ? (
        <View style={styles.documentPreview}>
          <FileText color="#00D4FF" size={20} />
          <View style={styles.documentInfo}>
            <Text style={styles.documentName}>{document.name}</Text>
            <Text style={styles.documentSize}>
              {getFileSize(document.size)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onPickDocument(null)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.uploadOptions}>
          <TouchableOpacity
            style={styles.uploadOption}
            onPress={() => onPickDocument()}
          >
            <Upload color="#00D4FF" size={20} />
            <Text style={styles.uploadOptionText}>Upload Document</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadOption}
            onPress={() => onPickImage()}
          >
            <FileText color="#00FF88" size={20} />
            <Text style={styles.uploadOptionText}>Upload Image</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Heart color="#FF0066" size={28} />
            <Text style={styles.title}>Request Medical Aid</Text>
          </View>
          <Text style={styles.subtitle}>Create a donation request for medical assistance</Text>
        </View>
        <View style={styles.headerPattern} />
      </View>

      <View style={styles.content}>
        {/* Progress Indicator */}
        <Card style={styles.progressCard}>
          <View style={styles.progressSteps}>
            <View style={[styles.progressStep, styles.progressStepActive]}>
              <Text style={styles.progressStepNumber}>1</Text>
              <Text style={styles.progressStepText}>Details</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <Text style={styles.progressStepNumber}>2</Text>
              <Text style={styles.progressStepText}>Documents</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <Text style={styles.progressStepNumber}>3</Text>
              <Text style={styles.progressStepText}>Review</Text>
            </View>
          </View>
        </Card>

        {/* Basic Information */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <User color="#00D4FF" size={20} />
            <Text style={styles.cardTitle}>BASIC INFORMATION</Text>
          </View>

          <Input
            label="Request Title *"
            placeholder="Brief description of your medical need"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Input
            label="Medical Condition *"
            placeholder="Describe your medical condition"
            value={medicalCondition}
            onChangeText={setMedicalCondition}
            style={styles.input}
          />

          <Input
            label="Detailed Description *"
            placeholder="Provide detailed information about your situation and how the funds will help"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
          />

          <Input
            label="Hospital/Clinic Name"
            placeholder="Name of medical facility"
            value={hospitalName}
            onChangeText={setHospitalName}
            style={styles.input}
          />

          <Input
            label="Treatment Timeline"
            placeholder="Expected treatment duration"
            value={timeline}
            onChangeText={setTimeline}
            style={styles.input}
          />
        </Card>

        {/* Financial Information */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <DollarSign color="#00FF88" size={20} />
            <Text style={styles.cardTitle}>FINANCIAL INFORMATION</Text>
          </View>

          <Input
            label="Amount Needed (USD) *"
            placeholder="Enter the total amount required"
            value={amountNeeded}
            onChangeText={setAmountNeeded}
            keyboardType="numeric"
            style={styles.input}
          />

          <View style={styles.urgencySection}>
            <Text style={styles.urgencyLabel}>Urgency Level *</Text>
            <View style={styles.urgencyOptions}>
              {(['low', 'medium', 'high'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.urgencyOption,
                    urgency === level && [
                      styles.urgencyOptionSelected,
                      { borderColor: getUrgencyColor(level) }
                    ]
                  ]}
                  onPress={() => setUrgency(level)}
                >
                  <View style={[styles.urgencyDot, { backgroundColor: getUrgencyColor(level) }]} />
                  <Text style={[
                    styles.urgencyText,
                    urgency === level && { color: getUrgencyColor(level), fontWeight: '700' }
                  ]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Supporting Documents */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <FileText color="#FFB800" size={20} />
            <Text style={styles.cardTitle}>SUPPORTING DOCUMENTS</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Upload medical documents to verify your request. This increases trust and approval chances.
          </Text>

          <DocumentUploadSection
            title="Hospital Bill"
            description="Upload hospital bills and cost estimates"
            document={hospitalBill}
            onPickDocument={() => pickDocument('bill')}
            onPickImage={() => pickImage('bill')}
          />

          <DocumentUploadSection
            title="Medical Prescription"
            description="Doctor's prescription and treatment plan"
            document={prescription}
            onPickDocument={() => pickDocument('prescription')}
            onPickImage={() => pickImage('prescription')}
          />

          <DocumentUploadSection
            title="Diagnosis Report"
            description="Official diagnosis from medical professional"
            document={diagnosis}
            onPickDocument={() => pickDocument('diagnosis')}
            onPickImage={() => pickImage('diagnosis')}
          />

          <DocumentUploadSection
            title="Additional Medical Reports"
            description="Lab results, scan reports, etc."
            document={medicalReports}
            onPickDocument={() => pickDocument('reports')}
            onPickImage={() => pickImage('reports')}
          />
        </Card>

        {/* Verification Info */}
        <Card style={styles.verificationCard}>
          <View style={styles.cardHeader}>
            <Shield color="#FFB800" size={20} />
            <Text style={styles.cardTitle}>VERIFICATION PROCESS</Text>
          </View>
          <View style={styles.verificationContent}>
            <View style={styles.verificationStep}>
              <View style={styles.stepNumber}>1</View>
              <Text style={styles.stepText}>Submit your request with supporting documents</Text>
            </View>
            <View style={styles.verificationStep}>
              <View style={styles.stepNumber}>2</View>
              <Text style={styles.stepText}>Our team reviews and verifies your information</Text>
            </View>
            <View style={styles.verificationStep}>
              <View style={styles.stepNumber}>3</View>
              <Text style={styles.stepText}>Approved requests become visible to donors</Text>
            </View>
            <View style={styles.verificationStep}>
              <View style={styles.stepNumber}>4</View>
              <Text style={styles.stepText}>Receive donations and provide updates</Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Submit Request"
            onPress={handleSubmit}
            loading={loading}
            size="large"
            icon="heart"
            style={styles.submitButton}
            disabled={!title || !description || !amountNeeded || !medicalCondition}
          />

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F3F',
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
    backgroundColor: '#002855',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'linear-gradient(45deg, #00D4FF 0%, #FFFFFF 100%)',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
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
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.8,
  },
  content: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  progressCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  progressStep: {
    alignItems: 'center',
    opacity: 0.5,
  },
  progressStepActive: {
    opacity: 1,
  },
  progressStepNumber: {
    width: 32,
    height: 32,
    backgroundColor: '#E5E7EB',
    backgroundColor: '#2D3748',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 14,
    color: '#000000',
    color: '#8B9CB1',
    marginBottom: 4,
  },
  progressStepText: {
    color: '#000000',
    color: '#8B9CB1',
    fontWeight: '600',
  },
  progressLine: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    backgroundColor: '#2D3748',
    marginHorizontal: 8,
  },
  sectionCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
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
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  urgencySection: {
    marginTop: 8,
  },
  urgencyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  urgencyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  urgencyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#151A28',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  urgencyOptionSelected: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  urgencyText: {
    fontSize: 14,
    color: '#8B9CB1',
    fontWeight: '600',
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  uploadDescription: {
    fontSize: 12,
    color: '#8B9CB1',
    marginBottom: 12,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#151A28',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D3748',
    gap: 8,
  },
  uploadOptionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  documentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00D4FF',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  documentSize: {
    fontSize: 12,
    color: '#8B9CB1',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeButtonText: {
    color: '#FF0066',
    fontSize: 12,
    fontWeight: '600',
  },
  verificationCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  verificationContent: {
    padding: 16,
  },
  verificationStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#FFB800',
    lineHeight: 20,
    fontWeight: '500',
  },
  actions: {
    paddingHorizontal: 24,
    gap: 12,
  },
  submitButton: {
    width: '100%',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8B9CB1',
    fontSize: 16,
    fontWeight: '600',
  },
});
