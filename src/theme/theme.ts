'use client';

import { createTheme, type ThemeOptions } from '@mui/material';
import { AppThemes } from './types';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

const DEFAULT_FONT_FAMILY = "'Poppins', sans-serif";

/**
 * Theme registry. Keyed by `AppThemes` so `getTheme(name)` can return a fully
 * built MUI theme. This mirrors the multi-brand theming approach used in the
 * reference admin: colours are driven by CSS variables (see globals.css) so a
 * brand can be re-skinned without touching this file.
 */
const themes = new Map<AppThemes, ThemeOptions>();

themes.set(AppThemes.MUI_DEFAULT, {});

themes.set(AppThemes.BASE_THEME, {
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(var(--rgb-primary))',
      light: 'rgba(var(--rgb-primary), 0.15)',
    },
    secondary: {
      main: 'rgb(var(--rgb-secondary))',
      light: 'rgba(var(--rgb-secondary), 0.15)',
    },
    success: {
      main: 'rgb(var(--rgb-success))',
      light: 'rgba(var(--rgb-success), 0.18)',
    },
    error: {
      main: 'rgb(var(--rgb-error))',
      light: 'rgba(var(--rgb-error), 0.18)',
    },
    warning: {
      main: 'rgb(var(--rgb-warning))',
    },
    background: {
      default: '#f5f6fa',
      paper: '#ffffff',
    },
    disabled: {
      icon: '#9e9e9e',
      text: '#9e9e9e',
      background: '#e0e0e0',
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: DEFAULT_FONT_FAMILY,
    h1: { fontSize: '2rem', fontWeight: 600 },
    h2: { fontSize: '1.5rem', fontWeight: 600 },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    h4: { fontSize: '1.125rem', fontWeight: 600 },
    h5: { fontSize: '1rem', fontWeight: 600 },
    h6: { fontSize: '0.875rem', fontWeight: 600 },
    subtitle1: { fontSize: '0.875rem', fontWeight: 500 },
    subtitle2: { fontSize: '0.75rem', fontWeight: 500 },
    body1: { fontSize: '0.9375rem', fontWeight: 400 },
    body2: { fontSize: '0.875rem', fontWeight: 400 },
    button: { fontSize: '0.875rem', fontWeight: 500 },
    caption: { fontSize: '0.75rem', fontWeight: 400 },
  },
  components: {
    MuiTypography: {
      styleOverrides: { root: { textTransform: 'none' } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #eceef3',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.06)',
        },
      },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none' } },
    },
    MuiTextField: {
      defaultProps: { size: 'medium', variant: 'outlined' },
    },
    // Only round the corners — let MUI handle field heights and label math
    // natively per size. Form fields stay full-height because AVXFormDrawer sets
    // flexShrink:0 on its children (that is what prevents the flex collapse),
    // not any padding/min-height override here.
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
  },
});

/**
 * Build a ready-to-use MUI theme by name. The base font family is always
 * applied first, then the requested theme's options are merged on top.
 */
export const getTheme = (themeName: AppThemes = AppThemes.BASE_THEME) =>
  createTheme(
    { typography: { fontFamily: DEFAULT_FONT_FAMILY } },
    themes.get(themeName) ?? {},
  );

export default getTheme;
