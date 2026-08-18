/** Reports summary payload (blueprint §2.7). */
export interface ReportsSummary {
  users: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
  };
  recordsByStatus: {
    status: string;
    label: string;
    color: string;
    count: number;
  }[];
  approvalTurnaround: {
    averageHours: number;
    approvedCount: number;
    rejectedCount: number;
  };
}

/** Which summary an export covers. */
export type ReportType = 'users' | 'records' | 'approvals';

/** Export file format. */
export type ReportFormat = 'csv' | 'pdf';
