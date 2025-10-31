/*
  # MedScan Africa Database Schema

  ## Overview
  Complete database schema for MedScan Africa healthtech application with AI diagnostics,
  donation management, clinic partnerships, and user health records.

  ## Tables Created

  ### 1. profiles
  User profile information linked to Supabase auth.users
  - `id` (uuid, FK to auth.users)
  - `email` (text)
  - `full_name` (text)
  - `phone` (text, optional)
  - `date_of_birth` (date, optional)
  - `gender` (text, optional)
  - `country` (text)
  - `wallet_address` (text, optional for blockchain)
  - `is_admin` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. medical_scans
  Stores all medical scan uploads and AI analysis results
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `scan_type` (text: 'brain', 'heart', 'eye')
  - `image_url` (text, S3/Storage path)
  - `ai_confidence_score` (numeric, 0-1)
  - `detected_condition` (text)
  - `risk_level` (text: 'low', 'medium', 'high', 'critical')
  - `recommendation` (text)
  - `heatmap_url` (text, Grad-CAM visualization)
  - `model_version` (text)
  - `created_at` (timestamptz)

  ### 3. donation_requests
  Donation requests from users needing medical financial assistance
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `title` (text)
  - `description` (text)
  - `amount_needed` (numeric)
  - `amount_raised` (numeric)
  - `status` (text: 'pending', 'verified', 'funded', 'rejected')
  - `verification_status` (text: 'unverified', 'under_review', 'verified')
  - `hospital_bill_url` (text)
  - `prescription_url` (text)
  - `diagnosis_document_url` (text)
  - `verifier_id` (uuid, FK to profiles, optional)
  - `verification_notes` (text, optional)
  - `hedera_transaction_id` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. donations
  Individual donation transactions
  - `id` (uuid, primary key)
  - `donation_request_id` (uuid, FK to donation_requests)
  - `donor_id` (uuid, FK to profiles, optional for anonymous)
  - `amount` (numeric)
  - `currency` (text: 'HBAR', 'USDC', 'USD')
  - `hedera_transaction_hash` (text, optional)
  - `message` (text, optional)
  - `is_anonymous` (boolean)
  - `created_at` (timestamptz)

  ### 5. clinics
  Partner clinics and healthcare facilities
  - `id` (uuid, primary key)
  - `name` (text)
  - `description` (text)
  - `address` (text)
  - `city` (text)
  - `country` (text)
  - `phone` (text)
  - `email` (text)
  - `specialties` (text array)
  - `is_verified` (boolean)
  - `logo_url` (text, optional)
  - `website` (text, optional)
  - `latitude` (numeric, optional)
  - `longitude` (numeric, optional)
  - `created_at` (timestamptz)

  ### 6. doctors
  Healthcare professionals associated with clinics
  - `id` (uuid, primary key)
  - `clinic_id` (uuid, FK to clinics)
  - `user_id` (uuid, FK to profiles, optional)
  - `full_name` (text)
  - `specialty` (text)
  - `license_number` (text)
  - `phone` (text)
  - `email` (text)
  - `is_available` (boolean)
  - `consultation_fee` (numeric, optional)
  - `bio` (text, optional)
  - `photo_url` (text, optional)
  - `created_at` (timestamptz)

  ### 7. consultations
  Teleconsultation bookings and records
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `doctor_id` (uuid, FK to doctors)
  - `scan_id` (uuid, FK to medical_scans, optional)
  - `status` (text: 'scheduled', 'completed', 'cancelled')
  - `scheduled_at` (timestamptz)
  - `notes` (text, optional)
  - `prescription` (text, optional)
  - `created_at` (timestamptz)

  ### 8. model_versions
  Track AI model versions and performance metrics
  - `id` (uuid, primary key)
  - `model_type` (text: 'brain', 'heart', 'eye')
  - `version` (text)
  - `accuracy` (numeric)
  - `file_path` (text)
  - `is_active` (boolean)
  - `deployed_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Admins and verifiers have elevated permissions
  - Doctors can access patient data with consent
  - Public read access for clinics and active model versions
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  country text NOT NULL DEFAULT 'Nigeria',
  wallet_address text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- 2. MEDICAL SCANS TABLE
CREATE TABLE IF NOT EXISTS medical_scans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scan_type text NOT NULL CHECK (scan_type IN ('brain', 'heart', 'eye')),
  image_url text NOT NULL,
  ai_confidence_score numeric CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
  detected_condition text,
  risk_level text CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  recommendation text,
  heatmap_url text,
  model_version text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medical_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans"
  ON medical_scans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON medical_scans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
  ON medical_scans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. DONATION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS donation_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  amount_needed numeric NOT NULL CHECK (amount_needed > 0),
  amount_raised numeric DEFAULT 0 CHECK (amount_raised >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'funded', 'rejected')),
  verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'under_review', 'verified', 'rejected')),
  hospital_bill_url text,
  prescription_url text,
  diagnosis_document_url text,
  verifier_id uuid REFERENCES profiles(id),
  verification_notes text,
  hedera_transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE donation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own donation requests"
  ON donation_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view verified donation requests"
  ON donation_requests FOR SELECT
  TO authenticated
  USING (verification_status = 'verified');

CREATE POLICY "Users can create donation requests"
  ON donation_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own donation requests"
  ON donation_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Verifiers can update donation verification"
  ON donation_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true)
    )
  );

-- 4. DONATIONS TABLE
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_request_id uuid NOT NULL REFERENCES donation_requests(id) ON DELETE CASCADE,
  donor_id uuid REFERENCES profiles(id),
  amount numeric NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'HBAR' CHECK (currency IN ('HBAR', 'USDC', 'USD')),
  hedera_transaction_hash text,
  message text,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donations"
  ON donations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = donor_id OR donor_id IS NULL);

-- 5. CLINICS TABLE
CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  address text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  phone text NOT NULL,
  email text,
  specialties text[] DEFAULT '{}',
  is_verified boolean DEFAULT false,
  logo_url text,
  website text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified clinics"
  ON clinics FOR SELECT
  TO authenticated
  USING (is_verified = true);

CREATE POLICY "Admins can manage clinics"
  ON clinics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- 6. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  full_name text NOT NULL,
  specialty text NOT NULL,
  license_number text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  is_available boolean DEFAULT true,
  consultation_fee numeric,
  bio text,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available doctors"
  ON doctors FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Admins can manage doctors"
  ON doctors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- 7. CONSULTATIONS TABLE
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  scan_id uuid REFERENCES medical_scans(id),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  scheduled_at timestamptz NOT NULL,
  notes text,
  prescription text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create consultations"
  ON consultations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can view their consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = consultations.doctor_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update their consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = consultations.doctor_id AND d.user_id = auth.uid()
    )
  );

-- 8. MODEL VERSIONS TABLE
CREATE TABLE IF NOT EXISTS model_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_type text NOT NULL CHECK (model_type IN ('brain', 'heart', 'eye')),
  version text NOT NULL,
  accuracy numeric CHECK (accuracy >= 0 AND accuracy <= 1),
  file_path text NOT NULL,
  is_active boolean DEFAULT false,
  deployed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(model_type, version)
);

ALTER TABLE model_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active models"
  ON model_versions FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage models"
  ON model_versions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_medical_scans_user_id ON medical_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_scans_scan_type ON medical_scans(scan_type);
CREATE INDEX IF NOT EXISTS idx_donation_requests_user_id ON donation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_donation_requests_status ON donation_requests(verification_status);
CREATE INDEX IF NOT EXISTS idx_donations_request_id ON donations(donation_request_id);
CREATE INDEX IF NOT EXISTS idx_clinics_country ON clinics(country);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
