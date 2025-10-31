import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useAuth } from './AuthContext';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
};

export type Theme = {
  colors: ColorPalette;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: { fontSize: number; fontWeight: string; lineHeight: number };
    h2: { fontSize: number; fontWeight: string; lineHeight: number };
    h3: { fontSize: number; fontWeight: string; lineHeight: number };
    body: { fontSize: number; fontWeight: string; lineHeight: number };
    caption: { fontSize: number; fontWeight: string; lineHeight: number };
  };
  shadows: {
    sm: object;
    md: object;
    lg: object;
    xl: object;
  };
};

// New color palette: White, Night Blue, Dark Blue
const darkColors: ColorPalette = {
  primary: '#001F3F', // Night blue (Primary dark)
  secondary: '#000814', // Dark blue (Secondary)
  accent: '#000814', // Dark blue accent
  background: '#001F3F', // Night blue background
  surface: '#002855', // Slightly lighter night blue
  card: '#002855', // Card background
  text: '#000000', // Black text
  textSecondary: '#666666', // Gray text
  border: '#000814', // Dark blue border
  error: '#FF0066', // Error red
  warning: '#FFB800', // Warning yellow
  success: '#00FF88', // Success green
  info: '#000814', // Info dark blue
};

const lightColors: ColorPalette = {
  primary: '#FFFFFF', // White (Primary light)
  secondary: '#000814', // Dark blue (Secondary)
  accent: '#000814', // Dark blue accent
  background: '#FFFFFF', // White background
  surface: '#F8F9FA', // Very light gray surface
  card: '#FFFFFF', // White cards
  text: '#000000', // Black text
  textSecondary: '#666666', // Gray text
  border: '#000814', // Dark blue border
  error: '#FF3B30', // iOS red
  warning: '#FF9500', // iOS orange
  success: '#34C759', // iOS green
  info: '#000814', // Info dark blue
};

// Common design tokens
const commonTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '800', lineHeight: 40, fontFamily: 'SF Pro Display' },
    h2: { fontSize: 24, fontWeight: '700', lineHeight: 32, fontFamily: 'SF Pro Display' },
    h3: { fontSize: 20, fontWeight: '600', lineHeight: 28, fontFamily: 'SF Pro Display' },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24, fontFamily: 'SF Pro Text' },
    caption: { fontSize: 14, fontWeight: '400', lineHeight: 20, fontFamily: 'SF Pro Text' },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12,
    },
  },
};

// Complete themes
const darkTheme: Theme = {
  colors: darkColors,
  ...commonTheme,
  shadows: {
    sm: {
      shadowColor: '#00D4FF',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#00D4FF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#00D4FF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    xl: {
      shadowColor: '#00D4FF',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 12,
    },
  },
};

const lightTheme: Theme = {
  colors: lightColors,
  ...commonTheme,
};

// Context type
interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook for using theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Provider component
interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeMode;
}

export function ThemeProvider({ children, initialTheme = 'auto' }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const { profile } = useAuth();

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Get initial theme from user preferences or system
    return profile?.preferences?.theme || initialTheme;
  });

  // Determine actual theme based on mode
  const resolvedTheme = themeMode === 'auto'
    ? (systemColorScheme === 'dark' ? 'dark' : 'light')
    : themeMode;

  const theme = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const isDark = resolvedTheme === 'dark';

  // Save theme preference when it changes
  useEffect(() => {
    // In a real app, you would save this to the user's profile
    console.log('Theme changed to:', themeMode);
  }, [themeMode]);

  // Sync with system theme changes
  useEffect(() => {
    if (themeMode === 'auto') {
      // Theme will automatically update via resolvedTheme
    }
  }, [systemColorScheme, themeMode]);

  const toggleTheme = () => {
    setThemeMode(current => {
      if (current === 'dark') return 'light';
      if (current === 'light') return 'auto';
      return 'dark';
    });
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Utility functions for theme usage
export const ThemeUtils = {
  // Create styled component helper
  createStyles: (callback: (theme: Theme) => any) => callback,

  // Color manipulation utilities
  darken: (color: string, percent: number): string => {
    // Simple darken function - in production, use a proper color library
    return color; // Implement proper color manipulation
  },

  lighten: (color: string, percent: number): string => {
    // Simple lighten function
    return color; // Implement proper color manipulation
  },

  // Get contrast color for text
  getContrastColor: (backgroundColor: string): string => {
    // Simple contrast detection
    return backgroundColor === darkColors.background ? '#FFFFFF' : '#000000';
  },

  // Animation colors
  getAnimationColors: (theme: Theme) => ({
    pulse: theme.colors.primary,
    shimmer: theme.colors.accent,
    glow: theme.colors.info,
  }),

  // Medical-specific color mappings
  getMedicalColors: (theme: Theme) => ({
    lowRisk: theme.colors.success,
    mediumRisk: theme.colors.warning,
    highRisk: theme.colors.error,
    critical: '#8B0000', // Dark red for critical
    normal: theme.colors.success,
    abnormal: theme.colors.warning,
    emergency: theme.colors.error,
  }),

  // Status colors
  getStatusColors: (theme: Theme) => ({
    pending: theme.colors.warning,
    verified: theme.colors.success,
    completed: theme.colors.success,
    rejected: theme.colors.error,
    inProgress: theme.colors.info,
  }),
};

// Hook for medical-specific theme colors
export function useMedicalTheme() {
  const { theme } = useTheme();

  return {
    riskColors: ThemeUtils.getMedicalColors(theme),
    statusColors: ThemeUtils.getStatusColors(theme),
    animationColors: ThemeUtils.getAnimationColors(theme),
  };
}

// Hook for component-specific theming
export function useComponentTheme(componentName: string) {
  const { theme } = useTheme();

  const componentThemes = {
    button: {
      primary: {
        backgroundColor: theme.colors.primary,
        textColor: theme.colors.background,
        borderColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.surface,
        textColor: theme.colors.text,
        borderColor: theme.colors.border,
      },
      danger: {
        backgroundColor: theme.colors.error,
        textColor: '#FFFFFF',
        borderColor: theme.colors.error,
      },
    },
    card: {
      default: {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        shadow: theme.shadows.md,
      },
      elevated: {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.primary,
        shadow: theme.shadows.lg,
      },
    },
    input: {
      default: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        textColor: theme.colors.text,
        placeholderColor: theme.colors.textSecondary,
      },
      focused: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.primary,
        textColor: theme.colors.text,
      },
      error: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.error,
        textColor: theme.colors.text,
      },
    },
  };

  return componentThemes[componentName as keyof typeof componentThemes] || {};
}

export default ThemeContext;
