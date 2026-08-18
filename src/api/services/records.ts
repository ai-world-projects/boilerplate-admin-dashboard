import { AxiosResponse } from 'axios';
import { api } from '../client';
import {
  ListParams,
  Paginated,
  StandardResponse,
} from '../interfaces/Common';
import {
  ApprovalAction,
  ArchiveRecordRequest,
  PartialRecordFormRequest,
  RecordFormRequest,
  RecordItem,
} from '../interfaces/Record';
import { DEFAULT_PAGE_LIMIT } from '@/utils/constants';

export type GetRecordsParams = ListParams & {
  status?: string;
  ownerId?: string;
  dateFrom?: string; // ISO date (inclusive)
  dateTo?: string; // ISO date (inclusive)
};

export async function getRecords(
  params?: GetRecordsParams,
): Promise<StandardResponse<Paginated<RecordItem>>> {
  const response: AxiosResponse<StandardResponse<Paginated<RecordItem>>> =
    await api.get('/records', {
      params: { ...params, limit: params?.limit || DEFAULT_PAGE_LIMIT },
    });
  return response.data;
}

export async function getRecord(
  id: string,
): Promise<StandardResponse<RecordItem>> {
  const response = await api.get<StandardResponse<RecordItem>>(`/records/${id}`);
  return response.data;
}

export async function createRecord(
  request: RecordFormRequest,
): Promise<StandardResponse<RecordItem>> {
  const response = await api.post<StandardResponse<RecordItem>>(
    '/records',
    request,
  );
  return response.data;
}

export async function updateRecord(
  id: string,
  request: PartialRecordFormRequest,
): Promise<StandardResponse<RecordItem>> {
  const response = await api.put<StandardResponse<RecordItem>>(
    `/records/${id}`,
    request,
  );
  return response.data;
}

/** Archive (soft-delete) or restore a record. */
export async function archiveRecord(
  id: string,
  request: ArchiveRecordRequest,
): Promise<StandardResponse<RecordItem>> {
  const response = await api.patch<StandardResponse<RecordItem>>(
    `/records/${id}/archive`,
    request,
  );
  return response.data;
}

/** Approval history for a record (appended by the approvals module in 3b). */
export async function getRecordHistory(
  id: string,
): Promise<StandardResponse<ApprovalAction[]>> {
  const response = await api.get<StandardResponse<ApprovalAction[]>>(
    `/records/${id}/history`,
  );
  return response.data;
}
