import { api } from '../client';
import { StandardResponse } from '../interfaces/Common';
import {
  ChangePasswordRequest,
  LoginData,
  LoginRequest,
  MeResponse,
} from '../interfaces/Auth';

export async function login(
  request: LoginRequest,
): Promise<StandardResponse<LoginData>> {
  const response = await api.post<StandardResponse<LoginData>>(
    '/auth/login',
    request,
  );
  return response.data;
}

/** Load the signed-in user, their roles, and flattened permission keys. */
export async function getMe(): Promise<StandardResponse<MeResponse>> {
  const response = await api.get<StandardResponse<MeResponse>>('/auth/me');
  return response.data;
}

export async function logout(): Promise<StandardResponse<null>> {
  const response = await api.post<StandardResponse<null>>('/auth/logout');
  return response.data;
}

/** Change the signed-in user's own password. */
export async function changePassword(
  request: ChangePasswordRequest,
): Promise<StandardResponse<null>> {
  const response = await api.put<StandardResponse<null>>(
    '/profile/password',
    request,
  );
  return response.data;
}
