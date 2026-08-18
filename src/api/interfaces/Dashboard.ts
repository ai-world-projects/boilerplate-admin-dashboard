export interface DashboardData {
  cardStats: CardStat[];
  recordsByStatus: RecordStatusSlice[];
  approvalsThroughput: ThroughputPoint[];
}

export interface CardStat {
  type: string;
  title: string;
  count: number;
  /** Percentage change vs. previous period; may be negative. */
  changePct: number;
}

export interface RecordStatusSlice {
  status: string; // workflow status key
  label: string;
  color: string; // hex, from the workflow config
  count: number;
}

export interface ThroughputPoint {
  period: string; // e.g. "Mar"
  approved: number;
  rejected: number;
}
