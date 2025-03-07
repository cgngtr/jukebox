/**
 * Typography styles for the application
 * Defines font families, sizes, weights, and text styles
 */

// Font family definitions - using default fonts for now until custom fonts are loaded
export const fontFamily = {
  // Primary font for general text
  primary: {
    regular: undefined, // Will use system default
    medium: undefined,  // Will use system default
    semibold: undefined, // Will use system default
    bold: undefined,    // Will use system default
  },
  // Accent font for headings and special text
  accent: {
    regular: undefined, // Will use system default
    medium: undefined,  // Will use system default
    bold: undefined,    // Will use system default
  },
};

// Font size definitions (in pixels)
export const fontSize = {
  tiny: 10,
  small: 12,
  regular: 14,
  medium: 16,
  large: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
  huge: 48,
};

// Line heights (multiplier of font size)
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  loose: 1.8,
};

// Font weights
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Letter spacing
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  extraWide: 1,
};

// Predefined text styles
export const textStyle = {
  // Headings
  h1: {
    // fontFamily: fontFamily.accent.bold, // Remove specific font family
    fontSize: fontSize.huge,
    lineHeight: lineHeight.tight,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    // fontFamily: fontFamily.accent.bold, // Remove specific font family
    fontSize: fontSize.xxxl,
    lineHeight: lineHeight.tight,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    // fontFamily: fontFamily.accent.bold, // Remove specific font family
    fontSize: fontSize.xxl,
    lineHeight: lineHeight.tight,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
  h4: {
    // fontFamily: fontFamily.accent.bold, // Remove specific font family
    fontSize: fontSize.xl,
    lineHeight: lineHeight.tight,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },

  // Body text
  body1: {
    // fontFamily: fontFamily.primary.regular, // Remove specific font family
    fontSize: fontSize.medium,
    lineHeight: lineHeight.normal,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  body2: {
    // fontFamily: fontFamily.primary.regular, // Remove specific font family
    fontSize: fontSize.regular,
    lineHeight: lineHeight.normal,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  
  // Supporting text
  caption: {
    // fontFamily: fontFamily.primary.regular, // Remove specific font family
    fontSize: fontSize.small,
    lineHeight: lineHeight.normal,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.wide,
  },
  
  // UI elements
  button: {
    // fontFamily: fontFamily.primary.medium, // Remove specific font family
    fontSize: fontSize.medium,
    lineHeight: lineHeight.tight,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
  },
  
  // Music-specific styles
  trackTitle: {
    // fontFamily: fontFamily.primary.semibold, // Remove specific font family
    fontSize: fontSize.medium,
    lineHeight: lineHeight.tight,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  artistName: {
    // fontFamily: fontFamily.primary.regular, // Remove specific font family
    fontSize: fontSize.regular,
    lineHeight: lineHeight.normal,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  albumTitle: {
    // fontFamily: fontFamily.primary.medium, // Remove specific font family
    fontSize: fontSize.medium,
    lineHeight: lineHeight.normal,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
  },
};

export default {
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  textStyle,
};
