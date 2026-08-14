export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleIds: string[]; // many-to-many with Role (users can hold multiple roles)
  status: UserStatus; // 'pending' = awaiting approval
  lastLoginAt: string | null; // (assumed)
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a user. */
export interface UserFormRequest {
  firstName: string;
  lastName: string;
  email: string;
  roleIds: string[];
  status: UserStatus;
}

export type PartialUserFormRequest = Partial<UserFormRequest>;

/** Body for the dedicated status-toggle endpoint. */
export interface UpdateUserStatusRequest {
  status: UserStatus;
}

/** Body for the dedicated role-assignment endpoint. */
export interface AssignRolesRequest {
  roleIds: string[];
}
