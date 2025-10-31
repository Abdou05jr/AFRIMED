text: '#FFFFFF',           // <- Primary text (dark mode)
textSecondary: '#8B9CB1',  // <- Secondary text (dark mode)

// Light Mode:
text: '#000000',           // <- Primary text (light mode)
textSecondary: '#6C757D',  // <- Secondary text (light mode)
```

### 9. Change Border Colors
**Location**: `contexts/ThemeContext.tsx` (lines 62 & 90)
```typescript
// Dark Mode:
border: '#00D4FF',         // <- Border (dark mode)

// Light Mode:
border: '#00D4FF',         // <- Border (light mode)
```

### 10. Change Shadow Colors
**Location**: `contexts/ThemeContext.tsx` (lines ~140-167)
```typescript
// Dark Mode Shadows (Glow effect):
shadows: {
  sm: {
    shadowColor: '#00D4FF',  // <- CHANGE THIS
    shadowOpacity: 0.3,
  },
  md: {
    shadowColor: '#00D4FF',  // <- CHANGE THIS
    shadowOpacity: 0.4,
  },
  // ... etc
}
```

---

## 📋 COLOR PALETTE CHEAT SHEET

### Current Active Palette
```typescript
// Copy entire sections to use in your components

// PRIMARY COLORS
'#FFFFFF'  // White - Main light background
'#001F3F'  // Night Blue - Main dark background
'#000814'  // Dark Blue - Deep backgrounds
'#002855'  // Medium Blue - Surfaces

// ACCENT COLOR
'#00D4FF'  // Electric Blue - Main accent
'#00A8CC'  // Electric Blue Dark - Gradient end
'#0096B8'  // Electric Blue Alt - Alternative

// TEXT COLORS
'#000000'  // Black - Light mode text
'#FFFFFF'  // White - Dark mode text
'#6C757D'  // Gray - Secondary text
'#8B9CB1'  // Light Gray - Tertiary text

// BORDERS
'#E5E7EB'  // Light border
'#2D3748'  // Dark border

// STATES
'#00FF88'  // Success/Low risk
'#FFB800'  // Warning/Medium risk
'#FF0066'  // Error/Critical
'#FF3B30'  // High risk
'#8B0000'  // Dark red/Very critical

// SPECIAL
'#FFD700'  // Gold - Stars/ratings
'#4CD964'  // Green - Success alt
'#FF9500'  // Orange - Warning alt
```

---

## 🎯 FILE JUMP INDEX

### Components (Quick Access)
- **Button styles**: `components/Button.tsx` → Jump to line 100
- **Card styles**: `components/Card.tsx` → Jump to line 75
- **Input styles**: `components/Input.tsx` → Jump to line 310
- **Loading styles**: `components/LoadingScreen.tsx` → Jump to line 260

### Screens (Quick Access)
- **Home styles**: `app/(tabs)/index.tsx` → Jump to line 430
- **Clinics styles**: `app/(tabs)/clinics.tsx` → Jump to line 425
- **Donations styles**: `app/(tabs)/donations.tsx` → Jump to line 493
- **Profile styles**: `app/(tabs)/profile.tsx` → Jump to line 419
- **Scan styles**: `app/(tabs)/scan.tsx` → Jump to line 300
- **Scan Result styles**: `app/(tabs)/scan-result.tsx` → Jump to line 320
- **Login styles**: `app/(auth)/login.tsx` → Jump to line 300
- **Signup styles**: `app/(auth)/signup.tsx` → Jump to line 400
- **Create Donation styles**: `app/create-donation.tsx` → Jump to line 490

### Configuration (Quick Access)
- **Theme colors**: `contexts/ThemeContext.tsx` → Jump to line 54
- **Android colors**: `android/app/src/main/res/values/colors.xml` → Jump to line 2

---

## 🔍 SEARCH PATTERNS

### Find All Colors
**Search**: `#[0-9A-Fa-f]{6}` (Enable regex)

### Find Specific Color
**Search**: `#00D4FF` (or any hex color)

### Find All Styles
**Search**: `StyleSheet.create`

### Find All Gradients
**Search**: `LinearGradient`

### Find Background Colors
**Search**: `backgroundColor:`

