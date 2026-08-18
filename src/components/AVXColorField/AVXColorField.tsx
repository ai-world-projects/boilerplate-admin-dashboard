'use client';

import { Box } from '@mui/material';
import { AVXTextField } from '@/components/AVXTextField';

export interface AVXColorFieldProps {
  label: string;
  /** Hex color, e.g. `#2ea043`. */
  value: string;
  onChange: (hex: string) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

/**
 * Labeled color input: a native colour-picker swatch alongside an editable hex
 * field, so the value can be picked or typed. Generic — used by Workflow status
 * colours and Branding's primary colour.
 */
export default function AVXColorField({
  label,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
}: AVXColorFieldProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
      <Box
        component="label"
        sx={{
          position: 'relative',
          width: 48,
          height: 56,
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: value,
          flexShrink: 0,
          overflow: 'hidden',
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        <Box
          component="input"
          type="color"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            border: 0,
            p: 0,
            m: 0,
            cursor: 'inherit',
          }}
        />
      </Box>
      <AVXTextField
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        helperText={helperText}
        disabled={disabled}
      />
    </Box>
  );
}
