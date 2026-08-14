'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  assignUserRoles,
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  updateUserStatus,
  type GetUsersParams,
} from '@/api/services/users';
import type {
  PartialUserFormRequest,
  UserFormRequest,
  UserStatus,
} from '@/api/interfaces/User';
import { handleApiError } from '@/utils/errorHandler';
import { notify } from '@/utils/notify';

const usersKey = (params: GetUsersParams) => ['users', params] as const;

/** Paginated, searchable users list. */
export function useUsers(params: GetUsersParams) {
  return useQuery({
    queryKey: usersKey(params),
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
    select: (res) => res.data,
  });
}

/** Create / update / delete mutations that invalidate the list on success. */
export function useUserMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] });

  const create = useMutation({
    mutationFn: (body: UserFormRequest) => createUser(body),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: PartialUserFormRequest }) =>
      updateUser(id, body),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      updateUserStatus(id, { status }),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  const assignRoles = useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      assignUserRoles(id, { roleIds }),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  return { create, update, remove, setStatus, assignRoles };
}
