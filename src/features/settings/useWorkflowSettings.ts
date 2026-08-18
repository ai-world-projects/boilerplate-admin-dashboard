'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getWorkflowSettings,
  updateWorkflowSettings,
} from '@/api/services/settings';
import type { WorkflowSettings } from '@/api/interfaces/Settings';
import { handleApiError } from '@/utils/errorHandler';
import { notify } from '@/utils/notify';

/**
 * Workflow configuration (statuses + approval levels). Consumed by the Workflow
 * Settings page and by the Records/Approvals modules, which read statuses and
 * levels from here rather than hardcoding them.
 */
export function useWorkflowSettings() {
  return useQuery({
    queryKey: ['settings', 'workflow'],
    queryFn: getWorkflowSettings,
    select: (res) => res.data,
    staleTime: 60_000,
  });
}

export function useWorkflowSettingsMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: WorkflowSettings) => updateWorkflowSettings(body),
    onSuccess: (res) => {
      notify.success(res.message);
      qc.invalidateQueries({ queryKey: ['settings', 'workflow'] });
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });
}
