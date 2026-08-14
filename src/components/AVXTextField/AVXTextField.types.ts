import type { TextFieldProps } from '@mui/material';

/**
 * AVXTextField reuses MUI's TextField props verbatim. It exists so the app has a
 * single, consistently-styled text input; tweak defaults/behaviour here once and
 * every form updates.
 */
export type AVXTextFieldProps = TextFieldProps;
