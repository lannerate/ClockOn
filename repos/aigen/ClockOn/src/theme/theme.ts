// ClockOn Design System - Modern Professional Theme
// Based on Flat Design principles with accessibility focus

import { MD3LightTheme } from 'react-native-paper';

// Color Palette - Modern, Accessible, Professional
export const colors = {
  // Primary Brand Colors
  primary: '#3B82F6',        // Modern Blue - Trust & Productivity
  primaryDark: '#2563EB',     // Darker Blue for hover states
  primaryLight: '#60A5FA',    // Lighter Blue for subtle accents

  // Secondary Colors
  secondary: '#10B981',       // Success Green - Clock In status
  tertiary: '#F97316',        // Orange - CTAs & Highlights

  // Semantic Colors
  success: '#10B981',         // Clock In / Success
  error: '#EF4444',           // Clock Out / Error
  warning: '#F59E0B',         // Warnings
  info: '#3B82F6',            // Information

  // Neutral Colors (Slate Scale)
  background: '#F8FAFC',      // Light gray background
  surface: '#FFFFFF',         // White cards/surfaces
  surfaceVariant: '#F1F5F9',  // Slightly darker surfaces

  // Text Colors (High Contrast)
  text: {
    primary: '#1E293B',       // Primary text - 15.7:1 contrast
    secondary: '#475569',     // Secondary text - 8.5:1 contrast
    tertiary: '#94A3B8',      // Tertiary text - 4.6:1 contrast
    inverse: '#FFFFFF',       // White text on colored backgrounds
  },

  // Border & Divider Colors
  border: '#E2E8F0',          // Subtle borders
  divider: '#CBD5E1',         // Dividers

  // Status Colors
  clockedIn: '#10B981',       // Green for clocked in
  clockedOut: '#EF4444',      // Red for clocked out
  inGeofence: '#10B981',      // Green for in geofence
  outOfGeofence: '#F59E0B',   // Orange for out of geofence
};

// Typography System
export const typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Font Sizes (spaced for visual hierarchy)
  fontSize: {
    display: {
      large: 57,    // Hero numbers (duration display)
      medium: 45,   // Page titles
      small: 36,    // Section headers
    },
    headline: {
      large: 32,    // Card titles
      medium: 28,   // Sub-headers
      small: 24,    // List titles
    },
    title: {
      large: 22,    // Important text
      medium: 18,   // Subtitle
      small: 16,    // Body emphasized
    },
    body: {
      large: 16,    // Body text
      medium: 14,   // Secondary text
      small: 12,    // Caption/helper text
    },
    label: {
      large: 14,    // Button labels
      medium: 12,   // Small labels
      small: 11,    // Tiny labels
    },
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line Heights (improved readability)
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// Spacing System (4px base unit)
export const spacing = {
  xs: 4,    // 0.25rem - Tight spacing
  sm: 8,    // 0.5rem  - Small gaps
  md: 16,   // 1rem    - Default spacing
  lg: 24,   // 1.5rem  - Large spacing
  xl: 32,   // 2rem    - Extra large
  xxl: 48,  // 3rem    - Huge spacing
};

// Border Radius
export const borderRadius = {
  sm: 4,     // Small elements (badges, chips)
  md: 8,     // Cards, buttons
  lg: 12,    // Large cards
  xl: 16,    // Hero cards
  full: 9999,// Circular elements
};

// Shadows (Flat Design - Minimal Elevation)
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Animation Timing
export const animation = {
  duration: {
    fast: 150,     // Micro-interactions
    normal: 200,   // Default transitions
    slow: 300,     // Complex animations
  },
  easing: {
    ease: 'ease' as const,
    easeIn: 'ease-in' as const,
    easeOut: 'ease-out' as const,
    easeInOut: 'ease-in-out' as const,
  },
};

// Export complete theme for react-native-paper
export const clockOnTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
    error: colors.error,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.secondary,
    onBackground: colors.text.primary,
    onError: '#FFFFFF',
    onErrorContainer: colors.text.primary,
  },
  // Add custom properties for our design tokens
  spacing: spacing,
  typography: typography,
  borderRadius: borderRadius,
  shadows: shadows,
  animation: animation,
} as const;

// Export individual design tokens
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
};

export default clockOnTheme;
