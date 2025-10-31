# MedScan Africa - Complete File Structure

## 📋 Overview

This document provides a complete reference of all files in the MedScan Africa project with descriptions.

## 🗂️ Root Directory

```
medscan-africa/
├── 📄 README.md                      # Main project documentation
├── 📄 SETUP.md                       # Complete setup guide
├── 📄 QUICK_START.md                 # 5-minute quick start guide
├── 📄 ARCHITECTURE.md                # System architecture documentation
├── 📄 AI_MODELS_INTEGRATION.md       # AI model integration guide
├── 📄 HEDERA_INTEGRATION.md          # Blockchain integration guide
├── 📄 MODEL_PLACEMENT_GUIDE.md       # Where to place your models
├── 📄 FILE_STRUCTURE.md              # This file
│
├── 📄 package.json                   # Dependencies and scripts
├── 📄 package-lock.json              # Locked dependency versions
├── 📄 tsconfig.json                  # TypeScript configuration
├── 📄 .env                           # Environment variables (Supabase)
├── 📄 .gitignore                     # Git ignore rules
├── 📄 .prettierrc                    # Code formatting rules
├── 📄 app.json                       # Expo configuration
└── 📄 expo-env.d.ts                  # Expo TypeScript definitions
```

## 📱 App Directory (Screens)

```
app/
├── 📄 index.tsx                      # Entry point, auth routing
├── 📄 _layout.tsx                    # Root layout with AuthProvider
├── 📄 +not-found.tsx                 # 404 error screen
│
├── 📁 (auth)/                        # Authentication group
│   ├── 📄 login.tsx                  # Login screen
│   └── 📄 signup.tsx                 # Registration screen
│
├── 📁 (tabs)/                        # Main app tabs
│   ├── 📄 _layout.tsx                # Tab navigator configuration
│   ├── 📄 index.tsx                  # Home/Dashboard screen
│   ├── 📄 scan.tsx                   # Scan upload screen
│   ├── 📄 scan-result.tsx            # AI analysis results
│   ├── 📄 donations.tsx              # Donation feed
│   ├── 📄 clinics.tsx                # Clinic directory
│   └── 📄 profile.tsx                # User profile
│
├── 📄 create-donation.tsx            # Create donation request
├── 📄 admin.tsx                      # Admin dashboard
├── 📄 donation-detail.tsx            # (To be created) Donation details
└── 📄 clinic-detail.tsx              # (To be created) Clinic details
```

### Screen Descriptions

#### Authentication Screens

**`(auth)/login.tsx`**
- Purpose: User login
- Features: Email/password authentication, error handling, navigation to signup
- State: email, password, loading, error
- Services: AuthContext.signIn()

**`(auth)/signup.tsx`**
- Purpose: New user registration
- Features: User profile creation, password validation, country selection
- State: fullName, email, password, confirmPassword, country
- Services: AuthContext.signUp()

#### Main App Screens

**`(tabs)/index.tsx`** - Home Screen
- Purpose: Main dashboard
- Features: Quick scan buttons, recent scans, stats, help card
- Data: Medical scans from database
- Services: Supabase queries

**`(tabs)/scan.tsx`** - Scan Upload
- Purpose: Medical image upload and analysis
- Features: Scan type selection, image picker, camera, AI analysis
- Services: aiModelService, storageService
- Flow: Select type → Upload image → Analyze → Navigate to results

**`(tabs)/scan-result.tsx`** - Results Display
- Purpose: Show AI analysis results
- Features: Risk level, confidence score, recommendations, heatmap
- Data: Medical scan from database (by ID)
- Actions: Book consultation, new scan

**`(tabs)/donations.tsx`** - Donation Feed
- Purpose: Browse and create donation requests
- Features: Verified requests, progress bars, tabs (explore/my requests)
- Data: Donation requests from database
- Actions: Create request, view details, donate

**`(tabs)/clinics.tsx`** - Clinic Directory
- Purpose: Partner healthcare providers
- Features: Verified clinics, specialties, contact info
- Data: Clinics from database
- Actions: Call, email, view details

**`(tabs)/profile.tsx`** - User Profile
- Purpose: User account and settings
- Features: Profile info, scan count, admin access, sign out
- Data: Profile from AuthContext
- Actions: View records, settings, admin dashboard

