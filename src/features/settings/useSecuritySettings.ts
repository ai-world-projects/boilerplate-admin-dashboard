'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getSecuritySettings,
  updateSecuritySettings,
} from '@/api/services/settings';
import type { SecuritySettings } from '@/api/interfaces/Settings';
import { handleApiError } from '@/utils/errorHandler';
import { notify } from '@/utils/notify';

export function useSecuritySettings() {
  return useQuery({
    queryKey: ['settings', 'security'],
    queryFn: getSecuritySettings,
    select: (res) => res.data,
    staleTime: 60_000,
  });
}

export function useSecuritySettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SecuritySettings) => updateSecuritySettings(body),
    onSuccess: (res) => {
      notify.success(res.message);
      qc.invalidateQueries({ queryKey: ['settings', 'security'] });
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });
}
