'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  approveRecord,
  getApprovals,
  rejectRecord,
  type GetApprovalsParams,
} from '@/api/services/approvals';
import { handleApiError } from '@/utils/errorHandler';
import { notify } from '@/utils/notify';

const approvalsKey = (params: GetApprovalsParams) =>
  ['approvals', params] as const;

/** The approval queue for a given tab/scope. */
export function useApprovals(params: GetApprovalsParams) {
  return useQuery({
    queryKey: approvalsKey(params),
    queryFn: () => getApprovals(params),
    placeholderData: keepPreviousData,
    select: (res) => res.data,
  });
}

export function useApprovalMutations() {
  const qc = useQueryClient();
  // A transition touches records, the queue, history, dashboard, audit and
  // notifications — refresh them all so every surface stays in sync.
  const invalidate = () => {
    ['approvals', 'records', 'dashboard', 'audit', 'notifications'].forEach(
      (key) => qc.invalidateQueries({ queryKey: [key] }),
    );
  };

  const approve = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
      approveRecord(id, { remarks }),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  const reject = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks: string }) =>
      rejectRecord(id, { remarks }),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  return { approve, reject };
}
