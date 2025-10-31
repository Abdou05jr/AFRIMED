# 🗺️ Visual Style Map - AfriMed v2
**Complete Visual Reference for Style Locations**

---

## 📊 PROJECT STRUCTURE MAP

```
afrimedv2/
│
├── 📂 android/
│   └── app/src/main/res/
│       ├── values/colors.xml           ← Native Android colors
│       └── values-night/colors.xml     ← Dark mode Android colors
│
├── 📂 app/
│   ├── _layout.tsx                     ← Root layout (inline styles)
│   ├── index.tsx                       ← Splash screen (styles: 170-320)
│   ├── admin.tsx                       ← Admin dashboard (styles: 200-400)
│   ├── create-donation.tsx             ← Donation form (styles: 490-650)
│   │
│   ├── 📂 (auth)/
│   │   ├── _layout.tsx                 ← Auth layout
│   │   ├── login.tsx                   ← Login screen (styles: 300-500)
│   │   └── signup.tsx                  ← Signup screen (styles: 400-600)
│   │
│   └── 📂 (tabs)/
│       ├── _layout.tsx                 ← Tab bar config (styles: 250-330)
│       ├── index.tsx                   ← Home screen (styles: 430-700)
│       ├── scan.tsx                    ← Scan screen (styles: 300-500)
│       ├── scan-result.tsx             ← Results (styles: 320-700)
│       ├── clinics.tsx                 ← Clinics list (styles: 425-700)
│       ├── donations.tsx               ← Donations (styles: 493-720)
│       └── profile.tsx                 ← Profile (styles: 419-700)
│
├── 📂 components/
│   ├── Button.tsx                      ← Button component (styles: 100-340)
│   ├── Card.tsx                        ← Card component (styles: 75-250)
│   ├── Input.tsx                       ← Input component (styles: 310-470)
│   └── LoadingScreen.tsx               ← Loading (styles: 260-360)
│
└── 📂 contexts/
    ├── ThemeContext.tsx                ← MAIN THEME CONFIG (lines 54-170)
    ├── AuthContext.tsx                 ← Auth context
    └── NotificationContext.tsx         ← Notifications
```

---

## 🎨 COLOR FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│         THEME CONTEXT (Single Source of Truth)              │
│         contexts/ThemeContext.tsx                           │
│                                                             │
│  darkColors:                    lightColors:                │
│  ├─ primary: #001F3F           ├─ primary: #FFFFFF         │
│  ├─ secondary: #00D4FF         ├─ secondary: #00D4FF       │
│  ├─ accent: #00D4FF            ├─ accent: #00D4FF          │
│  ├─ background: #000814        ├─ background: #F8F9FA      │
│  ├─ surface: #001F3F           ├─ surface: #FFFFFF         │
│  ├─ text: #FFFFFF              ├─ text: #000000            │
│  └─ border: #00D4FF            └─ border: #00D4FF          │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────┴──────────────────┐
        ↓                                      ↓
┌─────────────────┐                  ┌─────────────────┐
│   COMPONENTS    │                  │     SCREENS     │
├─────────────────┤                  ├─────────────────┤
│ • Button        │                  │ • Home          │
│ • Card          │                  │ • Clinics       │
│ • Input         │                  │ • Donations     │
│ • LoadingScreen │                  │ • Profile       │
└─────────────────┘                  │ • Scan          │
                                     │ • Login         │
                                     └─────────────────┘
```

---

## 🔄 GRADIENT USAGE MAP

### Primary Gradient Pattern
**Colors**: `['#00D4FF', '#001F3F']`  
**Usage**: Main headers, primary accents

```
Used in:
├─ app/(tabs)/index.tsx         (line 237)  ← Home header
├─ app/(tabs)/clinics.tsx       (line 294)  ← Clinics header
├─ app/(tabs)/donations.tsx     (line 296)  ← Donations header
├─ app/(tabs)/profile.tsx       (line 215)  ← Profile header
├─ app/(tabs)/_layout.tsx       (line 52)   ← Tab indicator
├─ components/Button.tsx        (line 127)  ← Electric button
└─ components/Card.tsx          (line 105)  ← Electric card
```

### Secondary Gradient Pattern
**Colors**: `['#00D4FF', '#00A8CC']`  
**Usage**: Alternative accents, buttons

```
Used in:
├─ app/(tabs)/clinics.tsx       (line 267)  ← Call button
├─ app/(tabs)/donations.tsx     (line 189)  ← Icon gradient
├─ app/(tabs)/donations.tsx     (line 479)  ← FAB button
└─ components/Button.tsx        (line 119)  ← Secondary button
```

---

## 🎯 COMPONENT STYLE HIERARCHY

### Button Component Hierarchy
```
components/Button.tsx
│
├─ Base Style (line 100)
│   ├─ borderRadius: 16
│   ├─ alignItems: 'center'
│   └─ borderWidth: 2
│
├─ Variants (lines 115-127)
│   ├─ primary    → #FFFFFF background
│   ├─ secondary  → #001F3F background
│   ├─ electric   → #00D4FF background
│   ├─ outline    → Transparent + #00D4FF border
│   ├─ ghost      → Transparent
│   └─ danger     → #FF0066 background
│
├─ Sizes (lines 133-148)
│   ├─ small  → minHeight: 40
│   ├─ medium → minHeight: 52
│   ├─ large  → minHeight: 60
│   └─ xl     → minHeight: 68
│
└─ Text Styles (lines 183-201)
    ├─ primaryText    → #000000
    ├─ secondaryText  → #FFFFFF
    ├─ electricText   → #FFFFFF
    └─ outlineText    → #00D4FF
