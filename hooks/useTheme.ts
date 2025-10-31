import { useTheme as useBaseTheme, useMedicalTheme, useComponentTheme } from '@/contexts/ThemeContext';

// Re-export all theme hooks with shorter names
export { useMedicalTheme, useComponentTheme };

// Main theme hook
export const useTheme = useBaseTheme;
