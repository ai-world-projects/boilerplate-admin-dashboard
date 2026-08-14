import { AxiosResponse } from 'axios';
import { api } from '../client';
import {
  GenericDeleteResponse,
  ListParams,
  Paginated,
  StandardResponse,
} from '../interfaces/Common';
import {
  AssignRolesRequest,
  PartialUserFormRequest,
  UpdateUserStatusRequest,
  User,
  UserFormRequest,
  UserStatus,
} from '../interfaces/User';
import { DEFAULT_PAGE_LIMIT } from '@/utils/constants';

export type GetUsersParams = ListParams & { status?: UserStatus; roleId?: string };

export async function getUsers(
  params?: GetUsersParams,
): Promise<StandardResponse<Paginated<User>>> {
  const response: AxiosResponse<StandardResponse<Paginated<User>>> =
    await api.get('/users', {
      params: { ...params, limit: params?.limit || DEFAULT_PAGE_LIMIT },
    });
  return response.data;
}

export async function createUser(
  request: UserFormRequest,
): Promise<StandardResponse<User>> {
  const response = await api.post<StandardResponse<User>>('/users', request);
  return response.data;
}

export async function updateUser(
  userId: string,
  request: PartialUserFormRequest,
): Promise<StandardResponse<User>> {
  const response = await api.put<StandardResponse<User>>(
    `/users/${userId}`,
    request,
  );
  return response.data;
}

export async function deleteUser(
  userId: string,
): Promise<StandardResponse<GenericDeleteResponse>> {
  const response = await api.delete<StandardResponse<GenericDeleteResponse>>(
    `/users/${userId}`,
  );
  return response.data;
}

/** Activate / deactivate / set pending via the dedicated status endpoint. */
export async function updateUserStatus(
  userId: string,
  request: UpdateUserStatusRequest,
): Promise<StandardResponse<User>> {
  const response = await api.patch<StandardResponse<User>>(
    `/users/${userId}/status`,
    request,
  );
  return response.data;
}

/** Assign the full set of roles for a user. */
export async function assignUserRoles(
  userId: string,
  request: AssignRolesRequest,
): Promise<StandardResponse<User>> {
  const response = await api.put<StandardResponse<User>>(
    `/users/${userId}/roles`,
    request,
  );
  return response.data;
}
