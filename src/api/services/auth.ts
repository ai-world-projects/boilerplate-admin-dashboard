import { api } from '../client';
import { StandardResponse } from '../interfaces/Common';
import { LoginData, LoginRequest, MeResponse } from '../interfaces/Auth';

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
