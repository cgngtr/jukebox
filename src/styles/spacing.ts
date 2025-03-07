/**
 * Spacing constants for the application
 * Defines consistent spacing scales for margins, paddings, and gaps
 */

// Base spacing unit (4 pixels)
const BASE_UNIT = 4;

// Spacing scale using the base unit
export const spacing = {
  none: 0,
  xxs: BASE_UNIT / 2, // 2px
  xs: BASE_UNIT,      // 4px
  sm: BASE_UNIT * 2,  // 8px
  md: BASE_UNIT * 3,  // 12px
  base: BASE_UNIT * 4, // 16px - standard spacing
  lg: BASE_UNIT * 6,  // 24px
  xl: BASE_UNIT * 8,  // 32px
  xxl: BASE_UNIT * 12, // 48px
  xxxl: BASE_UNIT * 16, // 64px
};

// Common layout constants
export const layout = {
  // Screen padding
  screenPadding: spacing.base,
  screenHorizontalPadding: spacing.base,
  screenVerticalPadding: spacing.base,
  
  // Content areas
  contentPadding: spacing.base,
  sectionSpacing: spacing.xl,
  
  // Cards and lists
  cardPadding: spacing.base,
  cardSpacing: spacing.md,
  listItemPadding: spacing.base,
  listItemSpacing: spacing.sm,
  
  // Form elements
  inputHeight: 48,
  inputPadding: spacing.base,
  inputSpacing: spacing.lg,
  buttonHeight: 48,
  buttonPadding: spacing.base,
  
  // Music player specific
  playerMinHeight: 64,
  playerFullPadding: spacing.lg,
  trackItemHeight: 72,
  albumArtSize: {
    mini: 40,
    small: 56,
    medium: 100,
    large: 200,
    fullScreen: 300,
  },
  
  // Navigation
  tabBarHeight: 56,
  headerHeight: 56,
};

// Border radius values
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  pill: 9999,
  circle: '50%',
};

// Shadows (for elevation)
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
};

export default {
  spacing,
  layout,
  borderRadius,
  shadows,
};
