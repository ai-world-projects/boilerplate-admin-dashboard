'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { navGroups } from '../navConfig';
import { useAuth } from '@/auth/AuthProvider';

interface SidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

/** Sidebar: brand, grouped permission-filtered nav, and a user footer. */
export default function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission, me } = useAuth();

  const user = me?.user;
  const roleName = me?.roles?.[0]?.name;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        color: 'rgba(255,255,255,0.85)',
        // Subtle vertical gradient makes the rail feel less flat.
        background: 'linear-gradient(180deg, #1f2f5c 0%, #172444 100%)',
      }}
    >
      {/* Brand */}
      <Toolbar sx={{ px: collapsed ? 0 : 2.5, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              color: '#fff',
              background: 'linear-gradient(135deg, #2e7ddb, #4aa3ff)',
              boxShadow: '0 4px 12px rgba(46,125,219,0.45)',
              flexShrink: 0,
            }}
          >
            A
          </Box>
          {!collapsed && (
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, letterSpacing: 0.5 }}>
              AVX
            </Typography>
          )}
        </Box>
      </Toolbar>

      {/* Navigation */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 1,
          // Thin, subtle scrollbar that matches the dark rail.
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.22) transparent',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255,255,255,0.22)',
            borderRadius: 3,
          },
          '&:hover::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255,255,255,0.35)',
          },
        }}
      >
        {navGroups.map((group) => {
          const visible = group.items.filter((item) => hasPermission(item.permission));
          if (visible.length === 0) return null;

          return (
            <List
              key={group.heading}
              sx={{ px: collapsed ? 1 : 2 }}
              subheader={
                collapsed ? (
                  <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.12)' }} />
                ) : (
                  <ListSubheader
                    disableSticky
                    sx={{
                      bgcolor: 'transparent',
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 1.2,
                      lineHeight: '34px',
                    }}
                  >
                    {group.heading}
                  </ListSubheader>
                )
              }
            >
              {visible.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Tooltip
                    key={href}
                    title={collapsed ? label : ''}
                    placement="right"
                    arrow
                  >
                    <ListItemButton
                      component={Link}
                      href={href}
                      onClick={onNavigate}
                      selected={active}
                      sx={{
                        position: 'relative',
                        minHeight: 44,
                        mb: 0.5,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        px: collapsed ? 1.5 : 2,
                        color: 'rgba(255,255,255,0.72)',
                        transition: 'background-color .15s, color .15s, transform .15s',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.08)',
                          color: '#fff',
                          transform: 'translateX(2px)',
                        },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(46,125,219,0.20)',
                          color: '#fff',
                          '&:hover': { bgcolor: 'rgba(46,125,219,0.28)' },
                          // Left accent bar on the active item.
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 8,
                            bottom: 8,
                            width: 3,
                            borderRadius: 3,
                            backgroundColor: 'secondary.main',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: collapsed ? 0 : 2,
                          justifyContent: 'center',
                          color: active ? 'secondary.light' : 'inherit',
                        }}
                      >
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      {!collapsed && (
                        <ListItemText
                          primary={label}
                          slotProps={{ primary: { sx: { fontWeight: active ? 600 : 500, fontSize: 14 } } }}
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                );
              })}
            </List>
          );
        })}
      </Box>

      {/* User footer */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <Box
        sx={{
          p: collapsed ? 1.5 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 1.5,
        }}
      >
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontSize: 14 }}>
          {user ? `${user.firstName[0]}${user.lastName[0]}` : 'A'}
        </Avatar>
        {!collapsed && user && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ color: '#fff', fontWeight: 600 }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: 'rgba(255,255,255,0.55)', display: 'block' }}>
              {roleName ?? user.email}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
