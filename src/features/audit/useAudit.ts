'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAudit, type GetAuditParams } from '@/api/services/audit';

const auditKey = (params: GetAuditParams) => ['audit', params] as const;

/** Paginated, filterable, read-only audit log. */
export function useAudit(params: GetAuditParams) {
  return useQuery({
    queryKey: auditKey(params),
    queryFn: () => getAudit(params),
    placeholderData: keepPreviousData,
    select: (res) => res.data,
  });
}

/** Known audit action types, for the filter dropdown. */
export const AUDIT_ACTIONS = [
  'user.create',
  'user.update',
  'role.update',
  'record.create',
  'record.approve',
  'record.reject',
] as const;

/** Known audited entities, for the filter dropdown. */
export const AUDIT_ENTITIES = ['User', 'Record', 'Role'] as const;
