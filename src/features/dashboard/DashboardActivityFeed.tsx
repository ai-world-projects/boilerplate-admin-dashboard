'use client';

import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { useAudit } from '@/features/audit/useAudit';
import { formatDateTime } from '@/utils/formatDate';

/**
 * Recent-activity feed for the dashboard (blueprint §2.1). Reads the latest
 * audit entries via the audit query (4a). Rendered only for users with
 * `audit:read` (the dashboard gates it), and handles its own four states.
 */
export default function DashboardActivityFeed() {
  const { data, isLoading, isError } = useAudit({ page: 1, limit: 6 });
  const entries = data?.data ?? [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        Couldn&apos;t load recent activity.
      </Typography>
    );
  }

  if (entries.length === 0) {
    return (
      <Box
        sx={{
          py: 4,
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          gap: 1,
          color: 'text.secondary',
        }}
      >
        <ReceiptLongOutlinedIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
        <Typography variant="body2">No recent activity yet.</Typography>
      </Box>
    );
  }

  return (
    <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
      {entries.map((e) => (
        <Box
          key={e._id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            py: 1.25,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2">
              <Box component="span" sx={{ fontWeight: 600 }}>
                {e.actorName}
              </Box>{' '}
              — {e.action}{' '}
              <Box component="span" sx={{ color: 'text.secondary' }}>
                ({e.entity} {e.entityId})
              </Box>
            </Typography>
          </Box>
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ flexShrink: 0 }}
          >
            {formatDateTime(e.createdAt)}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
