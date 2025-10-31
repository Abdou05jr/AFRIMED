# 🚀 Quick Start Guide - MedScan Africa

Get up and running in 5 minutes!

## ✅ Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ iOS Simulator (Mac) or Android Emulator
- ✅ Your trained AI models ready (.tflite format)

## 📦 Installation (2 minutes)

```bash
# 1. Navigate to project directory
cd medscan-africa

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The app will open in Expo Dev Tools. Press:
- **`i`** for iOS Simulator
- **`a`** for Android Emulator
- **Scan QR code** for physical device (install Expo Go app first)

## 🧪 Test the App (3 minutes)

### Step 1: Create Account
1. App opens to login screen
2. Click "Sign Up"
3. Enter:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Country: `Nigeria`
   - Password: `test123456`
4. Click "Sign Up"

### Step 2: Explore Features

#### Home Screen
- View dashboard with quick scan options
- See recent scans (empty for now)

#### Scan Tab
- Select scan type (Brain/Heart/Eye)
- Upload test image or take photo
- Click "Analyze Scan"
- View AI results (currently shows mock data)

#### Donations Tab
- Browse donation requests
- Click "+" to create new request

#### Clinics Tab
- View partner clinics (empty - needs data)

#### Profile Tab
- View your profile information
- See account statistics

## 🎯 Next Steps: Integrate Your Models

### Step 1: Add Your Model Files (2 minutes)

```bash
# Create directories
mkdir -p assets/models/brain
mkdir -p assets/models/heart
mkdir -p assets/models/eye

# Copy your models
cp /path/to/your/brain_model.tflite assets/models/brain/brain_cnn_v1.tflite
cp /path/to/your/heart_model.tflite assets/models/heart/heart_cnn_v1.tflite
cp /path/to/your/eye_model.tflite assets/models/eye/eye_cnn_v1.tflite
```

### Step 2: Configure Models (5 minutes)

Create `assets/models/brain/model_config.json`:
```json
{
  "model_name": "Brain Tumor Detection CNN",
  "version": "1.0.0",
  "input_shape": [224, 224, 3],
  "output_classes": 4,
  "labels": ["Normal", "Glioma", "Meningioma", "Pituitary Tumor"]
}
```

Repeat for heart and eye models.

**See `MODEL_PLACEMENT_GUIDE.md` for complete instructions.**

### Step 3: Update AI Service (10 minutes)

Edit `services/aiModelService.ts` to load your actual models.

**See `AI_MODELS_INTEGRATION.md` for detailed code examples.**

## 🏥 Add Sample Data

### Add Test Clinic

Open Supabase SQL Editor and run:

```sql
INSERT INTO clinics (name, description, address, city, country, phone, email, specialties, is_verified)
VALUES (
  'Lagos Medical Center',
  'Leading healthcare provider with state-of-the-art facilities',
  '123 Victoria Island',
  'Lagos',
  'Nigeria',
  '+234-123-456-7890',
  'info@lagosmedical.ng',
  ARRAY['Cardiology', 'Neurology', 'Ophthalmology'],
  true
);
```

Now refresh the Clinics tab in the app!

### Make Yourself Admin

```sql
UPDATE profiles
SET is_admin = true
WHERE email = 'test@example.com';
```

Now you can access the Admin Dashboard from Profile tab!

## 🔐 Storage Setup (5 minutes)

Configure Supabase Storage buckets:

1. Go to Supabase Dashboard → Storage
2. Create bucket: `medical-scans` (Private)
3. Create bucket: `documents` (Private)

Run these policies in SQL Editor:

```sql
-- Policy for medical-scans bucket
CREATE POLICY "Users can upload own scans"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-scans' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own scans"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-scans' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 📱 Test on Physical Device

### iOS (requires Mac)

```bash
# Install Expo Go from App Store
# Scan QR code from terminal
```

### Android

```bash
# Install Expo Go from Play Store
# Scan QR code from terminal
```

## 🎨 Customize the App

### Change App Name

Edit `app.json`:
```json
{
  "name": "Your App Name",
  "slug": "your-app-name"
}
```

### Change Colors

Main colors are in individual screen files. Update:
- Primary: `#007AFF` (blue)
- Success: `#34C759` (green)
- Danger: `#FF3B30` (red)
- Warning: `#FF9500` (orange)

## 📚 Documentation Reference

- **Setup Guide:** `SETUP.md` - Comprehensive setup instructions
- **AI Integration:** `AI_MODELS_INTEGRATION.md` - Model integration guide
- **Blockchain:** `HEDERA_INTEGRATION.md` - Hedera blockchain setup
- **Architecture:** `ARCHITECTURE.md` - System architecture overview
- **Model Placement:** `MODEL_PLACEMENT_GUIDE.md` - Where to add models

## ⚡ Common Issues & Solutions

### Issue: "Metro bundler won't start"
```bash
# Clear cache and restart
npx expo start -c
```

### Issue: "Cannot connect to Supabase"
- Check `.env` file has correct values
- Verify Supabase project is running
- Check internet connection

### Issue: "Image upload fails"
- Ensure storage buckets are created
- Verify storage policies are set
- Check file permissions

### Issue: "App crashes on scan"
- AI models not yet integrated (showing mock data)
- Follow `MODEL_PLACEMENT_GUIDE.md` to add models

## 🎯 Development Workflow

### Daily Development
```bash
# Start dev server
npm run dev

# In separate terminal - type checking
npm run typecheck

# Make changes, hot reload works automatically
```

### Before Committing
```bash
# Type check
npm run typecheck

# Format code (if using prettier)
npm run format

# Test on both iOS and Android
```

## 🚢 Production Deployment

### Web Deployment
```bash
npm run build:web
# Deploy dist/ folder to Vercel/Netlify
```

### Mobile App Stores

1. **Setup EAS (Expo Application Services)**
```bash
npm install -g eas-cli
eas login
eas build:configure
```

2. **Build for iOS**
```bash
eas build --platform ios
```

3. **Build for Android**
```bash
eas build --platform android
```

4. **Submit to stores**
```bash
eas submit -p ios
eas submit -p android
```

## 📊 Track Your Progress

- [ ] App runs successfully
- [ ] Created test account
- [ ] Explored all screens
- [ ] Added sample clinic data
- [ ] Made yourself admin
- [ ] Uploaded test scan
- [ ] Viewed mock AI results
- [ ] Created donation request
- [ ] Set up storage buckets
- [ ] Integrated AI models (your models)
- [ ] Set up Hedera (optional)
- [ ] Tested on physical device
- [ ] Customized branding
- [ ] Ready for production!

## 🆘 Get Help

### Error Messages
1. Check console logs in terminal
2. Check Expo DevTools for errors
3. Check Supabase dashboard logs

### Documentation
- Read relevant `.md` files in project root
- Check code comments in `/services` folder
- Review database schema in Supabase

### Community
- Expo Documentation: https://docs.expo.dev
- Supabase Documentation: https://supabase.com/docs
- React Native Community: https://reactnative.dev/help

## 🎉 You're Ready!

Your MedScan Africa app is now running with:
- ✅ Complete database schema
- ✅ Authentication system
- ✅ All core screens
- ✅ Mock AI predictions
- ✅ Donation system
- ✅ Clinic directory
- ✅ Admin dashboard

**Next:** Add your trained AI models and you're ready to deploy!

---

**Need help?** Refer to the detailed guides:
- `SETUP.md` - Complete setup guide
- `MODEL_PLACEMENT_GUIDE.md` - How to add your models
- `AI_MODELS_INTEGRATION.md` - Model integration details
- `HEDERA_INTEGRATION.md` - Blockchain setup

**Happy coding!** 🚀
