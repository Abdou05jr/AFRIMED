// ==================== CORE ENUMS & TYPES ====================

export type ScanType = 'brain' | 'heart' | 'eye' | 'chest' | 'abdominal' | 'musculoskeletal';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type DonationStatus = 'pending' | 'under_review' | 'verified' | 'funded' | 'completed' | 'rejected' | 'cancelled';
export type VerificationStatus = 'unverified' | 'under_review' | 'verified' | 'rejected' | 'requires_more_info';
export type ConsultationStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type Currency = 'HBAR' | 'USDC' | 'USD' | 'EUR' | 'GBP' | 'NGN' | 'KES' | 'GHS' | 'ZAR';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
export type UserRole = 'patient' | 'doctor' | 'admin' | 'verifier' | 'support';

// ==================== VALIDATION & UTILITY TYPES ====================

export type Email = string & { readonly _brand: unique symbol };
export type PhoneNumber = string & { readonly _brand: unique symbol };
export type WalletAddress = string & { readonly _brand: unique symbol };
export type LicenseNumber = string & { readonly _brand: unique symbol };
export type MedicalRecordNumber = string & { readonly _brand: unique symbol };

// ==================== CORE INTERFACES ====================

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Timestamped {
  created_at: string;
  updated_at: string;
}

export interface SoftDeletable {
  deleted_at?: string;
}

// ==================== USER & PROFILE TYPES ====================

export interface Profile extends BaseEntity {
  id: string;
  email: Email;
  full_name: string;
  phone?: PhoneNumber;
  date_of_birth?: string;
  gender?: Gender;
  blood_type?: BloodType;
  marital_status?: MaritalStatus;
  country: string;
  state?: string;
  city?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: PhoneNumber;
  emergency_contact_relationship?: string;
  wallet_address?: WalletAddress;
  avatar_url?: string;
  role: UserRole;
  is_admin: boolean;
  is_verified: boolean;
  is_active: boolean;
  last_login_at?: string;
  preferences?: UserPreferences;
  medical_history_summary?: string;
}

export interface UserPreferences {
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    share_medical_data: boolean;
    anonymous_donations: boolean;
    show_profile: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}

// ==================== MEDICAL SCAN TYPES ====================

export interface MedicalScan extends BaseEntity {
  id: string;
  user_id: string;
  scan_type: ScanType;
  image_url: string;
  thumbnail_url?: string;
  original_filename: string;
  file_size: number;
  image_dimensions?: {
    width: number;
    height: number;
  };
  
  // AI Analysis Results
  ai_confidence_score: number;
  detected_condition: string;
  condition_code?: string; // ICD-10 code or similar
  risk_level: RiskLevel;
  recommendation: string;
  findings: MedicalFinding[];
  probability: number;
  severity: 'mild' | 'moderate' | 'severe';
  urgency: 'routine' | 'urgent' | 'emergency';
  
  // Technical Details
  heatmap_url?: string;
  model_version: string;
  processing_time?: number;
  quality_score?: number;
  
  // Metadata
  scan_date?: string;
  body_part?: string;
  notes?: string;
  tags?: string[];
  
  // Relations
  consultations?: Consultation[];
}

export interface MedicalFinding {
  id: string;
  scan_id: string;
  finding: string;
  confidence: number;
  location?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  severity: 'mild' | 'moderate' | 'severe';
  category: string;
  description?: string;
  created_at: string;
}

// ==================== DONATION SYSTEM TYPES ====================

export interface DonationRequest extends BaseEntity {
  id: string;
  user_id: string;
  title: string;
  description: string;
  medical_condition: string;
  hospital_name?: string;
  doctor_name?: string;
  treatment_plan?: string;
  timeline?: string;
  
  // Financial Information
  amount_needed: number;
  amount_raised: number;
  currency: Currency;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  
  // Status & Verification
  status: DonationStatus;
  verification_status: VerificationStatus;
  verifier_id?: string;
  verification_notes?: string;
  verification_date?: string;
  
