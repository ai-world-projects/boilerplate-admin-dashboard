'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Drawer, Toolbar } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import { COLLAPSED_WIDTH, DRAWER_WIDTH } from '../navConfig';
import { notify } from '@/utils/notify';

const COLLAPSE_KEY = 'avxSidebarCollapsed';

/**
 * Authenticated layout using MUI's canonical responsive two-drawer pattern: a
 * `<nav>` box reserves the sidebar's width so the fixed drawer never overlaps
 * the content. The desktop drawer is collapsible (icon-only) and the choice is
 * persisted to localStorage. Also wires the global API error events.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Restore the collapsed preference after mount. Done in an effect (not a lazy
  // initializer) so SSR and the first client render agree (expanded) and there's
  // no hydration mismatch; the stored value is applied client-side afterwards.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
  }, []);

  const toggleCollapsed = () =>
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      return next;
    });

  useEffect(() => {
    const onUnauthorized = () => {
      notify.error('Your session has expired. Please sign in again.');
      router.push('/login');
    };
    const onServerError = () =>
      notify.error('Server error. Please try again later.');

    window.addEventListener('api:unauthorized', onUnauthorized);
    window.addEventListener('api:serverError', onServerError);
    return () => {
      window.removeEventListener('api:unauthorized', onUnauthorized);
      window.removeEventListener('api:serverError', onServerError);
    };
  }, [router]);

  const width = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header
        drawerWidth={width}
        collapsed={collapsed}
        onMenuClick={() => setMobileOpen(true)}
        onToggleCollapse={toggleCollapsed}
      />

      {/* Sidebar container: reserves horizontal space on desktop. */}
      <Box
        component="nav"
        sx={{
          width: { md: width },
          flexShrink: { md: 0 },
          transition: (t) => t.transitions.create('width', { duration: 200 }),
        }}
      >
        {/* Desktop: permanent, collapsible */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width,
              boxSizing: 'border-box',
              border: 'none',
              overflowX: 'hidden',
              transition: (t) => t.transitions.create('width', { duration: 200 }),
              // Thin, subtle scrollbar tuned for the dark rail (the paper is the
              // element that scrolls, so the styling must live here).
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.28) transparent',
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(255,255,255,0.28)',
                borderRadius: 3,
              },
              '&:hover::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(255,255,255,0.45)',
              },
            },
          }}
        >
          <Sidebar collapsed={collapsed} />
        </Drawer>

        {/* Mobile: temporary */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
          }}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      </Box>

      {/* Main content fills the remaining width. */}
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
