'use client';

import { useAuth } from './AuthProvider';
import type { PermissionKey } from './permissions';

interface PermissionGateProps {
  /** Required permission(s). With multiple, the user needs at least one. */
  permission: PermissionKey | PermissionKey[];
  children: React.ReactNode;
  /** Rendered when the user lacks the permission (defaults to nothing). */
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders UI based on the current user's permissions. Use it to
 * hide action buttons (Create, Approve, Delete…) the user can't perform.
 */
export default function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasAnyPermission } = useAuth();
  const keys = Array.isArray(permission) ? permission : [permission];
  return <>{hasAnyPermission(keys) ? children : fallback}</>;
}
