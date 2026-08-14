'use client';

import Link from 'next/link';
import { Box, Button, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

/** 403 view shown when a user opens a route they lack permission for. */
export default function Forbidden() {
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        gap: 1,
      }}
    >
      <Box>
        <LockOutlinedIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
        <Typography variant="h2" sx={{ mt: 1 }}>
          403 — Access denied
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          You don&apos;t have permission to view this page.
        </Typography>
        <Button component={Link} href="/dashboard" variant="contained">
          Back to dashboard
        </Button>
      </Box>
    </Box>
  );
}
