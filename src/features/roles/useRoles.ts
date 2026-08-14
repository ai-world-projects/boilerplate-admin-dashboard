'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRole,
  deleteRole,
  getPermissions,
  getRoles,
  updateRole,
} from '@/api/services/roles';
import type {
  PartialRoleFormRequest,
  RoleFormRequest,
} from '@/api/interfaces/Rbac';
import { handleApiError } from '@/utils/errorHandler';
import { notify } from '@/utils/notify';

/** All roles (used by the roles table and the user role picker). */
export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
    select: (res) => res.data,
    staleTime: 60_000,
  });
}

/** The permission catalogue for the role editor matrix. */
export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
    select: (res) => res.data,
    staleTime: Infinity,
  });
}

export function useRoleMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['roles'] });

  const create = useMutation({
    mutationFn: (body: RoleFormRequest) => createRole(body),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: PartialRoleFormRequest }) =>
      updateRole(id, body),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: (res) => {
      notify.success(res.message);
      invalidate();
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });

  return { create, update, remove };
}
