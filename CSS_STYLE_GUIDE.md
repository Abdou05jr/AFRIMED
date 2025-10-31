## ✏️ How to Edit Styles

### Method 1: Direct StyleSheet Edit
```typescript
// 1. Open the file containing the style
// 2. Find StyleSheet.create({ ... })
// 3. Locate the specific style object
// 4. Modify the values

// Example:
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#00D4FF', // <- Change this
    padding: 16,                 // <- Or this
  }
});
```

### Method 2: Inline Style Edit
```typescript
// 1. Find the component with inline styles
// 2. Modify the style prop directly

// Example:
<View style={{ 
  backgroundColor: '#001F3F', // <- Change this
  padding: 24 
}} />
```

### Method 3: Theme Context Edit (Recommended)
```typescript
// 1. Open contexts/ThemeContext.tsx
// 2. Edit darkColors or lightColors objects
// 3. All components using theme context will update

// Example:
const darkColors: ColorPalette = {
  primary: '#001F3F',    // <- Change this
  secondary: '#00D4FF',  // <- Or this
  // ... rest remains same
};
```

### Method 4: Component Props Edit
```typescript
// 1. Find the component usage
// 2. Pass style prop or color prop

// Example:
<Button 
  variant="primary"
  style={{ backgroundColor: '#NEW_COLOR' }} // <- Override
/>
```

---

## 🔧 Common Style Patterns

### Pattern 1: Responsive Sizing
```typescript
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

// Usage:
width: width * 0.9,     // 90% of screen width
height: height * 0.3,   // 30% of screen height
maxWidth: width - 48,   // Full width minus padding
```

### Pattern 2: Conditional Styling
```typescript
<View style={[
  styles.base,
  isActive && styles.active,        // Add if true
  !isDisabled && styles.enabled,    // Add if true
  { opacity: loading ? 0.5 : 1 }   // Dynamic value
]} />
```

### Pattern 3: Platform-Specific Styles
```typescript
import { Platform } from 'react-native';

// Method 1:
paddingTop: Platform.OS === 'ios' ? 60 : 40,

// Method 2:
...Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 } },
  android: { elevation: 4 }
}),
```

### Pattern 4: Gradient Backgrounds
```typescript
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={['#00D4FF', '#001F3F']}  // Start -> End
  start={{ x: 0, y: 0 }}           // Top left
  end={{ x: 1, y: 1 }}             // Bottom right
  style={styles.gradient}
>
  {/* Content */}
</LinearGradient>
```

### Pattern 5: Shadow & Elevation
```typescript
// iOS Shadow
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 8,

// Android Elevation
elevation: 8,

// Both (cross-platform)
shadowColor: '#00D4FF',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 8,
elevation: 8,
```

---

## 📝 Best Practices

### ✅ DO:
1. **Use Theme Context for colors**
   ```typescript
   import { useTheme } from '@/contexts/ThemeContext';
   const { theme } = useTheme();
   backgroundColor: theme.colors.primary
   ```

2. **Use spacing constants**
   ```typescript
   const { theme } = useTheme();
   padding: theme.spacing.md  // Instead of: padding: 16
   ```

3. **Use consistent naming**
   ```typescript
   // Good
   container, content, header, title, subtitle
   
   // Avoid
   cont, cont1, myHeader, titleTxt
   ```

4. **Group related styles**
   ```typescript
   const styles = StyleSheet.create({
     // Layout
     container: { ... },
     content: { ... },
     
     // Text
     title: { ... },
     subtitle: { ... },
     
     // Components
     button: { ... },
     card: { ... },
   });
   ```

5. **Comment complex styles**
   ```typescript
   container: {
     flex: 1,
     // Fix for notch devices
     paddingTop: Platform.OS === 'ios' ? 60 : 40,
   }
   ```

### ❌ DON'T:
1. **Don't hardcode colors everywhere**
   ```typescript
   // Bad
   backgroundColor: '#00D4FF'
   
   // Good
   backgroundColor: theme.colors.secondary
   ```

2. **Don't use magic numbers**
   ```typescript
   // Bad
   padding: 17,
   margin: 23,
   
   // Good
   padding: theme.spacing.md,
   margin: theme.spacing.lg,
   ```

3. **Don't mix inline and StyleSheet**
   ```typescript
   // Bad
   <View style={[styles.container, { backgroundColor: '#FFF' }]} />
   
   // Good - use StyleSheet
   <View style={styles.container} />
   ```

