import { User } from '@/api/interfaces/User';
import { DashboardData } from '@/api/interfaces/Dashboard';
import { Role } from '@/api/interfaces/Rbac';
import {
  BrandingSettings,
  SecuritySettings,
  WorkflowSettings,
} from '@/api/interfaces/Settings';
import {
  ApprovalAction,
  Attachment,
  RecordItem,
} from '@/api/interfaces/Record';
import { AuditEntry } from '@/api/interfaces/Audit';
import { Notification } from '@/api/interfaces/Notification';
import { ReportsSummary } from '@/api/interfaces/Reports';
import { ALL_PERMISSION_KEYS, type PermissionKey } from '@/auth/permissions';

/**
 * In-memory mock datasets. These are mutated by the MSW handlers so create /
 * update / delete behave realistically during development. When the real
 * backend is ready, disable MSW and this file is unused.
 */

const now = new Date();
const daysAgo = (n: number) =>
  new Date(now.getTime() - n * 86_400_000).toISOString();

// ---- Roles (RBAC) ---------------------------------------------------------

const adminPerms: PermissionKey[] = [
  'dashboard:view', 'notifications:view',
  'users:read', 'users:create', 'users:update', 'users:delete', 'users:assignRole',
  'records:read', 'records:create', 'records:update', 'records:archive',
  'approvals:read', 'approvals:approve', 'approvals:reject',
  'audit:read', 'reports:view', 'reports:export', 'settings:workflow',
];
const approverPerms: PermissionKey[] = [
  'dashboard:view', 'notifications:view', 'records:read',
  'approvals:read', 'approvals:approve', 'approvals:reject',
];
const editorPerms: PermissionKey[] = [
  'dashboard:view', 'notifications:view',
  'records:read', 'records:create', 'records:update',
];
const viewerPerms: PermissionKey[] = ['dashboard:view', 'records:read', 'reports:view'];

export const mockRoles: Role[] = [
  { _id: 'r-super', name: 'Super Admin', description: 'Full access to every module and setting.', permissions: ALL_PERMISSION_KEYS, isSystem: true, createdAt: daysAgo(90), updatedAt: daysAgo(90) },
  { _id: 'r-admin', name: 'Admin', description: 'Manage users, records, approvals and reports.', permissions: adminPerms, isSystem: true, createdAt: daysAgo(90), updatedAt: daysAgo(30) },
  { _id: 'r-approver', name: 'Approver', description: 'Review and act on records pending approval.', permissions: approverPerms, isSystem: false, createdAt: daysAgo(80), updatedAt: daysAgo(20) },
  { _id: 'r-editor', name: 'Editor', description: 'Create and edit records.', permissions: editorPerms, isSystem: false, createdAt: daysAgo(80), updatedAt: daysAgo(18) },
  { _id: 'r-viewer', name: 'Viewer', description: 'Read-only access to records and reports.', permissions: viewerPerms, isSystem: false, createdAt: daysAgo(80), updatedAt: daysAgo(15) },
];

// ---- Users ----------------------------------------------------------------

