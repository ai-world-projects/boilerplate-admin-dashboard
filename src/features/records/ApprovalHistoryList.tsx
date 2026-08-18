'use client';

import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import type { ApprovalAction, ApprovalActionType } from '@/api/interfaces/Record';
import { formatDateTime } from '@/utils/formatDate';

interface ApprovalHistoryListProps {
  actions?: ApprovalAction[];
  isLoading?: boolean;
  isError?: boolean;
}

const actionMeta: Record<
  ApprovalActionType,
  { label: string; color: string; icon: React.ReactNode }
> = {
  submit: {
    label: 'Submitted',
    color: 'text.secondary',
    icon: <SendOutlinedIcon fontSize="small" />,
  },
  approve: {
    label: 'Approved',
    color: 'success.main',
    icon: <CheckCircleOutlineIcon fontSize="small" />,
  },
  reject: {
    label: 'Rejected',
    color: 'error.main',
    icon: <CancelOutlinedIcon fontSize="small" />,
  },
};

/**
 * Timeline of approval actions on a record. Handles its own loading / empty /
 * error states so callers (Records detail, Approvals) can drop it in directly.
 */
export default function ApprovalHistoryList({
  actions,
  isLoading,
  isError,
}: ApprovalHistoryListProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 3 }}>
        <CircularProgress size={22} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        Couldn&apos;t load the approval history.
      </Typography>
    );
  }

  if (!actions || actions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        No approval activity yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {actions.map((a) => {
        const meta = actionMeta[a.action];
        return (
          <Box key={a._id} sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{ color: meta.color, mt: '2px' }}>{meta.icon}</Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2">
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {a.actorName}
                </Box>{' '}
                <Box component="span" sx={{ color: meta.color, fontWeight: 600 }}>
                  {meta.label.toLowerCase()}
                </Box>{' '}
                at level {a.level + 1}
              </Typography>
              {a.remarks && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.25 }}
                >
                  “{a.remarks}”
                </Typography>
              )}
              <Typography variant="caption" color="text.disabled">
                {formatDateTime(a.createdAt)}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
