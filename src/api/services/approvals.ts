import { AxiosResponse } from 'axios';
import { api } from '../client';
import {
  ListParams,
  Paginated,
  StandardResponse,
} from '../interfaces/Common';
import {
  ApproveRecordRequest,
  RecordItem,
  RejectRecordRequest,
} from '../interfaces/Record';
import { DEFAULT_PAGE_LIMIT } from '@/utils/constants';

export type ApprovalTab = 'pending' | 'approved' | 'rejected';
export type ApprovalScope = 'mine' | 'all';

export type GetApprovalsParams = ListParams & {
  tab: ApprovalTab;
  /** For the Pending tab: "mine" = records I can act on, "all" = every pending. */
  scope?: ApprovalScope;
};

export async function getApprovals(
  params: GetApprovalsParams,
): Promise<StandardResponse<Paginated<RecordItem>>> {
  const response: AxiosResponse<StandardResponse<Paginated<RecordItem>>> =
    await api.get('/approvals', {
      params: { ...params, limit: params.limit || DEFAULT_PAGE_LIMIT },
    });
  return response.data;
}

export async function approveRecord(
  id: string,
  body: ApproveRecordRequest,
): Promise<StandardResponse<RecordItem>> {
  const response = await api.post<StandardResponse<RecordItem>>(
    `/records/${id}/approve`,
    body,
  );
  return response.data;
}

export async function rejectRecord(
  id: string,
  body: RejectRecordRequest,
): Promise<StandardResponse<RecordItem>> {
  const response = await api.post<StandardResponse<RecordItem>>(
    `/records/${id}/reject`,
    body,
  );
  return response.data;
}