export const mockUsers: User[] = [
  { _id: 'u1', firstName: 'Ava', lastName: 'Reyes', email: 'ava.reyes@example.com', roleIds: ['r-super'], status: 'active', lastLoginAt: daysAgo(0), createdAt: daysAgo(2), updatedAt: daysAgo(1) },
  { _id: 'u2', firstName: 'Marcus', lastName: 'Chen', email: 'marcus.chen@example.com', roleIds: ['r-admin'], status: 'active', lastLoginAt: daysAgo(1), createdAt: daysAgo(6), updatedAt: daysAgo(3) },
  { _id: 'u3', firstName: 'Priya', lastName: 'Nair', email: 'priya.nair@example.com', roleIds: ['r-approver'], status: 'active', lastLoginAt: daysAgo(2), createdAt: daysAgo(9), updatedAt: daysAgo(4) },
  { _id: 'u4', firstName: 'Diego', lastName: 'Santos', email: 'diego.santos@example.com', roleIds: ['r-editor'], status: 'inactive', lastLoginAt: daysAgo(30), createdAt: daysAgo(14), updatedAt: daysAgo(10) },
  { _id: 'u5', firstName: 'Lena', lastName: 'Petrova', email: 'lena.petrova@example.com', roleIds: ['r-approver', 'r-editor'], status: 'active', lastLoginAt: daysAgo(1), createdAt: daysAgo(20), updatedAt: daysAgo(5) },
  { _id: 'u6', firstName: 'Tom', lastName: 'Okafor', email: 'tom.okafor@example.com', roleIds: ['r-viewer'], status: 'pending', lastLoginAt: null, createdAt: daysAgo(1), updatedAt: daysAgo(1) },
  { _id: 'u7', firstName: 'Sara', lastName: 'Kim', email: 'sara.kim@example.com', roleIds: ['r-editor'], status: 'active', lastLoginAt: daysAgo(3), createdAt: daysAgo(30), updatedAt: daysAgo(12) },
  { _id: 'u8', firstName: 'Noah', lastName: 'Ali', email: 'noah.ali@example.com', roleIds: ['r-viewer'], status: 'pending', lastLoginAt: null, createdAt: daysAgo(0), updatedAt: daysAgo(0) },
  { _id: 'u9', firstName: 'Emma', lastName: 'Cruz', email: 'emma.cruz@example.com', roleIds: ['r-admin'], status: 'active', lastLoginAt: daysAgo(4), createdAt: daysAgo(48), updatedAt: daysAgo(20) },
  { _id: 'u10', firstName: 'Yuki', lastName: 'Tanaka', email: 'yuki.tanaka@example.com', roleIds: ['r-viewer'], status: 'active', lastLoginAt: daysAgo(6), createdAt: daysAgo(55), updatedAt: daysAgo(22) },
  { _id: 'u11', firstName: 'Omar', lastName: 'Haddad', email: 'omar.haddad@example.com', roleIds: ['r-editor'], status: 'inactive', lastLoginAt: daysAgo(45), createdAt: daysAgo(60), updatedAt: daysAgo(25) },
  { _id: 'u12', firstName: 'Grace', lastName: 'Miller', email: 'grace.miller@example.com', roleIds: ['r-admin', 'r-approver'], status: 'active', lastLoginAt: daysAgo(2), createdAt: daysAgo(70), updatedAt: daysAgo(30) },
];

/** The signed-in user for the mock session (a Super Admin). */
export const mockCurrentUser: User = mockUsers[0];

/** Union of permission keys granted by a set of role ids (used by /auth/me). */
export const permissionsForRoleIds = (roleIds: string[]): PermissionKey[] => {
  const set = new Set<PermissionKey>();
  roleIds.forEach((id) => {
    mockRoles.find((r) => r._id === id)?.permissions.forEach((p) => set.add(p));
  });
  return [...set];
};

// ---- Workflow settings ----------------------------------------------------

/**
 * Seeded workflow config. Records reference these status keys, and approvals
 * advance through these levels. Mutated in place by PUT /settings/workflow so
 * edits persist across a session.
 */
export const mockWorkflowSettings: WorkflowSettings = {
  statuses: [
    { key: 'draft', label: 'Draft', color: '#8a94a6' },
    { key: 'pending', label: 'Pending', color: '#eda216' },
    { key: 'approved', label: 'Approved', color: '#2ea043' },
    { key: 'rejected', label: 'Rejected', color: '#d32f2f' },
    { key: 'archived', label: 'Archived', color: '#5f6b7a' },
  ],
  approvalLevels: [
    // Super Admin is included at every level so the dev session (signed in as a
    // Super Admin) has a populated Approvals → Pending → "Mine" queue out of the
    // box, without changing which records appear under "All".
    { level: 0, name: 'Team Review', approverRoleIds: ['r-approver', 'r-super'] },
    { level: 1, name: 'Final Approval', approverRoleIds: ['r-admin', 'r-super'] },
  ],
};

/** Seeded security settings, mutated in place by PUT /settings/security. */
export const mockSecuritySettings: SecuritySettings = {
  password: {
    minLength: 10,
    requireUpper: true,
    requireNumber: true,
    requireSymbol: false,
    expiryDays: 90,
  },
  sessionTimeoutMinutes: 30,
  lockout: {
    maxAttempts: 5,
    lockMinutes: 15,
  },
};

/** Seeded branding settings, mutated in place by PUT /settings/branding. */
export const mockBrandingSettings: BrandingSettings = {
  appName: 'AVX Admin',
  logoUrl: '',
  primaryColor: '#192a56',
};

// ---- Records --------------------------------------------------------------

const attachment = (
  id: string,
  fileName: string,
  mimeType: string,
  sizeBytes: number,
  ageDays: number,
): Attachment => ({
  _id: id,
  fileName,
  fileUrl: `https://files.example.com/records/${id}/${encodeURIComponent(fileName)}`,
  mimeType,
  sizeBytes,
  uploadedAt: daysAgo(ageDays),
});

/**
 * Seeded records covering every workflow status (incl. archived), spanning
 * multiple pages, with a mix of owners, approval levels and attachments. Mutated
 * in place by the record and approval handlers.
 */
export const mockRecords: RecordItem[] = [
  { _id: 'rec1', title: 'Q3 Marketing Budget', description: 'Proposed budget allocation for the third-quarter marketing campaigns.', status: 'pending', ownerId: 'u7', ownerName: 'Sara Kim', currentApprovalLevel: 0, attachments: [attachment('att1', 'q3-budget.xlsx', 'application/vnd.ms-excel', 48213, 4)], isArchived: false, createdAt: daysAgo(5), updatedAt: daysAgo(4) },
  { _id: 'rec2', title: 'New Vendor Onboarding — Northwind', description: 'Onboarding pack and due-diligence for the Northwind supplier.', status: 'pending', ownerId: 'u5', ownerName: 'Lena Petrova', currentApprovalLevel: 1, attachments: [], isArchived: false, createdAt: daysAgo(8), updatedAt: daysAgo(2) },
  { _id: 'rec3', title: 'Employee Handbook v2', description: 'Revised company handbook incorporating the new leave policy.', status: 'approved', ownerId: 'u2', ownerName: 'Marcus Chen', currentApprovalLevel: 2, attachments: [attachment('att2', 'handbook-v2.pdf', 'application/pdf', 1048576, 12)], isArchived: false, createdAt: daysAgo(20), updatedAt: daysAgo(10) },
  { _id: 'rec4', title: 'Office Relocation Plan', description: 'Timeline and cost breakdown for the HQ relocation.', status: 'rejected', ownerId: 'u4', ownerName: 'Diego Santos', currentApprovalLevel: 0, attachments: [], isArchived: false, createdAt: daysAgo(15), updatedAt: daysAgo(9) },
  { _id: 'rec5', title: 'Security Audit Report', description: 'Findings from the Q2 internal security audit.', status: 'draft', ownerId: 'u3', ownerName: 'Priya Nair', currentApprovalLevel: 0, attachments: [attachment('att3', 'audit-q2.pdf', 'application/pdf', 762144, 3)], isArchived: false, createdAt: daysAgo(3), updatedAt: daysAgo(1) },
  { _id: 'rec6', title: 'Annual Compliance Review', description: 'Consolidated compliance review ahead of the annual filing.', status: 'pending', ownerId: 'u12', ownerName: 'Grace Miller', currentApprovalLevel: 0, attachments: [], isArchived: false, createdAt: daysAgo(6), updatedAt: daysAgo(6) },
  { _id: 'rec7', title: 'Product Launch Brief', description: 'Go-to-market brief for the spring product launch.', status: 'approved', ownerId: 'u9', ownerName: 'Emma Cruz', currentApprovalLevel: 2, attachments: [], isArchived: false, createdAt: daysAgo(30), updatedAt: daysAgo(22) },
  { _id: 'rec8', title: 'Data Retention Policy', description: 'Superseded data-retention policy kept for reference.', status: 'archived', ownerId: 'u2', ownerName: 'Marcus Chen', currentApprovalLevel: 2, attachments: [attachment('att4', 'retention-policy.pdf', 'application/pdf', 321000, 40)], isArchived: true, createdAt: daysAgo(60), updatedAt: daysAgo(35) },
  { _id: 'rec9', title: 'Partner Agreement — Acme', description: 'Draft partnership agreement with Acme Corp and appendices.', status: 'pending', ownerId: 'u5', ownerName: 'Lena Petrova', currentApprovalLevel: 1, attachments: [attachment('att5', 'agreement.pdf', 'application/pdf', 540000, 7), attachment('att6', 'appendix-a.pdf', 'application/pdf', 210000, 7)], isArchived: false, createdAt: daysAgo(9), updatedAt: daysAgo(3) },
  { _id: 'rec10', title: 'Travel Reimbursement — Q2', description: 'Batch travel reimbursement request for the sales team.', status: 'draft', ownerId: 'u7', ownerName: 'Sara Kim', currentApprovalLevel: 0, attachments: [], isArchived: false, createdAt: daysAgo(2), updatedAt: daysAgo(2) },
  { _id: 'rec11', title: 'Brand Guidelines Update', description: 'Proposed refresh of the visual brand guidelines.', status: 'rejected', ownerId: 'u10', ownerName: 'Yuki Tanaka', currentApprovalLevel: 0, attachments: [], isArchived: false, createdAt: daysAgo(18), updatedAt: daysAgo(11) },
  { _id: 'rec12', title: 'IT Equipment Request', description: 'Hardware refresh request for the engineering team.', status: 'pending', ownerId: 'u11', ownerName: 'Omar Haddad', currentApprovalLevel: 0, attachments: [], isArchived: false, createdAt: daysAgo(4), updatedAt: daysAgo(4) },
  { _id: 'rec13', title: 'Customer Survey Results', description: 'Analysis of the annual customer-satisfaction survey.', status: 'approved', ownerId: 'u3', ownerName: 'Priya Nair', currentApprovalLevel: 2, attachments: [attachment('att7', 'survey-results.csv', 'text/csv', 88231, 25)], isArchived: false, createdAt: daysAgo(28), updatedAt: daysAgo(19) },
  { _id: 'rec14', title: 'Legacy System Decommission', description: 'Retired decommissioning plan for the legacy billing system.', status: 'archived', ownerId: 'u12', ownerName: 'Grace Miller', currentApprovalLevel: 0, attachments: [], isArchived: true, createdAt: daysAgo(70), updatedAt: daysAgo(50) },
];

