'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { exportReport, getReportsSummary } from '@/api/services/reports';
import type { ReportFormat, ReportType } from '@/api/interfaces/Reports';
import { handleApiError } from '@/utils/errorHandler';
import { notify } from '@/utils/notify';
import { downloadBlob } from '@/utils/download';

export function useReportsSummary() {
  return useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: getReportsSummary,
    select: (res) => res.data,
    staleTime: 30_000,
  });
}

/** Fetches an export blob and triggers a download. */
export function useExportReport() {
  return useMutation({
    mutationFn: (vars: { type: ReportType; format: ReportFormat }) =>
      exportReport(vars.type, vars.format),
    onSuccess: (blob, vars) => {
      downloadBlob(blob, `${vars.type}-report.${vars.format}`);
      notify.success(`${vars.format.toUpperCase()} export downloaded`);
    },
    onError: (e) => notify.error(handleApiError(e).errorMessage),
  });
}
