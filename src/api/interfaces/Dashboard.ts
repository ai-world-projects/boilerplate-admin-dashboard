export interface DashboardData {
  cardStats: CardStat[];
  enrollmentTrend: TrendPoint[];
  usersByRole: RoleSlice[];
  recentUsers: RecentUser[];
}

export interface CardStat {
  type: string;
  title: string;
  count: number;
  /** Percentage change vs. previous period; may be negative. */
  changePct: number;
}

export interface TrendPoint {
  month: string;
  enrollments: number;
}

export interface RoleSlice {
  role: string;
  count: number;
}

export interface RecentUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}