```

### Card Component Hierarchy
```
components/Card.tsx
│
├─ Base Style (line 79)
│   ├─ position: 'relative'
│   ├─ overflow: 'hidden'
│   └─ borderWidth: 1
│
├─ Variants (lines 96-112)
│   ├─ default   → #FFFFFF + #E5E7EB border
│   ├─ elevated  → #FFFFFF + shadow
│   ├─ outlined  → Transparent + #00D4FF border
│   ├─ filled    → #001F3F
│   ├─ gradient  → #FFFFFF + gradient overlay
│   └─ electric  → rgba(0,212,255,0.1) + #00D4FF border
│
├─ Padding (lines 118-127)
│   ├─ none   → 0
│   ├─ small  → 12
│   ├─ medium → 16
│   └─ large  → 24
│
└─ Border Radius (lines 129-138)
    ├─ small  → 8
    ├─ medium → 16
    ├─ large  → 20
    └─ xl     → 24
```

---

## 📱 SCREEN LAYOUT PATTERNS

### Typical Screen Structure
```
┌─────────────────────────────────────┐
│         Header Gradient              │ ← LinearGradient
│    (Electric Blue → Night Blue)     │   colors: ['#00D4FF', '#001F3F']
│                                      │
│  Title                    Avatar    │
│  Subtitle                           │
│  Stats Row                          │
├─────────────────────────────────────┤
│                                      │
│         Content Section              │ ← ScrollView
│                                      │   backgroundColor: '#F8F9FA'
│  ┌──────────────────────────────┐  │
│  │         Card                  │  │ ← Card component
│  │  (White background)           │  │   backgroundColor: '#FFFFFF'
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │         Card                  │  │
│  └──────────────────────────────┘  │
│                                      │
├─────────────────────────────────────┤
│         Tab Bar                      │ ← Bottom navigation
│   Home  Scan  Donate  Clinics       │   Active: #00D4FF
└─────────────────────────────────────┘   Inactive: #6C757D
```

---

## 🔍 STYLE SEARCH PATTERNS

### Pattern 1: Find Backgrounds
```bash
# Search term:
backgroundColor:

# Common values found:
'#FFFFFF'      → White cards/screens
'#001F3F'      → Dark backgrounds
'#F8F9FA'      → Light gray backgrounds
'#000814'      → Very dark backgrounds
'transparent'  → Transparent elements
```

### Pattern 2: Find Text Colors
```bash
# Search term:
color:

# Common values found:
'#000000'  → Black text (light mode)
'#FFFFFF'  → White text (dark mode)
'#6C757D'  → Gray secondary text
'#00D4FF'  → Accent text/links
'#8B9CB1'  → Tertiary text
```

### Pattern 3: Find Borders
```bash
# Search term:
borderColor:

# Common values found:
'#00D4FF'  → Electric blue borders
'#E5E7EB'  → Light gray borders
'#2D3748'  → Dark borders
'transparent' → No border
```

### Pattern 4: Find Shadows
```bash
# Search term:
shadowColor:

