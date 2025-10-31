# 🔤 SF Pro Font Installation Guide

## Overview
This guide will help you install the SF Pro font family in your React Native Expo project for both iOS and Android platforms.

---

## 📱 iOS - Already Included! ✅

**Good news!** SF Pro is the default system font on iOS and is automatically available. No installation needed for iOS!

---

## 🤖 Android - Installation Required

SF Pro needs to be manually added to Android. Follow these steps:

### Step 1: Download SF Pro Fonts

1. Visit Apple's Developer website:
   - https://developer.apple.com/fonts/

2. Download the SF Pro font package

3. Extract the zip file

4. You'll need these specific font files:
   - `SF-Pro-Display-Bold.otf`
   - `SF-Pro-Display-Regular.otf`
   - `SF-Pro-Display-Semibold.otf`
   - `SF-Pro-Text-Regular.otf`
   - `SF-Pro-Text-Medium.otf`
   - `SF-Pro-Text-Semibold.otf`

### Step 2: Create Assets Folder

In your project root, create the assets folder structure:

```bash
mkdir -p assets/fonts
```

### Step 3: Copy Font Files

Copy the downloaded `.otf` files to `assets/fonts/`:

```
afrimedv2/
├── assets/
│   └── fonts/
│       ├── SF-Pro-Display-Bold.otf
│       ├── SF-Pro-Display-Regular.otf
│       ├── SF-Pro-Display-Semibold.otf
│       ├── SF-Pro-Text-Regular.otf
│       ├── SF-Pro-Text-Medium.otf
│       └── SF-Pro-Text-Semibold.otf
```

### Step 4: Configure Expo

For Expo projects, fonts are automatically linked. Just make sure your `app.json` includes:

```json
{
  "expo": {
    "name": "AfriMed",
    "slug": "afrimed",
    "version": "1.0.0",
    // ... other config
  }
}
```

### Step 5: Load Fonts in App

Update your `app/_layout.tsx` to load fonts:

```typescript
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'SF Pro Display': require('../assets/fonts/SF-Pro-Display-Regular.otf'),
          'SF Pro Display Bold': require('../assets/fonts/SF-Pro-Display-Bold.otf'),
          'SF Pro Display Semibold': require('../assets/fonts/SF-Pro-Display-Semibold.otf'),
          'SF Pro Text': require('../assets/fonts/SF-Pro-Text-Regular.otf'),
          'SF Pro Text Medium': require('../assets/fonts/SF-Pro-Text-Medium.otf'),
          'SF Pro Text Semibold': require('../assets/fonts/SF-Pro-Text-Semibold.otf'),
        });
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error loading fonts:', e);
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // or return a loading component
  }

  return (
    // ... your layout content
  );
}
```

### Step 6: Alternative Method (expo-font in package.json)

You can also use expo-font configuration in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-font",
        {
          "fonts": [
            "./assets/fonts/SF-Pro-Display-Bold.otf",
            "./assets/fonts/SF-Pro-Display-Regular.otf",
            "./assets/fonts/SF-Pro-Display-Semibold.otf",
            "./assets/fonts/SF-Pro-Text-Regular.otf",
            "./assets/fonts/SF-Pro-Text-Medium.otf",
            "./assets/fonts/SF-Pro-Text-Semibold.otf"
          ]
        }
      ]
    ]
  }
}
```

---

## 🎨 Using SF Pro in Styles

Once installed, use SF Pro in your StyleSheet:

```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  title: {
    fontFamily: 'SF Pro Display',
    fontSize: 32,
    fontWeight: '800', // Extra Bold
  },
  heading: {
    fontFamily: 'SF Pro Display',
    fontSize: 24,
    fontWeight: '700', // Bold
  },
  subheading: {
    fontFamily: 'SF Pro Display',
    fontSize: 20,
    fontWeight: '600', // Semibold
  },
  body: {
    fontFamily: 'SF Pro Text',
    fontSize: 16,
    fontWeight: '400', // Regular
  },
  caption: {
    fontFamily: 'SF Pro Text',
    fontSize: 14,
    fontWeight: '400', // Regular
  },
});
```

---

## 🔧 Troubleshooting

### Fonts Not Loading

**Problem**: Fonts don't appear, showing default system font

**Solutions**:
1. Clear Expo cache:
   ```bash
   expo start -c
   ```

2. Rebuild the app:
   ```bash
   expo prebuild --clean
   ```

3. Verify font files are in correct location
4. Check font file names match exactly in code
5. Ensure fonts are loaded before app renders

### Android Build Errors

**Problem**: Build fails with font-related errors

**Solutions**:
1. Ensure font files are `.otf` or `.ttf` format
2. Check file permissions
3. Verify paths in configuration
4. Try clean build:
   ```bash
   cd android && ./gradlew clean && cd ..
   expo run:android
   ```

### Font Weight Issues

**Problem**: Bold/Semibold not working

**Solutions**:
1. Make sure you've loaded the specific weight variant
2. Use exact font family name:
   - `'SF Pro Display Bold'` for bold
   - `'SF Pro Display Semibold'` for semibold
3. Or use font weight with base family:
   ```typescript
   fontFamily: 'SF Pro Display',
   fontWeight: '700', // Bold
   ```

---

## 📦 Required Dependencies

Make sure you have these packages:

```bash
# Check if installed
npm list expo-font

