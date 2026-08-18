'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  ListItemButton,
  Pagination,
  Typography,
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { AVXPageHeader } from '@/components/AVXPageHeader';
import type { Notification } from '@/api/interfaces/Notification';
import {
  useNotifications,
  useNotificationMutations,
} from '@/features/notifications/useNotifications';
import { formatDateTime } from '@/utils/formatDate';

const PAGE_SIZE = 12;

export default function NotificationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useNotifications({
    page,
    limit: PAGE_SIZE,
  });
  const { markRead, markAllRead } = useNotificationMutations();

  const items = data?.data ?? [];
  const unread = data?.unreadCount ?? 0;

  const handleClick = (n: Notification) => {
    if (!n.isRead) markRead.mutate(n._id);
    if (n.link) router.push(n.link);
  };

  return (
    <>
      <AVXPageHeader
        title="Notifications"
        subtitle="Updates from workflow activity"
        action={
          <Button
            variant="contained"
            startIcon={<DoneAllIcon />}
            onClick={() => markAllRead.mutate()}
            disabled={unread === 0 || markAllRead.isPending}
          >
            Mark all read
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ px: 3, py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Couldn&apos;t load notifications. Please try again.
            </Typography>
          </Box>
        ) : items.length === 0 ? (
          <Box
            sx={{
              px: 3,
              py: 8,
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              gap: 1,
            }}
          >
            <NotificationsNoneIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
            <Typography variant="h4">You&apos;re all caught up</Typography>
            <Typography color="text.secondary">
              New workflow activity will show up here.
            </Typography>
          </Box>
        ) : (
          <>
            {items.map((n, i) => (
              <Box key={n._id}>
                {i > 0 && <Divider />}
                <ListItemButton
                  onClick={() => handleClick(n)}
                  sx={{
                    alignItems: 'flex-start',
                    gap: 1.5,
                    px: 3,
                    py: 1.5,
                    bgcolor: n.isRead ? 'transparent' : 'action.hover',
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      mt: '7px',
                      flexShrink: 0,
                      bgcolor: n.isRead ? 'transparent' : 'error.main',
                    }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {n.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {n.body}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {formatDateTime(n.createdAt)}
                    </Typography>
                  </Box>
                </ListItemButton>
              </Box>
            ))}
          </>
        )}
      </Card>

      {(data?.totalPages ?? 1) > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={data?.totalPages ?? 1}
            page={page}
            onChange={(_e, p) => setPage(p)}
            color="primary"
          />
        </Box>
      )}
    </>
  );
}
