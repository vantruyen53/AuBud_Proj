/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export {width, height}
const tintColorLight = '#0a7ea4';
export const mainColor ="#12D0FF";
export const linearGradient = ['#98eaff', '#c9f4ff', '#e0f9ff', '#f4fdff', '#ffffff', '#ffffff'] as const;

export const Colors = {
  light: {
    /* Background */
    background: "#FFFFFF",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    backgroudLight: "#edf9ff",
    backgroudAlpha: "rgba(18, 208, 255, 0.51)",

    primary: "#12D0FF",
    primaryDark: "#007693",
    primaryLight: "#9aebff",

    textMain: "#1F2937",
    textSub: "#6B7280",
    textTitle: "#1A1A1A",
    textContent: "#03a5f7",
    placeholder: "#9CA3AF",

    /* Input & Border */
    inputBg: "#F1F5F9",
    border: "#86e7ff",
    divider: "#d2f6ff",
    borderInput:'#ededed',

    tint: tintColorLight,
    icon: '#007fbe',
    iconLight:"#37bcff",

    tabIconDefault: "#10374a",
    tabIconSelected: "#006c87",

    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
  },
  dark: {
    background: "#0F172A",
    surface: "#020617",
    card: "#020617",

    primary: "#60A5FA",
    primaryDark: "#3B82F6",
    primaryLight: "#93C5FD",

    textMain: "#E5E7EB",
    textSub: "#9CA3AF",
    placeholder: "#6B7280",

    inputBg: "#020617",
    border: "#1E293B",
    divider: "#1E293B",

    icon: "#007fbe",

    tabIconDefault: "#10374a",
    tabIconSelected: "#006c87",

    success: "#4ADE80",
    warning: "#FBBF24",
    error: "#F87171",
  },
  main:{
    backgroundColor:"#12D0FF",
    shadowColor:"",
    color:"",
    borderColor:"",
  }
};

/* ===== Fonts System ===== */
export const Fonts = Platform.select({
  ios: {
    sans: "System",
    serif: "Times New Roman",
    rounded: "SF Pro Rounded",
    mono: "SF Mono",
  },
  android: {
    sans: "Roboto",
    serif: "serif",
    rounded: "sans-serif",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});