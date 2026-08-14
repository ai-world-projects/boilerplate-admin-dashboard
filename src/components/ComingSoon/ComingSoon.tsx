'use client';

import { Box, Chip, Typography } from '@mui/material';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import { AVXPageHeader } from '@/components/AVXPageHeader';

/** Placeholder for modules specced in the blueprint but not yet implemented. */
export default function ComingSoon({
  title,
  phase,
}: {
  title: string;
  phase?: string;
}) {
  return (
    <>
      <AVXPageHeader title={title} subtitle="Module planned in the blueprint" />
      <Box
        sx={{
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 3,
          py: 8,
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          gap: 1,
          bgcolor: 'background.paper',
        }}
      >
        <ConstructionOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
        <Typography variant="h4">Coming soon</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
          This module is specified in <code>docs/blueprint.md</code> and will be
          implemented in a later build phase.
        </Typography>
        {phase && <Chip label={phase} size="small" color="secondary" sx={{ mt: 1 }} />}
      </Box>
    </>
  );
}