4. **Don't override without reason**
   ```typescript
   // Bad - unnecessary override
   <Button style={{ backgroundColor: '#00D4FF' }} />
   
   // Good - use variant
   <Button variant="electric" />
   ```

---

## 🎯 Style Location Index

### By Component Type

#### Buttons
- **Primary Button**: `components/Button.tsx` (line ~115)
- **Secondary Button**: `components/Button.tsx` (line ~118)
- **Electric Button**: `components/Button.tsx` (line ~127)
- **FAB Button**: `app/(tabs)/donations.tsx` (line ~640)

#### Cards
- **Default Card**: `components/Card.tsx` (line ~96)
- **Elevated Card**: `components/Card.tsx` (line ~100)
- **Electric Card**: `components/Card.tsx` (line ~112)

#### Inputs
- **Default Input**: `components/Input.tsx` (line ~336)
- **Filled Input**: `components/Input.tsx` (line ~343)
- **Electric Input**: `components/Input.tsx` (line ~347)

#### Headers
- **Home Header**: `app/(tabs)/index.tsx` (line ~237, ~436)
- **Clinics Header**: `app/(tabs)/clinics.tsx` (line ~294, ~428)
- **Donations Header**: `app/(tabs)/donations.tsx` (line ~296, ~520)
- **Profile Header**: `app/(tabs)/profile.tsx` (line ~215, ~423)

#### Tab Bar
- **Tab Container**: `app/(tabs)/_layout.tsx` (line ~246)
- **Active Tab**: `app/(tabs)/_layout.tsx` (line ~62)
- **Inactive Tab**: `app/(tabs)/_layout.tsx` (line ~63)
- **Tab Indicator**: `app/(tabs)/_layout.tsx` (line ~52, ~253)

#### Loading Screens
- **Default Loading**: `components/LoadingScreen.tsx` (line ~261)
- **Scan Loading**: `components/LoadingScreen.tsx` (line ~265)
- **Analysis Loading**: `components/LoadingScreen.tsx` (line ~269)

---

## 🚀 Quick Tasks

### Task 1: Change Primary App Color
**Files to edit**: 2 files
1. `contexts/ThemeContext.tsx` (line 57, 85)
   - Change `primary: '#001F3F'` to your color
2. `android/app/src/main/res/values/colors.xml`
   - Change `<color name="colorPrimary">`

### Task 2: Change Accent/Secondary Color
**Files to edit**: 2 files
1. `contexts/ThemeContext.tsx` (line 58, 86)
   - Change `secondary: '#00D4FF'` to your color
2. `app/(tabs)/_layout.tsx` (line 62)
   - Change `tabBarActiveTintColor: '#00D4FF'`

### Task 3: Change Button Style
**Files to edit**: 1 file
1. `components/Button.tsx` (lines ~115-127)
   - Edit variant styles

### Task 4: Change All Header Gradients
**Files to edit**: 5 files
1. `app/(tabs)/index.tsx` (line ~237)
2. `app/(tabs)/clinics.tsx` (line ~294)
3. `app/(tabs)/donations.tsx` (line ~296)
4. `app/(tabs)/profile.tsx` (line ~215)
5. `app/create-donation.tsx` (line ~519)

### Task 5: Change Card Background
**Files to edit**: 1 file
1. `components/Card.tsx` (lines ~96-112)
   - Edit variant backgrounds

---

## 📊 Statistics

- **Total Files with Styles**: 20+
- **Total StyleSheet.create Declarations**: 22
- **Total Inline Style Declarations**: 50+
- **Total Color Definitions**: 25+
- **Total Gradient Declarations**: 40+

---

## 🔗 Related Files

- **Theme Configuration**: `contexts/ThemeContext.tsx`
- **Color Values (Android)**: `android/app/src/main/res/values/colors.xml`
- **Type Definitions**: `types/database.ts`
- **Service Utilities**: `services/`

---

## 📅 Maintenance Log

| Date | Change | Files Affected | Updated By |
|------|--------|----------------|------------|
| 2025-10-31 | Initial palette update to White, Night Blue & Electric Blue | 16 files | System |
| 2025-10-31 | CSS Style Guide created | This file | System |

---

## 💡 Tips & Tricks

### Tip 1: Find All Color Usage
Search for: `#[0-9A-Fa-f]{6}` (regex pattern for hex colors)

### Tip 2: Find All StyleSheet Declarations
Search for: `StyleSheet.create`

