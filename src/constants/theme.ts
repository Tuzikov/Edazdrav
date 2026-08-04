/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#22110b',
    background: '#fef7f2',
    backgroundElement: '#f8e9de',
    backgroundSelected: '#f0d7c4',
    textSecondary: '#6d544c',
    accent: '#f3680f',
    accentButton: '#c35411',
    onAccent: '#ffffff',
    danger: '#e23439',
    nutrientProtein: '#d56858',
    nutrientFat: '#cf7210',
    nutrientCarbs: '#539943',
    nutrientFiber: '#b26fc2',
  },
  dark: {
    text: '#f7f0eb',
    background: '#170d08',
    backgroundElement: '#241408',
    backgroundSelected: '#33200f',
    textSecondary: '#a89487',
    accent: '#f06506',
    accentButton: '#c35411',
    onAccent: '#ffffff',
    danger: '#ff5251',
    nutrientProtein: '#ab4235',
    nutrientFat: '#c86c00',
    nutrientCarbs: '#2d731b',
    nutrientFiber: '#8b4a9a',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
