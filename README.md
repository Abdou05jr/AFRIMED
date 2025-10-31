# 🏥 MedScan Africa

AI-Powered Medical Diagnostics & Community Healthcare Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020.svg)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-green.svg)](https://supabase.com/)

## 🌟 Overview

MedScan Africa is a comprehensive mobile healthcare application that combines AI-powered medical scan analysis with blockchain-based donation transparency. The platform enables users to upload medical images (MRI, CT scans) for instant AI diagnosis while connecting them with verified healthcare partners and community support.

### Key Features

- 🧠 **AI Medical Scan Analysis** - Brain, Heart, and Eye disease detection using CNN models
- 💰 **Blockchain Donations** - Transparent medical aid system powered by Hedera
- 🏥 **Clinic Partnerships** - Verified healthcare provider network
- 📊 **Health Dashboard** - Track scans, results, and medical history
- 🔐 **Secure Authentication** - Email/password auth with Supabase
- 👨‍⚕️ **Teleconsultations** - Connect with verified doctors
- 📱 **Cross-Platform** - iOS, Android, and Web support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/medscan-africa.git
cd medscan-africa

# Install dependencies
npm install

# Start development server
npm run dev
```

### First Run

1. **Sign Up** - Create an account using email/password
2. **Upload Scan** - Take or upload a medical scan image
3. **Get Results** - View AI analysis and recommendations
4. **Explore Clinics** - Find partner healthcare providers

## 📁 Project Structure

```
medscan-africa/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication flows
│   ├── (tabs)/            # Main app navigation
│   ├── create-donation.tsx
│   └── admin.tsx
├── components/            # Reusable UI components
├── contexts/              # React contexts (Auth, etc.)
├── services/              # Business logic
│   ├── aiModelService.ts  # AI model inference
│   ├── storageService.ts  # File uploads
│   └── hederaService.ts   # Blockchain
├── types/                 # TypeScript definitions
├── lib/                   # Utilities
└── assets/               # Static files
```

## 🔧 Configuration

### Environment Variables

The `.env` file contains:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Database

The application uses Supabase with pre-configured tables:
- ✅ User profiles and authentication
- ✅ Medical scan storage and results
- ✅ Donation requests and transactions
- ✅ Clinic and doctor directories
- ✅ Consultation bookings

All tables have Row Level Security (RLS) enabled.

## 🤖 AI Models Integration

The app supports three specialized CNN models:

1. **Brain MRI Analysis** - Tumor detection (Glioblastoma, Meningioma, etc.)
2. **Cardiac Scan Analysis** - Heart disease detection (Cardiomyopathy, Infarction)
3. **Retinal Scan Analysis** - Eye diseases (Diabetic Retinopathy, Glaucoma)

### Adding Your Models

1. Convert your Keras/PyTorch models to TensorFlow Lite (.tflite)
2. Place models in `assets/models/`
3. Update `services/aiModelService.ts` with actual inference logic

**See `AI_MODELS_INTEGRATION.md` for detailed instructions.**

## ⛓️ Blockchain Integration

MedScan Africa uses Hedera Hashgraph for:
- Transparent donation tracking
- Immutable audit trails
- Smart contract-based fund releases
- Verification system

### Setup Hedera

1. Create testnet account at [Hedera Portal](https://portal.hedera.com/)
2. Add credentials to environment
3. Deploy smart contract
4. Update `services/hederaService.ts`

**See `HEDERA_INTEGRATION.md` for complete guide.**

## 🛠️ Technology Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo** - Development and build tooling
- **TypeScript** - Type-safe code
- **Expo Router** - File-based navigation
- **Lucide Icons** - Beautiful icon set

### Backend
- **Supabase** - Database, Auth, Storage
- **PostgreSQL** - Relational database
- **Row Level Security** - Data protection

### AI/ML
- **TensorFlow Lite** - On-device inference
- **CNN Models** - Custom trained networks
- **Grad-CAM** - Visual explanations

### Blockchain
- **Hedera Hashgraph** - DLT platform
- **Smart Contracts** - Solidity
- **HashConnect** - Wallet integration

## 📱 Available Scripts

```bash
# Development
npm run dev              # Start Expo dev server
npm run typecheck        # Run TypeScript checks
npm run lint             # Run ESLint

# Build
npm run build:web        # Build for web

# Production (requires EAS)
eas build --platform ios
eas build --platform android
```

## 🧪 Testing

### Test Account Setup

```sql
-- Create admin user
UPDATE profiles
SET is_admin = true
WHERE email = 'admin@medscan.africa';

-- Add sample clinic
INSERT INTO clinics (name, city, country, phone, is_verified)
VALUES ('Test Clinic', 'Lagos', 'Nigeria', '+234-XXX', true);
```

### Test Scan Upload

1. Navigate to Scan tab
2. Select scan type (Brain/Heart/Eye)
3. Upload test medical image
4. View mock AI results

## 🔐 Security

- ✅ Row Level Security on all tables
- ✅ Encrypted data at rest and in transit
- ✅ Secure authentication with Supabase Auth
- ✅ Input validation and sanitization
- ✅ HTTPS-only communication

**⚠️ Important:** This app handles medical data. Ensure GDPR/HIPAA compliance before production deployment.

## 📊 Database Schema

### Core Tables

- `profiles` - User accounts and settings
- `medical_scans` - Scan uploads and AI results
- `donation_requests` - Medical aid requests
- `donations` - Individual contributions
- `clinics` - Healthcare facilities
- `doctors` - Medical professionals
- `consultations` - Appointment bookings
- `model_versions` - AI model tracking

### Relationships

```
profiles (1) ─── (N) medical_scans
profiles (1) ─── (N) donation_requests
donation_requests (1) ─── (N) donations
clinics (1) ─── (N) doctors
doctors (1) ─── (N) consultations
```

## 🌍 Supported Regions

Currently optimized for:
- 🇳🇬 Nigeria
- 🇰🇪 Kenya
- 🇬🇭 Ghana
- 🇿🇦 South Africa
- 🇪🇹 Ethiopia

Multi-language support coming soon (English, French, Arabic).

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Core app structure
- ✅ Authentication system
- ✅ Database schema
- ✅ Mock AI predictions
- ✅ Donation system UI

### Phase 2 (Integration)
- 🔄 Real AI model integration
- 🔄 Hedera blockchain setup
- 🔄 Storage bucket configuration
- 🔄 Teleconsultation features

### Phase 3 (Enhancement)
- ⏳ Multi-language support
- ⏳ Offline mode
- ⏳ Push notifications
- ⏳ Analytics dashboard

### Phase 4 (Scale)
- ⏳ App store deployment
- ⏳ Partner clinic onboarding
- ⏳ Community features
- ⏳ Regulatory compliance

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimers

**Medical Disclaimer:** This application provides AI-assisted analysis for informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers.

**Regulatory Compliance:** Ensure compliance with local medical device regulations (FDA, CE, etc.) before deploying in production.

## 📞 Support

- 📧 Email: support@medscan.africa
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/medscan-africa/issues)
- 📖 Docs: See `SETUP.md`, `AI_MODELS_INTEGRATION.md`, `HEDERA_INTEGRATION.md`

## 🙏 Acknowledgments

- **Datasets:** Brain Tumor MRI Dataset, ACDC, ODIR-5K
- **Technologies:** Expo, Supabase, Hedera, TensorFlow
- **Community:** React Native, Expo, and Supabase communities

---

**Built with ❤️ for accessible healthcare in Africa**

🌍 **MedScan Africa** - Empowering communities through AI and blockchain technology