### Tip 3: Find Inline Styles
Search for: `style={{`

### Tip 4: Find Gradient Usage
Search for: `LinearGradient` or `colors={[`

### Tip 5: Find Specific Color
Search for: `#00D4FF` (or any hex color)

---

**Last Updated**: October 31, 2025  
**Maintained By**: AfriMed Development Team  
**Version**: 1.0.0
# 🎨 CSS & Style Management Guide - AfriMed v2
**Date Created**: October 31, 2025  
**Last Updated**: October 31, 2025  
**Version**: 1.0.0

---

## 📋 Table of Contents
1. [Color Palette Reference](#color-palette-reference)
2. [File Structure & Locations](#file-structure--locations)
3. [Style Categories](#style-categories)
4. [Quick Reference Guide](#quick-reference-guide)
5. [How to Edit Styles](#how-to-edit-styles)
6. [Common Style Patterns](#common-style-patterns)
7. [Best Practices](#best-practices)

---

## 🎨 Color Palette Reference

### Current Active Colors
```typescript
// Primary Colors
const PRIMARY_WHITE = '#FFFFFF';      // Main background, cards (light mode)
const PRIMARY_NIGHT_BLUE = '#001F3F'; // Main background (dark mode)
const PRIMARY_DARK_BLUE = '#000814';  // Deep dark backgrounds
const SURFACE_BLUE = '#002855';       // Surface elements (dark mode)

// Secondary/Accent Colors
const ELECTRIC_BLUE = '#00D4FF';      // Main accent, links, active states
const ELECTRIC_BLUE_DARK = '#00A8CC'; // Darker variant for gradients
const ELECTRIC_BLUE_ALT = '#0096B8';  // Alternative gradient

// Text Colors
const TEXT_BLACK = '#000000';         // Primary text (light mode)
const TEXT_WHITE = '#FFFFFF';         // Primary text (dark mode)
const TEXT_GRAY = '#6C757D';          // Secondary text, labels
const TEXT_LIGHT_GRAY = '#8B9CB1';    // Tertiary text

// Border & Separator Colors
const BORDER_LIGHT = '#E5E7EB';       // Borders (light mode)
const BORDER_DARK = '#2D3748';        // Borders (dark mode)

// State Colors
const SUCCESS_GREEN = '#00FF88';      // Success states
const WARNING_YELLOW = '#FFB800';     // Warning states
const ERROR_RED = '#FF0066';          // Error states, critical
const INFO_BLUE = '#00D4FF';          // Info messages

// Medical/Risk Level Colors
const RISK_LOW = '#00FF88';           // Low risk - green
const RISK_MEDIUM = '#FFB800';        // Medium risk - yellow
const RISK_HIGH = '#FF3B30';          // High risk - red
const RISK_CRITICAL = '#8B0000';      // Critical risk - dark red

// Legacy/Rating Colors
const GOLD_STAR = '#FFD700';          // Star ratings
const GREEN_SUCCESS = '#4CD964';      // Alternative success
const ORANGE_WARNING = '#FF9500';     // Alternative warning
```

---

## 📁 File Structure & Locations

### 1. Core Configuration Files
```
📂 Project Root
├── 📄 android/app/src/main/res/values/colors.xml
├── 📄 android/app/src/main/res/values-night/colors.xml
└── 📄 contexts/ThemeContext.tsx (Main theme configuration)
```

### 2. Component Files (components/)
```
📂 components/
├── 📄 Button.tsx          - ~340 lines (Styles: line ~100-340)
├── 📄 Card.tsx            - ~250 lines (Styles: line ~75-250)
├── 📄 Input.tsx           - ~470 lines (Styles: line ~310-470)
└── 📄 LoadingScreen.tsx   - ~360 lines (Styles: line ~260-360)
```

### 3. Authentication Screens (app/(auth)/)
```
📂 app/(auth)/
├── 📄 _layout.tsx         - Layout config (minimal styles)
├── 📄 login.tsx           - ~500 lines (Styles: line ~300-500)
└── 📄 signup.tsx          - ~600 lines (Styles: line ~400-600)
```

### 4. Tab Screens (app/(tabs)/)
```
📂 app/(tabs)/
├── 📄 _layout.tsx         - ~330 lines (Styles: line ~250-330)
├── 📄 index.tsx           - ~700 lines (Styles: line ~430-700)
├── 📄 scan.tsx            - ~500 lines (Styles: line ~300-500)
├── 📄 scan-result.tsx     - ~700 lines (Styles: line ~320-700)
├── 📄 clinics.tsx         - ~700 lines (Styles: line ~425-700)
├── 📄 donations.tsx       - ~720 lines (Styles: line ~493-720)
└── 📄 profile.tsx         - ~700 lines (Styles: line ~419-700)
```

### 5. Other Screens (app/)
```
📂 app/
├── 📄 _layout.tsx         - Root layout (inline styles)
├── 📄 index.tsx           - ~320 lines (Styles: line ~170-320)
├── 📄 admin.tsx           - ~400 lines (Styles: line ~200-400)
└── 📄 create-donation.tsx - ~650 lines (Styles: line ~490-650)
```

---

## 🗂️ Style Categories

### Category 1: Layout & Container Styles
**Location**: Found in all files with `StyleSheet.create`
```typescript
// Common patterns:
container: {
  flex: 1,
  backgroundColor: '#001F3F', // or '#FFFFFF' for light mode
}

content: {
  flex: 1,
  padding: 24,
}

section: {
  marginBottom: 24,
  paddingHorizontal: 24,
}
```

### Category 2: Typography Styles
**Primary Location**: `contexts/ThemeContext.tsx` (lines 91-97)
```typescript
typography: {
  h1: { fontSize: 32, fontWeight: '800', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
}
```

### Category 3: Spacing System
**Primary Location**: `contexts/ThemeContext.tsx` (lines 85-91)
```typescript
spacing: {
  xs: 4,   // 4px
  sm: 8,   // 8px
  md: 16,  // 16px
  lg: 24,  // 24px
  xl: 32,  // 32px
  xxl: 48, // 48px
}
```

### Category 4: Border Radius System
**Primary Location**: `contexts/ThemeContext.tsx` (lines 92-97)
```typescript
borderRadius: {
  sm: 8,   // Small corners
  md: 12,  // Medium corners
  lg: 16,  // Large corners
  xl: 24,  // Extra large corners
}
```

### Category 5: Shadow/Elevation System
**Primary Location**: `contexts/ThemeContext.tsx` (lines 98-139)
```typescript
// Light mode shadows
shadows: {
  sm: { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  md: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  lg: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  xl: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 12 },
}

// Dark mode shadows (with glow effect)
shadows: {
  sm: { shadowColor: '#00D4FF', shadowOpacity: 0.3, ... },
  md: { shadowColor: '#00D4FF', shadowOpacity: 0.4, ... },
  lg: { shadowColor: '#00D4FF', shadowOpacity: 0.5, ... },
  xl: { shadowColor: '#00D4FF', shadowOpacity: 0.6, ... },
}
```

### Category 6: Button Styles
**Primary Location**: `components/Button.tsx` (lines ~100-340)
```typescript
// Variants
primary:    { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' }
secondary:  { backgroundColor: '#001F3F', borderColor: '#001F3F' }
electric:   { backgroundColor: '#00D4FF', borderColor: '#00D4FF' }
outline:    { backgroundColor: 'transparent', borderColor: '#00D4FF' }
ghost:      { backgroundColor: 'transparent', borderColor: 'transparent' }
danger:     { backgroundColor: '#FF0066', borderColor: '#FF0066' }

// Sizes
small:  { paddingVertical: 10, paddingHorizontal: 20, minHeight: 40 }
medium: { paddingVertical: 14, paddingHorizontal: 28, minHeight: 52 }
large:  { paddingVertical: 18, paddingHorizontal: 36, minHeight: 60 }
xl:     { paddingVertical: 22, paddingHorizontal: 44, minHeight: 68 }
```

### Category 7: Card Styles
**Primary Location**: `components/Card.tsx` (lines ~75-250)
```typescript
// Variants
default:   { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }
elevated:  { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }
outlined:  { backgroundColor: 'transparent', borderColor: '#00D4FF' }
filled:    { backgroundColor: '#001F3F', borderColor: 'transparent' }
electric:  { backgroundColor: 'rgba(0, 212, 255, 0.1)', borderColor: '#00D4FF' }
gradient:  { backgroundColor: '#FFFFFF', borderColor: 'transparent' }

// Padding
paddingNone:   { padding: 0 }
paddingSmall:  { padding: 12 }
paddingMedium: { padding: 16 }
paddingLarge:  { padding: 24 }
```

### Category 8: Input Styles
**Primary Location**: `components/Input.tsx` (lines ~310-470)
```typescript
// Variants
default:  { backgroundColor: '#FFFFFF' }
outlined: { backgroundColor: 'transparent' }
filled:   { backgroundColor: '#001F3F', borderWidth: 0 }
electric: { shadowColor: '#00D4FF', shadowOpacity: 0.1 }

// Sizes
small:  { minHeight: 44 }
medium: { minHeight: 52 }
large:  { minHeight: 60 }

// States
- Focus: borderColor: '#00D4FF'
- Error: borderColor: '#FF0066'
- Success: borderColor: '#00FF88'
```

### Category 9: Gradient Styles
**Common Pattern**: Used across multiple components
```typescript
// Primary Gradient
colors: ['#00D4FF', '#001F3F']

// Secondary Gradient
colors: ['#00D4FF', '#00A8CC']

// Alternative Gradient
colors: ['#00D4FF', '#0096B8']

// Usage locations:
- Headers: app/(tabs)/index.tsx, clinics.tsx, donations.tsx, profile.tsx
- Buttons: components/Button.tsx
- Cards: components/Card.tsx
- Tab indicators: app/(tabs)/_layout.tsx
```

### Category 10: Animation Styles
**Common Pattern**: Found across all screens
```typescript
// Fade animations
fadeAnim: new Animated.Value(0)
Animated.timing(fadeAnim, { toValue: 1, duration: 800 })

// Slide animations
slideAnim: new Animated.Value(30)
Animated.timing(slideAnim, { toValue: 0, duration: 600 })

// Pulse animations
pulseAnim: new Animated.Value(1)
Animated.sequence([
  Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000 }),
  Animated.timing(pulseAnim, { toValue: 1, duration: 1000 })
])

// Scale animations
scaleAnim: new Animated.Value(0.8)
Animated.spring(scaleAnim, { toValue: 1, tension: 100 })
```

---

## 🔍 Quick Reference Guide

### To Change Global Colors
**File**: `contexts/ThemeContext.tsx`
**Lines**: 54-80 (darkColors), 82-96 (lightColors)
```typescript
// Edit these objects to change app-wide colors
const darkColors: ColorPalette = { ... }
const lightColors: ColorPalette = { ... }
```

### To Change Button Colors
**File**: `components/Button.tsx`
**Lines**: ~100-170 (StyleSheet section)
```typescript
// Find and edit:
primary: { backgroundColor: '#FFFFFF', ... }
secondary: { backgroundColor: '#001F3F', ... }
electric: { backgroundColor: '#00D4FF', ... }
```

### To Change Input Colors
**File**: `components/Input.tsx`
**Lines**: ~310-400 (StyleSheet section)
```typescript
// Find and edit:
default: { backgroundColor: '#FFFFFF' }
filled: { backgroundColor: '#001F3F' }
// Focus state at line ~116
```

### To Change Card Colors
**File**: `components/Card.tsx`
**Lines**: ~75-150 (StyleSheet section)
```typescript
// Find and edit:
default: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }
filled: { backgroundColor: '#001F3F' }
```

### To Change Tab Bar Colors
**File**: `app/(tabs)/_layout.tsx`
**Lines**: 62-65 (config), ~250-330 (styles)
```typescript
// Config section:
tabBarActiveTintColor: '#00D4FF',
tabBarInactiveTintColor: '#6C757D',

// Styles:
indicatorGradient: colors={['#00D4FF', '#001F3F']}
```

### To Change Screen Backgrounds
**Pattern**: Look for `container` style in each screen
```typescript
// Example locations:
- app/(tabs)/index.tsx:     line ~434
- app/(tabs)/clinics.tsx:   line ~425
- app/(tabs)/donations.tsx: line ~493
- app/(tabs)/profile.tsx:   line ~419

// Find and edit:
container: {
  flex: 1,
  backgroundColor: '#001F3F', // Change this
}
```

### To Change Header Gradients
**Pattern**: Look for `LinearGradient` with `colors` prop
```typescript
// Common locations:
- app/(tabs)/index.tsx:     line ~237
- app/(tabs)/clinics.tsx:   line ~294
- app/(tabs)/donations.tsx: line ~296
- app/(tabs)/profile.tsx:   line ~215

// Find and edit:
<LinearGradient
  colors={['#00D4FF', '#001F3F']} // Change these
  style={styles.headerGradient}
>
```

---


