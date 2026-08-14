'use client';

import { forwardRef } from 'react';
import { TextField } from '@mui/material';
import type { AVXTextFieldProps } from './AVXTextField.types';

/**
 * The app's standard text input. Defaults to a full-width outlined field so
 * every form field looks identical without repeating props. Forwards refs and
 * all MUI TextField props (including `select`, `multiline`, `slotProps`, etc.),
 * so it also serves as the base for select fields.
 */
const AVXTextField = forwardRef<HTMLDivElement, AVXTextFieldProps>(
  function AVXTextField({ fullWidth = true, ...props }, ref) {
    return <TextField ref={ref} fullWidth={fullWidth} {...props} />;
  },
);

export default AVXTextField;
