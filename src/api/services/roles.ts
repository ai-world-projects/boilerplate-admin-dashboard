import { api } from '../client';
import { GenericDeleteResponse, StandardResponse } from '../interfaces/Common';
import {
  PartialRoleFormRequest,
  Permission,
  Role,
  RoleFormRequest,
} from '../interfaces/Rbac';

export async function getRoles(): Promise<StandardResponse<Role[]>> {
  const response = await api.get<StandardResponse<Role[]>>('/roles');
  return response.data;
}

/** The static permission catalogue (for the role editor matrix). */
export async function getPermissions(): Promise<StandardResponse<Permission[]>> {
  const response = await api.get<StandardResponse<Permission[]>>('/permissions');
  return response.data;
}

export async function createRole(
  request: RoleFormRequest,
): Promise<StandardResponse<Role>> {
  const response = await api.post<StandardResponse<Role>>('/roles', request);
  return response.data;
}

export async function updateRole(
  roleId: string,
  request: PartialRoleFormRequest,
): Promise<StandardResponse<Role>> {
  const response = await api.put<StandardResponse<Role>>(
    `/roles/${roleId}`,
    request,
  );
  return response.data;
}

export async function deleteRole(
  roleId: string,
): Promise<StandardResponse<GenericDeleteResponse>> {
  const response = await api.delete<StandardResponse<GenericDeleteResponse>>(
    `/roles/${roleId}`,
  );
  return response.data;
}
