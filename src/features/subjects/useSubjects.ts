'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createSubject,
  deleteSubject,
  getSubjects,
  updateSubject,
  type GetSubjectsParams,
} from '@/api/services/subjects';
import type {
  PartialSubjectFormRequest,
  SubjectFormRequest,
} from '@/api/interfaces/Subject';
import { handleApiError } from '@/utils/errorHandler';
import { notify } from '@/utils/notify';

const subjectsKey = (params: GetSubjectsParams) => ['subjects', params] as const;

/** Paginated, searchable subjects list. */
export function useSubjects(params: GetSubjectsParams) {
  return useQuery({
    queryKey: subjectsKey(params),
    queryFn: () => getSubjects(params),
    placeholderData: keepPreviousData,
    select: (res) => res.data,
  });
}

export function useSubjectMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['subjects'] });

  const create = useMutation({
    mutationFn: (body: SubjectFormRequest) => createSubject(body),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: PartialSubjectFormRequest }) =>
      updateSubject(id, body),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteSubject(id),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  return { create, update, remove };
}
