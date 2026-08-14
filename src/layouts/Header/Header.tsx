'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import { AUTH_STORAGE_KEY, CURRENT_USER_KEY, LOGOUT_SUCCESS_MESSAGE } from '@/utils/constants';
import { notify } from '@/utils/notify';

interface HeaderProps {
  /** Current width of the desktop sidebar so the bar aligns beside it. */
  drawerWidth: number;
  onMenuClick: () => void;
  onToggleCollapse: () => void;
  collapsed: boolean;
}

/** Top app bar: mobile menu, desktop collapse toggle, and account menu. */
export default function Header({
  drawerWidth,
  onMenuClick,
  onToggleCollapse,
  collapsed,
}: HeaderProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    setAnchorEl(null);
    notify.success(LOGOUT_SUCCESS_MESSAGE);
    router.push('/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      color="inherit"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        borderBottom: '1px solid #eceef3',
        bgcolor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        transition: (t) =>
          t.transitions.create(['width', 'margin'], { duration: 200 }),
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {/* Mobile: open the temporary drawer */}
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { md: 'none' } }}
          aria-label="open navigation"
        >
          <MenuIcon />
        </IconButton>

        {/* Desktop: collapse / expand the sidebar */}
        <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <IconButton
            onClick={onToggleCollapse}
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
            aria-label="toggle sidebar"
          >
            {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
          </IconButton>
        </Tooltip>

        <Box sx={{ flex: 1 }} />

        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main' }}>A</Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem disabled>
            <Typography variant="body2">Signed in as Admin</Typography>
          </MenuItem>
          <MenuItem component={Link} href="/profile" onClick={() => setAnchorEl(null)}>
            <PersonOutlineIcon fontSize="small" sx={{ mr: 1 }} /> My Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