### Find Text Colors
**Search**: `color:` (in style objects)

### Find Border Colors
**Search**: `borderColor:`

### Find Shadow Definitions
**Search**: `shadowColor:`

---

## 💡 COMMON EDITS - STEP BY STEP

### Edit #1: Change App's Main Accent Color
**Goal**: Change from Electric Blue (#00D4FF) to your color

**Steps**:
1. Open `contexts/ThemeContext.tsx`
2. Find line 58: `secondary: '#00D4FF'`
3. Change to: `secondary: '#YOUR_COLOR'`
4. Find line 86: `secondary: '#00D4FF'`
5. Change to: `secondary: '#YOUR_COLOR'`
6. Open `app/(tabs)/_layout.tsx`
7. Find line 62: `tabBarActiveTintColor: '#00D4FF'`
8. Change to: `tabBarActiveTintColor: '#YOUR_COLOR'`
9. **Save all files**

**Files changed**: 2 files  
**Time estimate**: 2 minutes

---

### Edit #2: Change All Button Styles
**Goal**: Update button appearance

**Steps**:
1. Open `components/Button.tsx`
2. Scroll to line ~100
3. Find `StyleSheet.create({`
4. Edit button variants (lines 115-127):
   ```typescript
   primary: {
     backgroundColor: '#YOUR_COLOR',
     borderColor: '#YOUR_COLOR',
   },
   ```
5. **Save file**

**Files changed**: 1 file  
**Time estimate**: 3 minutes

---

### Edit #3: Change Header Gradient Across App
**Goal**: Unified header look

**Steps**:
1. Decide on gradient colors: `['#START', '#END']`
2. Open each file and replace:
   - `app/(tabs)/index.tsx` line ~237
   - `app/(tabs)/clinics.tsx` line ~294
   - `app/(tabs)/donations.tsx` line ~296
   - `app/(tabs)/profile.tsx` line ~215
3. Find `colors={['#00D4FF', '#001F3F']}`
4. Replace with `colors={['#START', '#END']}`
5. **Save all files**

**Files changed**: 4-5 files  
**Time estimate**: 5 minutes

---

### Edit #4: Change Dark Mode Background
**Goal**: Update dark theme background

**Steps**:
1. Open `contexts/ThemeContext.tsx`
2. Find line 56: `background: '#000814'`
3. Change to: `background: '#YOUR_DARK_COLOR'`
4. Find line 57: `surface: '#001F3F'`
5. Change to: `surface: '#YOUR_SURFACE_COLOR'`
6. **Save file**

**Files changed**: 1 file  
**Time estimate**: 1 minute

---

### Edit #5: Change Card Styling
**Goal**: Update all card appearances

**Steps**:
1. Open `components/Card.tsx`
2. Scroll to line ~75
3. Find `StyleSheet.create({`
4. Edit card variants (lines 96-112)
5. **Save file**

**Files changed**: 1 file  
**Time estimate**: 3 minutes

---

## 🛠️ ADVANCED EDITS

### Create Custom Gradient
```typescript
// 1. Define gradient colors
const GRADIENT_START = '#YOUR_START';
const GRADIENT_END = '#YOUR_END';

// 2. Use in component
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={[GRADIENT_START, GRADIENT_END]}
  start={{ x: 0, y: 0 }}    // Top-left
  end={{ x: 1, y: 1 }}      // Bottom-right
  style={styles.yourStyle}
>
  {/* Your content */}
</LinearGradient>
```

### Create Custom Shadow
```typescript
// iOS + Android compatible shadow
yourElement: {
  // iOS
  shadowColor: '#YOUR_COLOR',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  // Android
  elevation: 8,
}
```

### Create Responsive Sizing
```typescript
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

yourElement: {
  width: width * 0.9,        // 90% of screen
  height: height * 0.3,      // 30% of screen
  maxWidth: width - 48,      // Full width minus margins
}
```

### Create Conditional Styles
```typescript
// Method 1: Array syntax
<View style={[
  styles.base,
  isActive && styles.active,
  hasError && styles.error,
]} />

// Method 2: Ternary operator
<View style={
  isActive ? styles.active : styles.inactive
} />

// Method 3: Object merge
<View style={{
  ...styles.base,
  backgroundColor: isActive ? '#00D4FF' : '#FFFFFF',
}} />
```

---

## 📊 STYLE STATISTICS

### By Category
- **Layout Styles**: ~150 declarations
- **Typography Styles**: ~80 declarations
- **Color Styles**: ~200 declarations
- **Spacing Styles**: ~120 declarations
- **Animation Styles**: ~60 declarations
- **Shadow/Elevation**: ~40 declarations

### By Location
- **Components (4 files)**: ~400 style declarations
- **Tabs (7 files)**: ~800 style declarations
- **Auth Screens (2 files)**: ~200 style declarations
- **Other Screens (4 files)**: ~300 style declarations
- **Contexts (1 file)**: ~50 style declarations

### Most Common Values
- **Padding**: 16px, 24px, 12px
- **Border Radius**: 12px, 16px, 20px
- **Font Sizes**: 14px, 16px, 18px, 24px
- **Font Weights**: '400', '500', '600', '700', '800'

---

## ⚡ SPEED TIPS

### Tip 1: Use Find & Replace
- Press `Ctrl+H` (Windows) or `Cmd+H` (Mac)
- Find: `#00D4FF`
- Replace: `#YOUR_COLOR`
- Click "Replace All" in specific files

### Tip 2: Multi-Cursor Editing
- Select text
- Press `Ctrl+D` (Windows) or `Cmd+D` (Mac) to select next occurrence
- Edit all at once

### Tip 3: Use Color Picker
- Install "Color Highlight" extension
- Hover over hex colors to see preview
- Click to open color picker

### Tip 4: Create Snippets
Save common color values as code snippets for quick access

### Tip 5: Use Theme Variables
Instead of hardcoding, use:
```typescript
const { theme } = useTheme();
backgroundColor: theme.colors.primary
```

---

## 🎨 COLOR PRESETS

### Preset 1: Ocean Blue
```typescript
PRIMARY: '#1E88E5'
SECONDARY: '#0D47A1'
ACCENT: '#42A5F5'
```

### Preset 2: Forest Green
```typescript
PRIMARY: '#2E7D32'
SECONDARY: '#1B5E20'
ACCENT: '#66BB6A'
```

### Preset 3: Sunset Orange
```typescript
PRIMARY: '#FF6F00'
SECONDARY: '#E65100'
ACCENT: '#FFA726'
```

### Preset 4: Royal Purple
```typescript
PRIMARY: '#7B1FA2'
SECONDARY: '#4A148C'
ACCENT: '#BA68C8'
```

### Preset 5: Modern Red
```typescript
PRIMARY: '#D32F2F'
SECONDARY: '#B71C1C'
ACCENT: '#EF5350'
```

---

## 📝 CHANGE LOG TEMPLATE

```markdown
### [Date] - Style Update

**Changed**:
- [ ] Primary color from #OLD to #NEW
- [ ] Secondary color from #OLD to #NEW
- [ ] Button styles updated
- [ ] Card styles updated
- [ ] Header gradients updated

**Files Modified**:
- contexts/ThemeContext.tsx
- components/Button.tsx
- components/Card.tsx
- app/(tabs)/_layout.tsx

**Testing**:
- [ ] iOS build tested
- [ ] Android build tested
- [ ] Dark mode verified
- [ ] Light mode verified
- [ ] Accessibility checked
```

---

**Created**: October 31, 2025  
**Version**: 1.0.0  
**For**: AfriMed v2 Mobile Application
# 🎨 Style Quick Reference & Cheat Sheet
**AfriMed v2 - Fast Style Editing Guide**

---

## 🚀 INSTANT EDITS - Copy & Paste Ready

### 1. Change Primary Button Color
**Location**: `components/Button.tsx` (line ~115)
```typescript
// FIND THIS:
primary: {
  backgroundColor: '#FFFFFF',
  borderColor: '#FFFFFF',
},

// REPLACE WITH YOUR COLOR:
primary: {
  backgroundColor: '#YOUR_COLOR',
  borderColor: '#YOUR_COLOR',
},
```

### 2. Change Electric Blue Accent
**Location**: `contexts/ThemeContext.tsx` (lines 58 & 86)
```typescript
// FIND THIS (Dark Mode):
secondary: '#00D4FF',
accent: '#00D4FF',

// FIND THIS (Light Mode):
secondary: '#00D4FF',
accent: '#00D4FF',

// REPLACE WITH:
secondary: '#YOUR_COLOR',
accent: '#YOUR_COLOR',
```

### 3. Change Tab Bar Active Color
**Location**: `app/(tabs)/_layout.tsx` (line 62)
```typescript
// FIND THIS:
tabBarActiveTintColor: '#00D4FF',

// REPLACE WITH:
tabBarActiveTintColor: '#YOUR_COLOR',
```

### 4. Change All Header Gradients
**Locations**: Multiple files

**File 1**: `app/(tabs)/index.tsx` (line ~237)
```typescript
<LinearGradient
  colors={['#00D4FF', '#001F3F']}  // <- CHANGE THESE
  style={styles.headerGradient}
>
```

**File 2**: `app/(tabs)/clinics.tsx` (line ~294)
```typescript
<LinearGradient
  colors={['#00D4FF', '#001F3F']}  // <- CHANGE THESE
  style={styles.headerGradient}
>
```

**File 3**: `app/(tabs)/donations.tsx` (line ~296)
```typescript
<LinearGradient
  colors={['#00D4FF', '#001F3F']}  // <- CHANGE THESE
  style={styles.headerGradient}
>
```

**File 4**: `app/(tabs)/profile.tsx` (line ~215)
```typescript
<LinearGradient
  colors={['#00D4FF', '#001F3F']}  // <- CHANGE THESE
  style={styles.headerGradient}
>
```

**File 5**: `app/create-donation.tsx` (line ~519)
```typescript
backgroundColor: 'linear-gradient(45deg, #00D4FF 0%, #FFFFFF 100%)',
// CHANGE TO:
backgroundColor: 'linear-gradient(45deg, #YOUR_START 0%, #YOUR_END 100%)',
```

### 5. Change Screen Background Color
**Pattern**: Find `container` style in each file

**Home Screen**: `app/(tabs)/index.tsx` (line ~434)
```typescript
container: {
  flex: 1,
  backgroundColor: '#F8F9FA',  // <- CHANGE THIS
},
```

**Clinics Screen**: `app/(tabs)/clinics.tsx` (line ~425)
```typescript
container: {
  flex: 1,
  backgroundColor: '#F8F9FA',  // <- CHANGE THIS
},
```

**Donations Screen**: `app/(tabs)/donations.tsx` (line ~493)
```typescript
container: {
  flex: 1,
  backgroundColor: '#F8F9FA',  // <- CHANGE THIS
},
```

**Profile Screen**: `app/(tabs)/profile.tsx` (line ~419)
```typescript
container: {
  flex: 1,
  backgroundColor: '#F8F9FA',  // <- CHANGE THIS
},
```

**Scan Result**: `app/(tabs)/scan-result.tsx` (line ~320)
```typescript
container: {
  flex: 1,
  backgroundColor: '#001F3F',  // <- CHANGE THIS (Dark)
},
```

### 6. Change Card Background Colors
**Location**: `components/Card.tsx` (lines ~96-112)
```typescript
// FIND THESE:
default: {
  backgroundColor: '#FFFFFF',      // <- Light card
  borderColor: '#E5E7EB',
},
filled: {
  backgroundColor: '#001F3F',      // <- Dark card
  borderColor: 'transparent',
},
electric: {
  backgroundColor: 'rgba(0, 212, 255, 0.1)',  // <- Electric card
  borderColor: '#00D4FF',
},

// REPLACE WITH YOUR COLORS
```

### 7. Change Input Background Colors
**Location**: `components/Input.tsx` (lines ~336-347)
```typescript
// FIND THESE:
default: {
  // Base styles
},
outlined: {
  backgroundColor: 'transparent',
},
filled: {
  borderWidth: 0,
  backgroundColor: '#001F3F',      // <- CHANGE THIS
},
```

### 8. Change Text Colors
**Location**: `contexts/ThemeContext.tsx` (lines 60-61 & 88-89)
```typescript
// Dark Mode:

