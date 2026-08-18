'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/api/services/notifications';
import type { ListParams } from '@/api/interfaces/Common';
import { handleApiError } from '@/utils/errorHandler';
import { notify } from '@/utils/notify';

const notificationsKey = (params: ListParams) =>
  ['notifications', params] as const;

/** Paginated notifications for the signed-in user (center + bell). */
export function useNotifications(params: ListParams) {
  return useQuery({
    queryKey: notificationsKey(params),
    queryFn: () => getNotifications(params),
    placeholderData: keepPreviousData,
    select: (res) => res.data,
  });
}

export function useNotificationMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['notifications'] });

  // Marking a single item read is a quiet action — no success toast, just
  // refresh; surface errors only.
  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => invalidate(),
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  const markAllRead = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  return { markRead, markAllRead };
}
