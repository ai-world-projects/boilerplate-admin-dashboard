import { User } from './User';
import type { Role } from './Rbac';
import type { PermissionKey } from '@/auth/permissions';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginData {
  user: User;
  token: string;
  expiresIn: string;
}

/**
 * `GET /auth/me` payload: the signed-in user plus the flattened set of
 * permission keys derived from their roles. The client uses `permissions` for
 * all gating decisions.
 */
export interface MeResponse {
  user: User;
  roles: Role[];
  permissions: PermissionKey[];
}
