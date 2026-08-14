import { AuthProvider } from '@/auth/AuthProvider';
import RouteGuard from '@/auth/RouteGuard';
import AppShell from '@/layouts/AppShell/AppShell';

/**
 * Layout for all authenticated pages. AuthProvider loads the current user (and
 * permissions) once; AppShell renders the gated sidebar; RouteGuard enforces the
 * per-route permission before the page renders.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AppShell>
        <RouteGuard>{children}</RouteGuard>
      </AppShell>
    </AuthProvider>
  );
}