# If not installed:
npx expo install expo-font
npx expo install expo-splash-screen
```

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies (if needed)
npx expo install expo-font expo-splash-screen

# 2. Copy fonts to assets/fonts/

# 3. Update app/_layout.tsx with font loading code

# 4. Clear cache and restart
expo start -c

# 5. Test on device
npm run ios      # For iOS
npm run android  # For Android
```

---

## ✅ Verification Checklist

- [ ] Font files downloaded from Apple
- [ ] Font files copied to `assets/fonts/`
- [ ] Font loading code added to `app/_layout.tsx`
- [ ] expo-font package installed
- [ ] Expo cache cleared
- [ ] App rebuilt
- [ ] Fonts appear correctly on iOS
- [ ] Fonts appear correctly on Android
- [ ] All font weights working
- [ ] No console errors
- [ ] Production build tested

---

## 📝 Font Weight Reference

### SF Pro Display (Headings)
- **100** - Ultralight
- **200** - Thin
- **300** - Light
- **400** - Regular
- **500** - Medium
- **600** - Semibold ✅ (Used in app)
- **700** - Bold ✅ (Used in app)
- **800** - Heavy/Extra Bold ✅ (Used in app)
- **900** - Black

### SF Pro Text (Body)
- **400** - Regular ✅ (Used in app)
- **500** - Medium
- **600** - Semibold

---

## 🎨 Current Font Usage in App

Based on `ThemeContext.tsx`:

```typescript
typography: {
  h1: { 
    fontFamily: 'SF Pro Display',
    fontSize: 32,
    fontWeight: '800',  // Extra Bold
  },
  h2: {
    fontFamily: 'SF Pro Display',
    fontSize: 24,
    fontWeight: '700',  // Bold
  },
  h3: {
    fontFamily: 'SF Pro Display',
    fontSize: 20,
    fontWeight: '600',  // Semibold
  },
  body: {
    fontFamily: 'SF Pro Text',
    fontSize: 16,
    fontWeight: '400',  // Regular
  },
  caption: {
    fontFamily: 'SF Pro Text',
    fontSize: 14,
    fontWeight: '400',  // Regular
  },
}
```

---

## 🌐 Alternative: System Fonts

If you can't use SF Pro, these are good alternatives:

**iOS**: System font (SF Pro is default)

**Android**: Roboto (default), or:
- Inter
- Open Sans
- Lato
- Nunito Sans

To use system fonts:

```typescript
fontFamily: Platform.select({
  ios: 'SF Pro Display',
  android: 'Roboto',
})
```

---

## 📚 Resources

- **SF Pro Download**: https://developer.apple.com/fonts/
- **Expo Font Docs**: https://docs.expo.dev/guides/using-custom-fonts/
- **React Native Typography**: https://reactnative.dev/docs/text

---

**Last Updated**: October 31, 2025
**Version**: 1.0.0
**Status**: Ready for Implementation

