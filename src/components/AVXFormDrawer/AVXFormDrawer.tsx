'use client';

import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface AVXFormDrawerProps {
  open: boolean;
  title: string;
  /** Form fields. The drawer renders a <form> so Enter submits. */
  children: React.ReactNode;
  submitLabel?: string;
  loading?: boolean;
  onClose: () => void;
  /** Called when the footer submit button (or Enter) fires. */
  onSubmit: () => void;
  width?: number;
}

/**
 * Right-side drawer wrapping a form with a sticky header and footer actions.
 * This is the standard create/edit surface across the app (users, subjects).
 */
export default function AVXFormDrawer({
  open,
  title,
  children,
  submitLabel = 'Save',
  loading = false,
  onClose,
  onSubmit,
  width = 440,
}: AVXFormDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={loading ? undefined : onClose}>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        sx={{
          width: { xs: '100vw', sm: width },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
          }}
        >
          <Typography variant="h3">{title}</Typography>
          <IconButton onClick={onClose} disabled={loading} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        {/* Block layout (not flex) so the flex container can never compress or
            stretch the fields — each renders at MUI's natural height. Children
            are spaced with a stacking margin; the container scrolls when it
            overflows. The doubled `&&` raises specificity above MUI's own
            `MuiTextField-root`/`FormControl-root` reset, which otherwise ties
            our selector and zeroes the margin (last-injected rule wins). */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            p: 3,
            '&& > * + *': { mt: 2.5 },
          }}
        >
          {children}
        </Box>

        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, p: 2, px: 3 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {submitLabel}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
