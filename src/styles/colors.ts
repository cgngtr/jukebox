/**
 * Application color palette
 * Contains light and dark theme color values
 */

// Base color palette
const palette = {
  // Core brand colors
  primary: {
    light: '#6A44F2', // Rich purple
    dark: '#8464FF', // Lighter purple for dark mode
  },
  secondary: {
    light: '#FF4F9A', // Pink for accent
    dark: '#FF64A8', // Brighter pink for dark mode
  },
  // Background colors
  background: {
    light: '#FFFFFF',
    dark: '#121212', // Spotify-like dark
  },
  card: {
    light: '#F8F8F8',
    dark: '#1E1E1E',
  },
  // Text colors
  text: {
    primary: {
      light: '#121212',
      dark: '#FFFFFF',
    },
    secondary: {
      light: '#6E6E6E',
      dark: '#B3B3B3',
    },
    inactive: {
      light: '#ACACAC',
      dark: '#5A5A5A',
    },
  },
  // Status colors
  success: {
    light: '#34C759',
    dark: '#32D74B',
  },
  warning: {
    light: '#FF9500',
    dark: '#FF9F0A',
  },
  error: {
    light: '#FF3B30',
    dark: '#FF453A',
  },
  // Additional UI colors
  divider: {
    light: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(255, 255, 255, 0.1)',
  },
  overlay: {
    light: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.5)',
  },
  // Music-related colors
  playback: {
    active: '#1DB954', // Spotify-like green
    progress: '#6A44F2', // Same as primary
  },
};

// Export the color palette with light and dark theme distinction
export const colors = {
  light: {
    primary: palette.primary.light,
    secondary: palette.secondary.light,
    background: palette.background.light,
    card: palette.card.light,
    text: {
      primary: palette.text.primary.light,
      secondary: palette.text.secondary.light,
      inactive: palette.text.inactive.light,
    },
    success: palette.success.light,
    warning: palette.warning.light,
    error: palette.error.light,
    divider: palette.divider.light,
    overlay: palette.overlay.light,
    playback: palette.playback,
  },
  dark: {
    primary: palette.primary.dark,
    secondary: palette.secondary.dark,
    background: palette.background.dark,
    card: palette.card.dark,
    text: {
      primary: palette.text.primary.dark,
      secondary: palette.text.secondary.dark,
      inactive: palette.text.inactive.dark,
    },
    success: palette.success.dark,
    warning: palette.warning.dark,
    error: palette.error.dark,
    divider: palette.divider.dark,
    overlay: palette.overlay.dark,
    playback: palette.playback,
  },
};

export default colors;
