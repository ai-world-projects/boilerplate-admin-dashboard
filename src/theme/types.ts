import type {} from '@mui/x-data-grid/themeAugmentation';

/**
 * Module augmentation extends MUI's built-in Palette with our custom slots so
 * `theme.palette.disabled.*` is fully typed everywhere it is used.
 */
declare module '@mui/material/styles' {
  interface Palette {
    disabled: {
      background: string;
      icon: string;
      text: string;
    };
  }
  interface PaletteOptions {
    disabled?: {
      background: string;
      icon: string;
      text: string;
    };
  }
}

/**
 * Registered themes. Add a new entry here and a matching `themes.set(...)` in
 * `theme.ts` to introduce another brand/variant.
 */
export enum AppThemes {
  MUI_DEFAULT = 'default',
  BASE_THEME = 'baseTheme',
}

export type IAppThemeProps = {
  theme?: AppThemes;
};