/**
 * Approval history entries (blueprint §3.3). Appended to by the approval
 * transitions in the approvals module. Seeded for a few records so the Records
 * detail view has history to show immediately.
 */
export const mockApprovalActions: ApprovalAction[] = [
  { _id: 'aa1', recordId: 'rec1', actorId: 'u7', actorName: 'Sara Kim', level: 0, action: 'submit', remarks: '', createdAt: daysAgo(5) },
  { _id: 'aa2', recordId: 'rec3', actorId: 'u2', actorName: 'Marcus Chen', level: 0, action: 'submit', remarks: '', createdAt: daysAgo(20) },
  { _id: 'aa3', recordId: 'rec3', actorId: 'u3', actorName: 'Priya Nair', level: 0, action: 'approve', remarks: 'Looks good.', createdAt: daysAgo(16) },
  { _id: 'aa4', recordId: 'rec3', actorId: 'u2', actorName: 'Marcus Chen', level: 1, action: 'approve', remarks: 'Approved for publication.', createdAt: daysAgo(10) },
  { _id: 'aa5', recordId: 'rec4', actorId: 'u4', actorName: 'Diego Santos', level: 0, action: 'submit', remarks: '', createdAt: daysAgo(15) },
  { _id: 'aa6', recordId: 'rec4', actorId: 'u3', actorName: 'Priya Nair', level: 0, action: 'reject', remarks: 'Costs exceed the approved budget — please revise.', createdAt: daysAgo(9) },
  { _id: 'aa7', recordId: 'rec9', actorId: 'u5', actorName: 'Lena Petrova', level: 0, action: 'submit', remarks: '', createdAt: daysAgo(9) },
  { _id: 'aa8', recordId: 'rec9', actorId: 'u3', actorName: 'Priya Nair', level: 0, action: 'approve', remarks: 'Cleared first review.', createdAt: daysAgo(3) },
];

