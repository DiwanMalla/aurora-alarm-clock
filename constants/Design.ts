import { Platform } from 'react-native';

// Color palette for Aurora Clock
export const Colors = {
  light: {
    // Primary brand colors
    primary: '#007AFF',
    primaryLight: '#4DA6FF',
    primaryDark: '#0056CC',

    // Secondary colors
    secondary: '#5856D6',
    accent: '#FF9500',

    // Background colors
    background: '#FFFFFF',
    surface: '#F2F2F7',
    surfaceSecondary: '#FFFFFF',

    // Text colors
    text: '#1C1C1E',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',

    // Interactive colors
    border: '#E5E5EA',
    borderActive: '#007AFF',
    shadow: 'rgba(0, 0, 0, 0.1)',

    // Status colors
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',

    // Tab bar colors
    tabBackground: '#F2F2F7',
    tabActive: '#007AFF',
    tabInactive: '#8E8E93',

    // Clock specific colors
    clockFace: '#FFFFFF',
    clockHands: '#1C1C1E',
    alarmTime: '#FF3B30',
    nextAlarm: '#34C759',
  },
  dark: {
    // Primary brand colors
    primary: '#0A84FF',
    primaryLight: '#409CFF',
    primaryDark: '#0056CC',

    // Secondary colors
    secondary: '#5E5CE6',
    accent: '#FF9F0A',

    // Background colors
    background: '#000000',
    surface: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#48484A',

    // Interactive colors
    border: '#38383A',
    borderActive: '#0A84FF',
    shadow: 'rgba(0, 0, 0, 0.3)',

    // Status colors
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#0A84FF',

    // Tab bar colors
    tabBackground: '#1C1C1E',
    tabActive: '#0A84FF',
    tabInactive: '#8E8E93',

    // Clock specific colors
    clockFace: '#1C1C1E',
    clockHands: '#FFFFFF',
    alarmTime: '#FF453A',
    nextAlarm: '#30D158',
  },
};

// Typography scale following iOS Human Interface Guidelines
export const Typography = {
  // Large titles
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
    letterSpacing: 0.37,
  },

  // Titles
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
    letterSpacing: 0.38,
  },

  // Headlines
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
  },

  // Body text
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  bodyBold: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
  },

  // Callout
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
    letterSpacing: -0.32,
  },
  calloutBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 21,
    letterSpacing: -0.32,
  },

  // Subheadline
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  subheadBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: -0.24,
  },

  // Footnote
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  footnoteBold: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
    letterSpacing: -0.08,
  },

  // Captions
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  caption1Bold: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
    letterSpacing: 0.07,
  },
  caption2Bold: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 13,
    letterSpacing: 0.07,
  },

  // Clock specific typography
  clockTime: {
    fontSize: 64,
    fontWeight: '300' as const,
    lineHeight: 76,
    letterSpacing: -2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  alarmTime: {
    fontSize: 24,
    fontWeight: '400' as const,
    lineHeight: 29,
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
};

// Spacing system based on 4px grid
export const Spacing = {
  // Base spacing units
  xs: 4, // Extra small
  sm: 8, // Small
  md: 16, // Medium (base unit)
  lg: 24, // Large
  xl: 32, // Extra large
  xxl: 48, // Extra extra large
  xxxl: 64, // Extra extra extra large

  // Semantic spacing
  cardPadding: 16,
  screenPadding: 16,
  sectionSpacing: 24,
  componentSpacing: 12,

  // Touch targets (minimum 44px for accessibility)
  touchTarget: 44,
  buttonHeight: 44,
  inputHeight: 44,

  // Safe areas
  safeAreaTop: Platform.OS === 'ios' ? 44 : 24,
  safeAreaBottom: Platform.OS === 'ios' ? 34 : 0,
  tabBarHeight: Platform.OS === 'ios' ? 83 : 70,
};

// Border radius values
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,

  // Semantic radii
  button: 12,
  card: 16,
  modal: 24,
  circle: 9999,
};

// Shadow presets
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
};

// Animation durations
export const Animations = {
  fast: 150,
  normal: 250,
  slow: 350,
  verySlow: 500,

  // Easing functions
  easeInOut: 'ease-in-out',
  easeOut: 'ease-out',
  easeIn: 'ease-in',
  spring: 'spring',
};

// Screen dimensions helpers
export const Layout = {
  window: {
    width: 375, // iPhone default width for calculations
    height: 812, // iPhone default height for calculations
  },
  isSmallDevice: false, // Will be set dynamically
  isTablet: false, // Will be set dynamically
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Animations,
  Layout,
};
