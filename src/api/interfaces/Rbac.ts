import type { PermissionKey } from '@/auth/permissions';

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
  isSystem: boolean; // (assumed) system roles cannot be deleted
  createdAt: string;
  updatedAt: string;
}

/** Static permission descriptor (mirrors the catalogue entry). */
export interface Permission {
  key: PermissionKey;
  label: string;
  group: string;
}

/** Payload for creating/editing a role. */
export interface RoleFormRequest {
  name: string;
  description: string;
  permissions: PermissionKey[];
}

export type PartialRoleFormRequest = Partial<RoleFormRequest>;
