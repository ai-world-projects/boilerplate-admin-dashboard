/**
 * Central permission catalogue. Permission keys use the `resource:action`
 * convention. This list is the single source of truth for RBAC — the Settings
 * → Access screen renders its matrix from it, and `hasPermission` checks against
 * it. Add a capability by adding a key here.
 */
export const PERMISSIONS = [
  { key: 'dashboard:view', label: 'View dashboard', group: 'Overview' },
  { key: 'notifications:view', label: 'View notifications', group: 'Overview' },

  { key: 'users:read', label: 'View users', group: 'Users' },
  { key: 'users:create', label: 'Create users', group: 'Users' },
  { key: 'users:update', label: 'Edit users', group: 'Users' },
  { key: 'users:delete', label: 'Delete users', group: 'Users' },
  { key: 'users:assignRole', label: 'Assign roles', group: 'Users' },

  { key: 'records:read', label: 'View records', group: 'Records' },
  { key: 'records:create', label: 'Create records', group: 'Records' },
  { key: 'records:update', label: 'Edit records', group: 'Records' },
  { key: 'records:archive', label: 'Archive records', group: 'Records' },

  { key: 'approvals:read', label: 'View approvals', group: 'Approvals' },
  { key: 'approvals:approve', label: 'Approve records', group: 'Approvals' },
  { key: 'approvals:reject', label: 'Reject records', group: 'Approvals' },

  { key: 'audit:read', label: 'View audit log', group: 'Audit' },

  { key: 'reports:view', label: 'View reports', group: 'Reports' },
  { key: 'reports:export', label: 'Export reports', group: 'Reports' },

  { key: 'settings:rbac', label: 'Manage access (RBAC)', group: 'Settings' },
  { key: 'settings:workflow', label: 'Manage workflow', group: 'Settings' },
  { key: 'settings:security', label: 'Manage security', group: 'Settings' },
  { key: 'settings:branding', label: 'Manage branding', group: 'Settings' },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]['key'];

/** All permission keys — used to seed the Super Admin role. */
export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSIONS.map((p) => p.key);
