# MedScan Africa - Setup Guide

Complete guide to set up and run the MedScan Africa mobile application.

## Prerequisites

- Node.js 18+ and npm
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator
- Supabase account (database already configured)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

The environment variables are already configured in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### 3. Start Development Server

```bash
npm run dev
```

This will open Expo Dev Tools in your browser. Choose your platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Database Setup

The database is already configured with the following tables:
- `profiles` - User profiles and authentication
- `medical_scans` - AI scan results and analysis
- `donation_requests` - Medical aid requests
- `donations` - Individual donations
- `clinics` - Partner healthcare facilities
- `doctors` - Healthcare professionals
- `consultations` - Teleconsultation bookings
- `model_versions` - AI model version tracking

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Users can only access their own data
- Verified donation requests are publicly viewable
- Clinics and doctors are publicly readable when verified
- Admins have elevated permissions

## Project Structure

```
medscan-africa/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── index.tsx            # Home screen
│   │   ├── scan.tsx             # Scan upload
│   │   ├── scan-result.tsx      # AI results
│   │   ├── donations.tsx        # Donations feed
│   │   ├── clinics.tsx          # Partner clinics
│   │   └── profile.tsx          # User profile
│   ├── create-donation.tsx      # Create donation request
│   ├── admin.tsx                # Admin dashboard
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── LoadingScreen.tsx
├── contexts/                     # React contexts
│   └── AuthContext.tsx          # Authentication state
├── services/                     # Business logic services
│   ├── aiModelService.ts        # AI model inference
│   ├── storageService.ts        # File uploads
│   └── hederaService.ts         # Blockchain transactions
├── types/                        # TypeScript definitions
│   └── database.ts              # Database types
├── lib/                          # Utilities
│   └── supabase.ts              # Supabase client
└── assets/                       # Static assets
    └── models/                   # AI model files (add your models here)
```

## Features

### ✅ Implemented

1. **Authentication System**
   - Email/password signup and login
   - User profile management
   - Session management with Supabase Auth

2. **Medical Scan Analysis**
   - Upload images via camera or gallery
   - Support for Brain/Heart/Eye scans
   - AI analysis results display
   - Risk level assessment
   - Mock predictions (ready for real models)

3. **Donation System**
   - Browse verified donation requests
   - Create donation requests
   - Track raised amounts
   - Verification workflow

4. **Clinic Partnership**
   - Browse partner clinics
   - View clinic details and specialties
   - Contact clinics via phone/email

5. **User Dashboard**
   - Recent scans history
   - Quick scan access
   - User statistics

6. **Admin Dashboard**
   - Platform statistics
   - User management interface
   - Donation verification interface

### 🔧 Needs Integration

1. **AI Models** - See `AI_MODELS_INTEGRATION.md`
   - Replace mock predictions with your trained models
   - Add TensorFlow Lite models
   - Implement Grad-CAM heatmaps

2. **Hedera Blockchain** - See `HEDERA_INTEGRATION.md`
   - Set up Hedera testnet account
   - Implement smart contracts
   - Enable crypto donations

3. **Storage Buckets** - Configure Supabase Storage
   ```sql
   -- Run in Supabase SQL Editor
   insert into storage.buckets (id, name, public)
   values ('medical-scans', 'medical-scans', false);

   insert into storage.buckets (id, name, public)
   values ('documents', 'documents', false);
   ```

4. **Storage Policies** - Set up RLS for storage
   ```sql
   -- Allow users to upload their own files
   create policy "Users can upload own scans"
   on storage.objects for insert
   to authenticated
   with check (
     bucket_id = 'medical-scans' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   create policy "Users can view own scans"
   on storage.objects for select
   to authenticated
   using (
     bucket_id = 'medical-scans' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

## Testing

### Create Test User

1. Run the app and sign up with a test account
2. The profile will be automatically created in the database

### Create Test Admin

```sql
-- Run in Supabase SQL Editor
update profiles
set is_admin = true
where email = 'your-test-email@example.com';
```

### Add Sample Clinics

```sql
insert into clinics (name, description, address, city, country, phone, email, specialties, is_verified)
values
  ('Lagos Medical Center', 'Leading healthcare provider in Lagos', '123 Victoria Island', 'Lagos', 'Nigeria', '+234-123-456-7890', 'info@lagosmedical.ng', ARRAY['Cardiology', 'Neurology', 'Ophthalmology'], true),
  ('Nairobi General Hospital', 'Comprehensive medical services', '456 Uhuru Highway', 'Nairobi', 'Kenya', '+254-123-456-789', 'contact@nairobigeneral.ke', ARRAY['General Medicine', 'Surgery'], true);
```

## Building for Production

### Web Build

```bash
npm run build:web
```

Output will be in `dist/` directory.

### Mobile Build (requires Expo EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Environment Variables for Production

For production deployment, update these values:

```env
EXPO_PUBLIC_SUPABASE_URL=your-production-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-key

# Optional: Add for production
HEDERA_ACCOUNT_ID=0.0.XXXXXXX
HEDERA_PRIVATE_KEY=your-private-key
HEDERA_NETWORK=mainnet
```

## Common Issues

### 1. Metro bundler cache issues
```bash
npx expo start -c
```

### 2. Module resolution errors
```bash
rm -rf node_modules
npm install
```

### 3. iOS simulator not opening
```bash
# Reset simulator
xcrun simctl erase all
```

### 4. Android build fails
```bash
cd android
./gradlew clean
cd ..
```

## Performance Optimization

### Image Optimization
- Use `expo-image` for better image caching
- Compress images before upload
- Implement lazy loading for lists

### Bundle Size
- Use dynamic imports for large screens
- Remove unused dependencies
- Enable Hermes JavaScript engine

## Security Considerations

1. **Never commit sensitive keys** to version control
2. **Use environment variables** for all credentials
3. **Enable RLS** on all Supabase tables
4. **Validate user input** on both client and server
5. **Implement rate limiting** for API calls
6. **Use HTTPS** for all network requests

## Compliance

### Medical Data Handling
- This app handles medical data - ensure GDPR/HIPAA compliance
- Implement data encryption at rest and in transit
- Add privacy policy and terms of service
- Get user consent for data processing

### Disclaimers
The app includes medical disclaimers. Always consult with legal counsel before deploying medical applications.

## Support & Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Documentation](https://reactnative.dev/)
- [Hedera Documentation](https://docs.hedera.com/)

## Next Steps

1. ✅ **Test the app** - Sign up and explore features
2. 📱 **Integrate your AI models** - Follow `AI_MODELS_INTEGRATION.md`
3. ⛓️ **Set up Hedera blockchain** - Follow `HEDERA_INTEGRATION.md`
4. 🏥 **Add real clinic data** - Populate clinics table
5. 🎨 **Customize branding** - Update colors, logo, and name
6. 📝 **Add legal documents** - Privacy policy, terms of service
7. 🚀 **Deploy to production** - Build and submit to app stores

## License

This project is created for MedScan Africa. Ensure you have proper licenses for:
- AI models and training data
- Medical device regulations (if applicable)
- Third-party dependencies
- Healthcare data processing
