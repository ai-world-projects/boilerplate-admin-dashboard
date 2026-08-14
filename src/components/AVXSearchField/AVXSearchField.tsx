'use client';

import { useEffect, useState } from 'react';
import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface AVXSearchFieldProps {
  /** Called with the debounced value whenever the user pauses typing. */
  onDebouncedChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
  initialValue?: string;
}

/**
 * Debounced search input. Keeps its own immediate value for a responsive field
 * while only emitting the debounced value upstream, so list queries don't fire
 * on every keystroke.
 */
export default function AVXSearchField({
  onDebouncedChange,
  placeholder = 'Search…',
  delay = 400,
  initialValue = '',
}: AVXSearchFieldProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const id = setTimeout(() => onDebouncedChange(value), delay);
    return () => clearTimeout(id);
    // onDebouncedChange is expected to be stable (from a hook).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  return (
    <TextField
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      size="small"
      sx={{ minWidth: { xs: '100%', sm: 280 } }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
