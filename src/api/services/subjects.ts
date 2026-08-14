import { api } from '../client';
import {
  GenericDeleteResponse,
  ListParams,
  Paginated,
  StandardResponse,
} from '../interfaces/Common';
import {
  PartialSubjectFormRequest,
  Subject,
  SubjectFormRequest,
} from '../interfaces/Subject';
import { DEFAULT_PAGE_LIMIT } from '@/utils/constants';

export type GetSubjectsParams = ListParams;

export async function getSubjects(
  params?: GetSubjectsParams,
): Promise<StandardResponse<Paginated<Subject>>> {
  const response = await api.get<StandardResponse<Paginated<Subject>>>(
    '/subjects',
    { params: { ...params, limit: params?.limit || DEFAULT_PAGE_LIMIT } },
  );
  return response.data;
}

export async function createSubject(
  request: SubjectFormRequest,
): Promise<StandardResponse<Subject>> {
  const response = await api.post<StandardResponse<Subject>>(
    '/subjects',
    request,
  );
  return response.data;
}

export async function updateSubject(
  subjectId: string,
  request: PartialSubjectFormRequest,
): Promise<StandardResponse<Subject>> {
  const response = await api.put<StandardResponse<Subject>>(
    `/subjects/${subjectId}`,
    request,
  );
  return response.data;
}

export async function deleteSubject(
  subjectId: string,
): Promise<StandardResponse<GenericDeleteResponse>> {
  const response = await api.delete<StandardResponse<GenericDeleteResponse>>(
    `/subjects/${subjectId}`,
  );
  return response.data;
}