  // Supporting Documents
  hospital_bill_url?: string;
  prescription_url?: string;
  diagnosis_url?: string;
  medical_reports_url?: string;
  identification_url?: string;
  
  // Blockchain Integration
  hedera_transaction_id?: string;
  smart_contract_address?: string;
  
  // Metadata
  tags?: string[];
  is_urgent: boolean;
  featured_until?: string;
  
  // Relations
  donations?: Donation[];
  updates?: DonationUpdate[];
}

export interface Donation extends BaseEntity {
  id: string;
  donation_request_id: string;
  donor_id?: string;
  donor_name?: string; // For anonymous donations
  donor_email?: Email;
  
  // Transaction Details
  amount: number;
  currency: Currency;
  service_fee: number;
  network_fee: number;
  total_amount: number;
  
  // Blockchain Integration
  hedera_transaction_hash?: string;
  hedera_transaction_id?: string;
  blockchain_confirmed: boolean;
  confirmation_count?: number;
  
  // Donor Preferences
  is_anonymous: boolean;
  show_amount: boolean;
  message?: string;
  
  // Status
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}

export interface DonationUpdate extends BaseEntity {
  id: string;
  donation_request_id: string;
  title: string;
  content: string;
  media_urls?: string[];
  is_public: boolean;
  created_by: string; // user_id or system
}

// ==================== HEALTHCARE FACILITY TYPES ====================

export interface Clinic extends BaseEntity {
  id: string;
  name: string;
  description?: string;
  
  // Contact Information
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  phone: PhoneNumber;
  email?: Email;
  website?: string;
  
  // Location
  latitude?: number;
  longitude?: number;
  timezone: string;
  
  // Medical Information
  specialties: string[];
  services: string[];
  accreditation?: string[];
  emergency_services: boolean;
  bed_count?: number;
  
  // Status & Verification
  is_verified: boolean;
  verification_date?: string;
  is_active: boolean;
  
  // Media
  logo_url?: string;
  gallery_urls?: string[];
  
  // Operating Hours
  operating_hours: OperatingHours[];
  
  // Relations
  doctors?: Doctor[];
  reviews?: ClinicReview[];
}

export interface OperatingHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  opens: string; // HH:MM format
  closes: string; // HH:MM format
  is_closed: boolean;
}

export interface ClinicReview extends BaseEntity {
  id: string;
  clinic_id: string;
  user_id: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  is_verified: boolean;
  would_recommend: boolean;
}

// ==================== MEDICAL PROFESSIONAL TYPES ====================

export interface Doctor extends BaseEntity {
  id: string;
  clinic_id: string;
  user_id?: string;
  
  // Personal Information
  full_name: string;
  title?: string; // Dr., Prof., etc.
  bio?: string;
  photo_url?: string;
  
  // Professional Information
  specialty: string;
  sub_specialties?: string[];
  license_number: LicenseNumber;
  years_of_experience?: number;
  education: Education[];
  certifications: Certification[];
  
  // Contact Information
  phone: PhoneNumber;
  email: Email;
  
  // Availability & Pricing
  is_available: boolean;
  consultation_fee?: number;
  currency: Currency;
  availability_slots: AvailabilitySlot[];
  
  // Status
  is_verified: boolean;
  verification_date?: string;
  is_active: boolean;
  
  // Ratings
  average_rating?: number;
  review_count: number;
  
  // Relations
  consultations?: Consultation[];
  reviews?: DoctorReview[];
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
  country: string;
}

export interface Certification {
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
}

export interface AvailabilitySlot {
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  is_recurring: boolean;
}

export interface DoctorReview extends BaseEntity {
  id: string;
  doctor_id: string;
  user_id: string;
  rating: number; // 1-5
  wait_time_rating?: number;
  bedside_manner_rating?: number;
  expertise_rating?: number;
  title?: string;
  comment: string;
  is_anonymous: boolean;
}

// ==================== CONSULTATION & APPOINTMENT TYPES ====================

export interface Consultation extends BaseEntity {
  id: string;
  user_id: string;
  doctor_id: string;
  clinic_id?: string;
  scan_id?: string;
  