# Common values found:
'#00D4FF'  → Electric glow (dark mode)
'#000'     → Standard shadow (light mode)
'#667eea'  → (Legacy - replaced with #00D4FF)
```

---

## 🎨 COLOR USAGE MATRIX

### By Component Type

| Component | Primary Color | Secondary Color | Accent Color | Text Color |
|-----------|--------------|-----------------|--------------|------------|
| Button (Primary) | #FFFFFF | #000000 | - | #000000 |
| Button (Secondary) | #001F3F | - | - | #FFFFFF |
| Button (Electric) | #00D4FF | - | - | #FFFFFF |
| Card (Default) | #FFFFFF | #E5E7EB | - | #000000 |
| Card (Filled) | #001F3F | - | - | #FFFFFF |
| Card (Electric) | rgba(0,212,255,0.1) | #00D4FF | - | #000000 |
| Input (Default) | #FFFFFF | #E5E7EB | #00D4FF | #000000 |
| Input (Filled) | #001F3F | - | #00D4FF | #FFFFFF |
| Tab Bar (Active) | - | - | #00D4FF | #00D4FF |
| Tab Bar (Inactive) | - | - | - | #6C757D |
| Header | Gradient | Gradient | - | #FFFFFF |
| Screen BG (Light) | #F8F9FA | - | - | #000000 |
| Screen BG (Dark) | #001F3F | - | - | #FFFFFF |

---

## 📐 SPACING SCALE VISUAL

```
xs  ████         (4px)   - Tiny gaps
sm  ████████     (8px)   - Small spacing
md  ████████████████  (16px)  - Standard spacing
lg  ████████████████████████  (24px)  - Large spacing
xl  ████████████████████████████████  (32px)  - Extra large
xxl ████████████████████████████████████████████  (48px)  - Massive
```

### Usage Examples
```typescript
// Extra Small (4px)
gap: theme.spacing.xs          // Between icon and text

// Small (8px)
marginBottom: theme.spacing.sm  // Between small elements

// Medium (16px)
padding: theme.spacing.md       // Standard padding

// Large (24px)
paddingHorizontal: theme.spacing.lg  // Screen margins

// Extra Large (32px)
marginTop: theme.spacing.xl     // Section separation

// XXL (48px)
paddingTop: theme.spacing.xxl   // Major sections
```

---

## 🌓 DARK MODE vs LIGHT MODE

### Color Mappings

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Screen Background | #F8F9FA | #001F3F |
| Card Background | #FFFFFF | #002855 |
| Primary Text | #000000 | #FFFFFF |
| Secondary Text | #6C757D | #8B9CB1 |
| Border | #E5E7EB | #00D4FF |
| Accent | #00D4FF | #00D4FF |
| Shadow | #000 (opacity 0.1) | #00D4FF (glow) |

### Switching Logic
**Location**: `contexts/ThemeContext.tsx` (lines 219-225)
```typescript
const resolvedTheme = themeMode === 'auto'
  ? (systemColorScheme === 'dark' ? 'dark' : 'light')
  : themeMode;

const theme = resolvedTheme === 'dark' ? darkTheme : lightTheme;
```

---

## 🔧 MODIFICATION WORKFLOW

### Workflow 1: Change Single Color
```
Step 1: Identify color location
   ↓
Step 2: Search for hex code (#00D4FF)
   ↓
Step 3: Review all occurrences
   ↓
Step 4: Decide scope (all or specific)
   ↓
Step 5: Replace color value
   ↓
Step 6: Test in both modes
   ↓
Step 7: Verify contrast/accessibility
```

### Workflow 2: Add New Color
```
Step 1: Add to ThemeContext
   contexts/ThemeContext.tsx
   ↓
Step 2: Add to ColorPalette type
   (if not already defined)
   ↓
Step 3: Add to darkColors object
   (line ~54)
   ↓
Step 4: Add to lightColors object
   (line ~82)
   ↓
Step 5: Use in components
   theme.colors.yourNewColor
```

### Workflow 3: Update Component Style
```
Step 1: Locate component file
   ↓
Step 2: Find StyleSheet.create
   ↓
Step 3: Identify style object
   ↓
Step 4: Modify values
   ↓
Step 5: Check related variants
   ↓
Step 6: Test all states
```

---

## 📊 STYLE IMPACT ANALYSIS

### High Impact Changes (Affect entire app)
```
✓ contexts/ThemeContext.tsx          → All screens
✓ components/Button.tsx              → All buttons
✓ components/Card.tsx                → All cards
✓ components/Input.tsx               → All inputs
✓ app/(tabs)/_layout.tsx            → All tab navigation
```

### Medium Impact Changes (Affect specific section)
```
✓ app/(tabs)/index.tsx              → Home screen only
✓ app/(tabs)/clinics.tsx            → Clinics section only
✓ app/(tabs)/donations.tsx          → Donations section only
✓ app/(tabs)/profile.tsx            → Profile section only
```

### Low Impact Changes (Affect single screen)
```
✓ app/(auth)/login.tsx              → Login screen only
✓ app/(auth)/signup.tsx             → Signup screen only
✓ app/create-donation.tsx           → Create donation only
✓ app/admin.tsx                     → Admin dashboard only
```

---

## 🎯 TESTING CHECKLIST

### After Style Changes
```
□ Light mode tested
□ Dark mode tested
□ iOS appearance verified
□ Android appearance verified
□ Tablet layout checked
□ Accessibility contrast verified (WCAG AA)
□ Animation smoothness confirmed
□ Touch targets adequate (44px minimum)
□ Text readability confirmed
□ Color blindness simulation tested
```

---

## 📝 NOTES

### Known Style Dependencies
1. **Button → Theme**: Buttons rely on theme colors
2. **Card → Theme**: Cards use theme spacing/colors
3. **Input → Theme**: Inputs use theme borders/shadows
4. **Screens → Components**: Screens use all components
5. **Tab Bar → Theme**: Navigation uses theme accents

### Style Override Priority
```
1. Inline styles (highest)
2. Style prop
3. StyleSheet styles
4. Theme defaults (lowest)
```

### Performance Considerations
- StyleSheet.create caches styles (faster)
- Inline styles recreated on each render (slower)
- Use StyleSheet.create for static styles
- Use inline for dynamic styles only

---

**Created**: October 31, 2025  
**Version**: 1.0.0  
**For**: AfriMed v2 Development Team