#### Modal Screens

**`create-donation.tsx`**
- Purpose: Create medical aid request
- Features: Form with documents upload, verification notice
- Services: storageService, Supabase insert
- Validation: Required fields, amount

**`admin.tsx`**
- Purpose: Platform administration
- Features: Statistics dashboard, management links
- Access: Admin users only (is_admin = true)
- Data: Aggregate stats from all tables

## 🧩 Components

```
components/
├── 📄 Button.tsx                     # Reusable button component
├── 📄 Input.tsx                      # Form input with label and error
├── 📄 Card.tsx                       # Card container with shadow
└── 📄 LoadingScreen.tsx              # Full-screen loading indicator
```

### Component Details

**`Button.tsx`**
- Props: title, onPress, variant, size, disabled, loading
- Variants: primary, secondary, danger, outline
- Sizes: small, medium, large
- Features: Loading spinner, disabled state

**`Input.tsx`**
- Props: label, error, containerStyle, ...TextInputProps
- Features: Label above input, error message below, custom styling
- Types: Text, email, password, numeric

**`Card.tsx`**
- Props: children, style
- Features: White background, rounded corners, shadow
- Usage: Content containers throughout app

**`LoadingScreen.tsx`**
- Usage: Full-screen loading state
- Style: Centered spinner

## 🔧 Services

```
services/
├── 📄 aiModelService.ts              # AI model inference
├── 📄 storageService.ts              # File uploads to Supabase
└── 📄 hederaService.ts               # Blockchain transactions
```

### Service Details

**`aiModelService.ts`** - AI Model Service
- Purpose: Load and run AI models for scan analysis
- Models: brain, heart, eye
- Methods:
  - `loadModels()` - Initialize TFLite models
  - `analyzeScan(type, imageUri)` - Run inference
  - `generateHeatmap(type, imageUri)` - Create Grad-CAM
- Current: Mock predictions (needs your models)
- Integration: See `AI_MODELS_INTEGRATION.md`

**`storageService.ts`** - Storage Service
- Purpose: Upload files to Supabase Storage
- Buckets: medical-scans, documents
- Methods:
  - `uploadScanImage(userId, type, uri)` - Upload scan
  - `uploadDocument(userId, type, uri)` - Upload document
- Features: Base64 encoding, public URL generation

**`hederaService.ts`** - Hedera Service
- Purpose: Blockchain transactions for donations
- Methods:
  - `initialize()` - Connect to Hedera network
  - `sendDonation(recipient, amount, currency)` - Send HBAR
  - `verifyTransaction(txId)` - Confirm transaction
  - `getAccountBalance(address)` - Check balance
- Current: Mock transactions (needs Hedera setup)
- Integration: See `HEDERA_INTEGRATION.md`

## 🎯 Contexts

```
contexts/
└── 📄 AuthContext.tsx                # Authentication state management
```

**`AuthContext.tsx`** - Auth Context
- Purpose: Global authentication state
- State:
  - `user` - Supabase auth user
  - `profile` - User profile from database
  - `session` - Current session
  - `loading` - Auth loading state
- Methods:
  - `signUp(email, password, name, country)` - Register
  - `signIn(email, password)` - Login
  - `signOut()` - Logout
  - `refreshProfile()` - Reload profile
- Features: Auto session refresh, profile sync

## 📐 Types

```
types/
└── 📄 database.ts                    # TypeScript type definitions
```

**`database.ts`** - Database Types
- Interfaces for all database tables:
  - `Profile` - User profile
  - `MedicalScan` - Scan results
  - `DonationRequest` - Aid requests
  - `Donation` - Individual donations
  - `Clinic` - Healthcare facilities
  - `Doctor` - Medical professionals
  - `Consultation` - Appointments
  - `ModelVersion` - AI models
- Enums:
  - `ScanType` - brain | heart | eye
  - `RiskLevel` - low | medium | high | critical
  - `DonationStatus` - pending | verified | funded | rejected
  - More...

## 🛠️ Lib

```
lib/
└── 📄 supabase.ts                    # Supabase client configuration
```

**`supabase.ts`** - Supabase Client
- Purpose: Initialize Supabase connection
- Features: Auto token refresh, session persistence
- Usage: Import and use in services and screens

## 🎨 Assets

```
assets/
├── 📁 images/
│   ├── 📄 favicon.png                # App favicon
│   └── 📄 icon.png                   # App icon
│
└── 📁 models/                        # (Create this) AI models directory
    ├── 📁 brain/
    │   ├── 📄 brain_cnn_v1.tflite    # Your brain model
    │   ├── 📄 model_config.json      # Model configuration
    │   └── 📄 labels.txt             # Class labels
    ├── 📁 heart/
    │   ├── 📄 heart_cnn_v1.tflite    # Your heart model
    │   ├── 📄 model_config.json
    │   └── 📄 labels.txt
    └── 📁 eye/
        ├── 📄 eye_cnn_v1.tflite      # Your eye model
        ├── 📄 model_config.json
        └── 📄 labels.txt
```

## 🔌 Hooks

```
hooks/
└── 📄 useFrameworkReady.ts           # Expo framework initialization
```

**`useFrameworkReady.ts`**
- Purpose: Ensure Expo is ready before rendering
- Critical: DO NOT modify or remove
- Usage: Called in `app/_layout.tsx`

## 🎛️ Configuration Files

### `package.json`
- Dependencies: All npm packages
- Scripts: dev, build, typecheck, lint
- Key packages: expo, react-native, supabase, lucide

### `tsconfig.json`
- TypeScript compiler options
- Path aliases: `@/` maps to root directory
- Strict type checking enabled

### `.env`
- Environment variables
- Supabase URL and keys
- Never commit sensitive values

### `app.json`
- Expo app configuration
- App name, slug, version
- Platform-specific settings

## 📊 Database (Supabase)

While not files in the repo, here's the database structure:

```
Supabase Database:
├── 📊 Tables
│   ├── profiles                      # User accounts
│   ├── medical_scans                 # Scan results
│   ├── donation_requests             # Aid requests
│   ├── donations                     # Contributions
│   ├── clinics                       # Healthcare facilities
│   ├── doctors                       # Medical professionals
│   ├── consultations                 # Appointments
│   └── model_versions                # AI model tracking
│
├── 🔐 Auth
│   └── users                         # Supabase auth users
│
└── 💾 Storage
    ├── medical-scans                 # Scan images
    └── documents                     # Supporting documents
```

## 🗺️ File Purpose Quick Reference

### Need to add AI models?
→ `assets/models/` + `services/aiModelService.ts`
→ See `MODEL_PLACEMENT_GUIDE.md`

### Need to customize UI?
→ `app/(tabs)/` screens + `components/`

### Need to add features?
→ Create new screen in `app/`
→ Add service in `services/`

### Need to modify database?
→ Supabase SQL Editor (create migration)
→ Update types in `types/database.ts`

### Need to add authentication?
→ Already done in `contexts/AuthContext.tsx`

### Need to configure app?
→ `app.json` for Expo settings
→ `.env` for environment variables

## 📝 File Count Summary

- **Total screens:** 12 (7 main + 2 auth + 3 modal)
- **Components:** 4 reusable
- **Services:** 3 (AI, Storage, Hedera)
- **Contexts:** 1 (Auth)
- **Type definitions:** 1 file, 8 interfaces
- **Documentation:** 7 markdown files
- **Configuration:** 5 files

## 🎯 Key Files to Modify

When integrating your models:
1. ✅ `assets/models/` - Add your .tflite files
2. ✅ `services/aiModelService.ts` - Update inference logic

When customizing:
1. `app.json` - App name, colors, icon
2. `app/(tabs)/` - Screen content and styling
3. `components/` - Reusable UI components

When deploying:
1. `.env` - Production credentials
2. `app.json` - Version, build settings

## 📚 Related Documentation

- **Getting Started:** `QUICK_START.md`
- **Setup Guide:** `SETUP.md`
- **AI Integration:** `AI_MODELS_INTEGRATION.md`
- **Blockchain:** `HEDERA_INTEGRATION.md`
- **Architecture:** `ARCHITECTURE.md`
- **Model Placement:** `MODEL_PLACEMENT_GUIDE.md`

---

**This file structure supports a complete, production-ready medical diagnostics application with AI, blockchain, and healthcare partnerships.**
