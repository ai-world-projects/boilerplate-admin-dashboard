import { AxiosResponse } from 'axios';
import { api } from '../client';
import { ListParams, StandardResponse } from '../interfaces/Common';
import {
  MarkAllReadResponse,
  Notification,
  NotificationsPage,
} from '../interfaces/Notification';
import { DEFAULT_PAGE_LIMIT } from '@/utils/constants';

export async function getNotifications(
  params?: ListParams,
): Promise<StandardResponse<NotificationsPage>> {
  const response: AxiosResponse<StandardResponse<NotificationsPage>> =
    await api.get('/notifications', {
      params: { ...params, limit: params?.limit || DEFAULT_PAGE_LIMIT },
    });
  return response.data;
}

export async function markNotificationRead(
  id: string,
): Promise<StandardResponse<Notification>> {
  const response = await api.patch<StandardResponse<Notification>>(
    `/notifications/${id}/read`,
  );
  return response.data;
}

export async function markAllNotificationsRead(): Promise<
  StandardResponse<MarkAllReadResponse>
> {
  const response = await api.post<StandardResponse<MarkAllReadResponse>>(
    '/notifications/read-all',
  );
  return response.data;
}