// ---- Audit log ------------------------------------------------------------

/**
 * Immutable audit store. Seeded across several action types so Phase 4 filters
 * have coverage; the approvals handlers append to it on every transition.
 */
export const mockAuditEntries: AuditEntry[] = [
  { _id: 'aud1', actorId: 'u1', actorName: 'Ava Reyes', action: 'user.create', entity: 'User', entityId: 'u8', before: null, after: { email: 'noah.ali@example.com' }, ip: '10.0.0.4', createdAt: daysAgo(1) },
  { _id: 'aud2', actorId: 'u2', actorName: 'Marcus Chen', action: 'record.create', entity: 'Record', entityId: 'rec3', before: null, after: { title: 'Employee Handbook v2' }, ip: '10.0.0.9', createdAt: daysAgo(20) },
  { _id: 'aud3', actorId: 'u3', actorName: 'Priya Nair', action: 'record.approve', entity: 'Record', entityId: 'rec3', before: { status: 'pending' }, after: { status: 'pending' }, ip: '10.0.0.12', createdAt: daysAgo(16) },
  { _id: 'aud4', actorId: 'u2', actorName: 'Marcus Chen', action: 'record.approve', entity: 'Record', entityId: 'rec3', before: { status: 'pending' }, after: { status: 'approved' }, ip: '10.0.0.9', createdAt: daysAgo(10) },
  { _id: 'aud5', actorId: 'u3', actorName: 'Priya Nair', action: 'record.reject', entity: 'Record', entityId: 'rec4', before: { status: 'pending' }, after: { status: 'rejected' }, ip: '10.0.0.12', createdAt: daysAgo(9) },
  { _id: 'aud6', actorId: 'u1', actorName: 'Ava Reyes', action: 'role.update', entity: 'Role', entityId: 'r-editor', before: { permissions: 2 }, after: { permissions: 3 }, ip: '10.0.0.4', createdAt: daysAgo(18) },
  { _id: 'aud7', actorId: 'u12', actorName: 'Grace Miller', action: 'record.create', entity: 'Record', entityId: 'rec6', before: null, after: { title: 'Annual Compliance Review' }, ip: '10.0.0.21', createdAt: daysAgo(6) },
  { _id: 'aud8', actorId: 'u1', actorName: 'Ava Reyes', action: 'user.update', entity: 'User', entityId: 'u4', before: { status: 'active' }, after: { status: 'inactive' }, ip: '10.0.0.4', createdAt: daysAgo(10) },
];

// ---- Notifications --------------------------------------------------------

/**
 * Notification store. Seeded for the signed-in mock user so the center and
 * header bell have unread/read coverage; approvals append here on transitions.
 */
