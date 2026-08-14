'use client';

import { usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './AuthProvider';
import { permissionForPath } from '@/layouts/navConfig';
import Forbidden from './Forbidden';

/**
 * Route-level guard (defense in depth — hiding menu items is not enough). Blocks
 * rendering until the current user is loaded, then checks the permission mapped
 * to the current path. Routes with no mapped permission (e.g. /profile) are open
 * to any authenticated user.
 */
export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const required = permissionForPath(pathname);
  if (required && !hasPermission(required)) {
    return <Forbidden />;
  }

  return <>{children}</>;
}
