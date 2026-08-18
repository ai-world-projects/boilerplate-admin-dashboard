'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemButton,
  Menu,
  Tooltip,
  Typography,
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNoneOutlined';
import type { Notification } from '@/api/interfaces/Notification';
import { formatDateTime } from '@/utils/formatDate';
import { useNotifications, useNotificationMutations } from './useNotifications';

/** Header bell: unread badge + dropdown of recent notifications. */
export default function NotificationBell() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data } = useNotifications({ limit: 6 });
  const { markRead, markAllRead } = useNotificationMutations();

  const unread = data?.unreadCount ?? 0;
  const items = data?.data ?? [];

  const handleClick = (n: Notification) => {
    if (!n.isRead) markRead.mutate(n._id);
    setAnchorEl(null);
    if (n.link) router.push(n.link);
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
          <Badge badgeContent={unread} color="error" max={99}>
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxWidth: '100vw' } } }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
          }}
        >
          <Typography variant="subtitle1">Notifications</Typography>
          {unread > 0 && (
            <Button
              size="small"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {items.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              You&apos;re all caught up.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
            {items.map((n) => (
              <ListItemButton
                key={n._id}
                onClick={() => handleClick(n)}
                sx={{
                  alignItems: 'flex-start',
                  gap: 1,
                  py: 1,
                  bgcolor: n.isRead ? 'transparent' : 'action.hover',
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    mt: '6px',
                    flexShrink: 0,
                    bgcolor: n.isRead ? 'transparent' : 'error.main',
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {n.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {n.body}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {formatDateTime(n.createdAt)}
                  </Typography>
                </Box>
              </ListItemButton>
            ))}
          </Box>
        )}

        <Divider />
        <Box sx={{ p: 1 }}>
          <Button
            component={Link}
            href="/notifications"
            fullWidth
            size="small"
            onClick={() => setAnchorEl(null)}
          >
            See all notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
}