export const mockNotifications: Notification[] = [
  { _id: 'ntf1', userId: 'u1', title: 'Record approved', body: '“Employee Handbook v2” was fully approved.', type: 'record.approved', isRead: false, link: '/records', createdAt: daysAgo(10) },
  { _id: 'ntf2', userId: 'u1', title: 'Approval assigned', body: 'A record is awaiting your review at Final Approval.', type: 'approval.assigned', isRead: false, link: '/approvals', createdAt: daysAgo(3) },
  { _id: 'ntf3', userId: 'u1', title: 'Record rejected', body: '“Office Relocation Plan” was rejected.', type: 'record.rejected', isRead: true, link: '/records', createdAt: daysAgo(9) },
  { _id: 'ntf4', userId: 'u1', title: 'New user pending', body: 'Noah Ali is awaiting activation.', type: 'user.pending', isRead: true, link: '/users', createdAt: daysAgo(1) },
];

// ---- Dashboard ------------------------------------------------------------

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Build the dashboard payload from the current mock state so KPIs and charts
 * reflect any records/approvals created during the session. Computed per request
 * rather than frozen at import time.
 */
export function buildDashboard(): DashboardData {
  const pendingApprovals = mockRecords.filter(
    (r) => r.status === 'pending' && !r.isArchived,
  ).length;

  const cardStats = [
    { type: 'users', title: 'Total Users', count: mockUsers.length, changePct: 12.5 },
    { type: 'active', title: 'Active Users', count: mockUsers.filter((u) => u.status === 'active').length, changePct: 6.4 },
    { type: 'pending', title: 'Pending Approvals', count: pendingApprovals, changePct: 3.1 },
    { type: 'records', title: 'Records', count: mockRecords.length, changePct: 9.2 },
  ];

  const recordsByStatus = mockWorkflowSettings.statuses.map((s) => ({
    status: s.key,
    label: s.label,
    color: s.color,
    count: mockRecords.filter((r) => r.status === s.key).length,
  }));

  // Approvals throughput over the last 6 months, from the approval history.
  const now = new Date();
  const approvalsThroughput = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const inMonth = (iso: string) => {
      const t = new Date(iso);
      return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth();
    };
    const monthActions = mockApprovalActions.filter((a) => inMonth(a.createdAt));
    return {
      period: MONTH_LABELS[d.getMonth()],
      approved: monthActions.filter((a) => a.action === 'approve').length,
      rejected: monthActions.filter((a) => a.action === 'reject').length,
    };
  });

  return { cardStats, recordsByStatus, approvalsThroughput };
}

// ---- Reports --------------------------------------------------------------

/** Build the reports summary from current mock state. */
export function buildReportsSummary(): ReportsSummary {
  const users = {
    total: mockUsers.length,
    active: mockUsers.filter((u) => u.status === 'active').length,
    inactive: mockUsers.filter((u) => u.status === 'inactive').length,
    pending: mockUsers.filter((u) => u.status === 'pending').length,
  };

  const recordsByStatus = mockWorkflowSettings.statuses.map((s) => ({
    status: s.key,
    label: s.label,
    color: s.color,
    count: mockRecords.filter((r) => r.status === s.key).length,
  }));

  // Turnaround: hours from a record's submit to its last terminal decision.
  const byRecord = new Map<string, ApprovalAction[]>();
  mockApprovalActions.forEach((a) => {
    byRecord.set(a.recordId, [...(byRecord.get(a.recordId) ?? []), a]);
  });
  const durations: number[] = [];
  byRecord.forEach((actions) => {
    const submit = actions.find((a) => a.action === 'submit');
    const terminal = [...actions]
      .reverse()
      .find((a) => a.action === 'approve' || a.action === 'reject');
    if (submit && terminal) {
      const hrs =
        (+new Date(terminal.createdAt) - +new Date(submit.createdAt)) / 3_600_000;
      if (hrs >= 0) durations.push(hrs);
    }
  });
  const averageHours = durations.length
    ? Math.round(durations.reduce((s, h) => s + h, 0) / durations.length)
    : 0;

  return {
    users,
    recordsByStatus,
    approvalTurnaround: {
      averageHours,
      approvedCount: mockRecords.filter((r) => r.status === 'approved').length,
      rejectedCount: mockRecords.filter((r) => r.status === 'rejected').length,
    },
  };
}
