import { AxiosResponse } from 'axios';
import { api } from '../client';
import {
  ListParams,
  Paginated,
  StandardResponse,
} from '../interfaces/Common';
import { AuditEntry } from '../interfaces/Audit';
import { DEFAULT_PAGE_LIMIT } from '@/utils/constants';

export type GetAuditParams = ListParams & {
  actorId?: string;
  action?: string;
  entity?: string;
  dateFrom?: string;
  dateTo?: string;
  /** "Admin Activity" preset — only entries by admin-role actors. */
  adminOnly?: boolean;
};

export async function getAudit(
  params?: GetAuditParams,
): Promise<StandardResponse<Paginated<AuditEntry>>> {
  const response: AxiosResponse<StandardResponse<Paginated<AuditEntry>>> =
    await api.get('/audit', {
      params: { ...params, limit: params?.limit || DEFAULT_PAGE_LIMIT },
    });
  return response.data;
}
