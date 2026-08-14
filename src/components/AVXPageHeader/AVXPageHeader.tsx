'use client';

import { Box, Typography } from '@mui/material';

export interface AVXPageHeaderProps {
  title: string;
  subtitle?: string;
  /** Right-aligned actions, e.g. a "Create" button. */
  action?: React.ReactNode;
}

/** Consistent page title block used at the top of every page. */
export default function AVXPageHeader({
  title,
  subtitle,
  action,
}: AVXPageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h2">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