  // Appointment Details
  status: ConsultationStatus;
  type: 'in_person' | 'video' | 'phone' | 'chat';
  scheduled_at: string;
  duration: number; // in minutes
  timezone: string;
  
  // Clinical Information
  reason_for_visit: string;
  symptoms?: string;
  medical_history_notes?: string;
  pre_consultation_notes?: string;
  
  // Consultation Results
  diagnosis?: string;
  prescription?: Prescription;
  recommendations?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  
  // Technical Details
  meeting_url?: string;
  meeting_id?: string;
  recording_url?: string;
  
  // Payment
  consultation_fee: number;
  currency: Currency;
  payment_status: 'pending' | 'paid' | 'refunded' | 'cancelled';
  payment_transaction_id?: string;
  
  // Feedback
  patient_feedback?: ConsultationFeedback;
  doctor_notes?: string;
}

export interface Prescription {
  medications: Medication[];
  instructions: string;
  valid_until: string;
  prescribing_doctor: string;
  issued_date: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  generic_available: boolean;
}

export interface ConsultationFeedback {
  rating: number;
  wait_time_rating?: number;
  communication_rating?: number;
  overall_experience_rating?: number;
  comments?: string;
  would_recommend: boolean;
}

// ==================== AI MODEL MANAGEMENT TYPES ====================

export interface ModelVersion extends BaseEntity {
  id: string;
  model_type: ScanType;
  version: string;
  description?: string;
  
  // Technical Specifications
  file_path: string;
  file_size: number;
  framework: 'tensorflow' | 'pytorch' | 'onnx';
  input_shape: number[];
  output_classes: string[];
  
  // Performance Metrics
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  inference_time?: number;
  
  // Deployment
  is_active: boolean;
  deployed_at?: string;
  deployed_by?: string;
  
  // Training Information
  training_data_size?: number;
  training_duration?: number;
  last_trained_at?: string;
  
  // Compliance
  fda_approved?: boolean;
  ce_certified?: boolean;
  data_privacy_compliant: boolean;
}

export interface ModelPerformance extends BaseEntity {
  id: string;
  model_version_id: string;
  scan_type: ScanType;
  total_predictions: number;
  correct_predictions: number;
  average_confidence: number;
  false_positives: number;
  false_negatives: number;
  date: string;
}

// ==================== NOTIFICATION & AUDIT TYPES ====================

export interface Notification extends BaseEntity {
  id: string;
  user_id: string;
  type: 'system' | 'donation' | 'consultation' | 'scan' | 'verification' | 'security';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface AuditLog extends BaseEntity {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  location?: string;
}

// ==================== TYPE GUARDS & VALIDATORS ====================

export const ScanTypes: ScanType[] = ['brain', 'heart', 'eye', 'chest', 'abdominal', 'musculoskeletal'];
export const RiskLevels: RiskLevel[] = ['low', 'medium', 'high', 'critical'];
export const Genders: Gender[] = ['male', 'female', 'other', 'prefer_not_to_say'];
export const BloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const Currencies: Currency[] = ['HBAR', 'USDC', 'USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR'];

export function isValidScanType(type: string): type is ScanType {
  return ScanTypes.includes(type as ScanType);
}

export function isValidRiskLevel(level: string): level is RiskLevel {
  return RiskLevels.includes(level as RiskLevel);
}

export function isValidGender(gender: string): gender is Gender {
  return Genders.includes(gender as Gender);
}

// ==================== UTILITY TYPES ====================

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
};

export type FileUploadResponse = {
  url: string;
  path: string;
  size: number;
  type: string;
  uploaded_at: string;
};

// ==================== EVENT TYPES ====================

export type DonationEvent = {
  type: 'donation_received' | 'donation_verified' | 'donation_completed';
  donation_id: string;
  amount: number;
  currency: Currency;
  timestamp: string;
};

export type ScanEvent = {
  type: 'scan_uploaded' | 'scan_analyzed' | 'scan_shared';
  scan_id: string;
  scan_type: ScanType;
  risk_level: RiskLevel;
  timestamp: string;
};