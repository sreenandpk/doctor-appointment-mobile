import {
  MD3LightTheme,
  MD3DarkTheme,
  configureFonts,
} from 'react-native-paper';
import COLORS from './colors';
import TYPOGRAPHY from './typography';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.accent,
    background: COLORS.backgroundLight,
    surface: COLORS.surfaceLight,
    error: COLORS.error,
  },
  fonts: configureFonts({ config: TYPOGRAPHY }),
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.accent,
    background: COLORS.backgroundDark,
    surface: COLORS.surfaceDark,
    error: COLORS.error,
  },
  fonts: configureFonts({ config: TYPOGRAPHY }),
};
