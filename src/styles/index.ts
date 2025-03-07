/**
 * Styles index file
 * Exports all style-related constants and utilities
 */

import colors from './colors';
import typography from './typography';
import spacingModule from './spacing';

// Re-export individual components
export const { spacing, layout, borderRadius, shadows } = spacingModule;
export const {
  fontSize, 
  lineHeight, 
  fontWeight, 
  letterSpacing
} = typography;

// Create a copy of typography without the problematic fontFamily
const safeTypography = {
  fontSize: typography.fontSize,
  lineHeight: typography.lineHeight,
  fontWeight: typography.fontWeight,
  letterSpacing: typography.letterSpacing,
  // We won't include fontFamily or textStyle because they might have fontFamily references
};

// Theme object for use with ThemeContext
export const theme = {
  light: {
    colors: colors.light,
    typography: safeTypography, // Use safe version without fontFamily
    spacing: spacingModule.spacing,
    layout: spacingModule.layout,
    borderRadius: spacingModule.borderRadius,
    shadows: spacingModule.shadows,
  },
  dark: {
    colors: colors.dark,
    typography: safeTypography, // Use safe version without fontFamily
    spacing: spacingModule.spacing,
    layout: spacingModule.layout,
    borderRadius: spacingModule.borderRadius,
    shadows: spacingModule.shadows,
  },
};

// Helper for getting themed styles (used with useTheme hook)
export const getThemedStyles = (isDarkMode: boolean) => {
  return isDarkMode ? theme.dark : theme.light;
};

// Export all styles
export default {
  colors,
  typography: safeTypography, // Use safe version without fontFamily
  spacing: spacingModule.spacing,
  layout: spacingModule.layout,
  borderRadius: spacingModule.borderRadius,
  shadows: spacingModule.shadows,
  theme,
  getThemedStyles,
};
