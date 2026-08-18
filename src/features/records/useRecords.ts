'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  archiveRecord,
  createRecord,
  getRecordHistory,
  getRecords,
  updateRecord,
  type GetRecordsParams,
} from '@/api/services/records';
import type {
  PartialRecordFormRequest,
  RecordFormRequest,
} from '@/api/interfaces/Record';
import { handleApiError } from '@/utils/errorHandler';
import { notify } from '@/utils/notify';

const recordsKey = (params: GetRecordsParams) => ['records', params] as const;

/** Paginated, searchable, filterable records list. */
export function useRecords(params: GetRecordsParams) {
  return useQuery({
    queryKey: recordsKey(params),
    queryFn: () => getRecords(params),
    placeholderData: keepPreviousData,
    select: (res) => res.data,
  });
}

/** Approval history for a record (enabled only when an id is provided). */
export function useRecordHistory(id: string | null) {
  return useQuery({
    queryKey: ['records', id, 'history'],
    queryFn: () => getRecordHistory(id as string),
    select: (res) => res.data,
    enabled: Boolean(id),
  });
}

export function useRecordMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['records'] });

  const create = useMutation({
    mutationFn: (body: RecordFormRequest) => createRecord(body),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: PartialRecordFormRequest }) =>
      updateRecord(id, body),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  const archive = useMutation({
    mutationFn: ({ id, isArchived }: { id: string; isArchived: boolean }) =>
      archiveRecord(id, { isArchived }),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  return { create, update, archive };
}
