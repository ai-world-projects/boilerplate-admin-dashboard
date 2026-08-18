import { api } from '../client';
import { StandardResponse } from '../interfaces/Common';
import {
  ReportFormat,
  ReportType,
  ReportsSummary,
} from '../interfaces/Reports';

export async function getReportsSummary(): Promise<
  StandardResponse<ReportsSummary>
> {
  const response = await api.get<StandardResponse<ReportsSummary>>(
    '/reports/summary',
  );
  return response.data;
}

/**
 * Download a report export as a binary blob. The backend owns file generation
 * (CSV and PDF alike) — the client just requests the format and downloads the
 * bytes, so swapping the mock for the real backend needs no client change.
 */
export async function exportReport(
  type: ReportType,
  format: ReportFormat,
): Promise<Blob> {
  const response = await api.get('/reports/export', {
    params: { type, format },
    responseType: 'blob',
  });
  return response.data as Blob;
}
