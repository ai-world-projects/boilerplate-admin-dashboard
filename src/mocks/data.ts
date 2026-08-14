import { User } from '@/api/interfaces/User';
import { Subject } from '@/api/interfaces/Subject';
import { DashboardData } from '@/api/interfaces/Dashboard';
import { Role } from '@/api/interfaces/Rbac';
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

/** Look up display names for a set of role ids. */
export const roleNames = (roleIds: string[]) =>
  roleIds
    .map((id) => mockRoles.find((r) => r._id === id)?.name)
    .filter(Boolean) as string[];

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

// ---- Subjects (legacy — replaced by Records in Phase 3) -------------------

export const mockSubjects: Subject[] = [
  { _id: 's1', name: 'Introduction to Anatomy', code: 'ANA101', description: 'Foundations of human anatomy.', instructor: 'Marcus Chen', enrolledCount: 128, isPublished: true, createdAt: daysAgo(80), updatedAt: daysAgo(3) },
  { _id: 's2', name: 'Pharmacology Basics', code: 'PHA201', description: 'Core drug classifications and effects.', instructor: 'Lena Petrova', enrolledCount: 96, isPublished: true, createdAt: daysAgo(75), updatedAt: daysAgo(5) },
  { _id: 's3', name: 'Clinical Nursing', code: 'NUR301', description: 'Applied patient-care practices.', instructor: 'Emma Cruz', enrolledCount: 74, isPublished: true, createdAt: daysAgo(60), updatedAt: daysAgo(8) },
  { _id: 's4', name: 'Medical Ethics', code: 'ETH110', description: 'Ethical frameworks in healthcare.', instructor: 'Marcus Chen', enrolledCount: 52, isPublished: false, createdAt: daysAgo(45), updatedAt: daysAgo(12) },
  { _id: 's5', name: 'Physiology II', code: 'PHY202', description: 'Advanced organ-system physiology.', instructor: 'Lena Petrova', enrolledCount: 63, isPublished: true, createdAt: daysAgo(30), updatedAt: daysAgo(6) },
];

// ---- Dashboard ------------------------------------------------------------

export const mockDashboard: DashboardData = {
  cardStats: [
    { type: 'users', title: 'Total Users', count: mockUsers.length, changePct: 12.5 },
    { type: 'active', title: 'Active Users', count: mockUsers.filter((u) => u.status === 'active').length, changePct: 6.4 },
    { type: 'pending', title: 'Pending Approval', count: mockUsers.filter((u) => u.status === 'pending').length, changePct: 3.1 },
    { type: 'enrollments', title: 'Enrollments', count: 542, changePct: 8.1 },
  ],
  enrollmentTrend: [
    { month: 'Jan', enrollments: 210 },
    { month: 'Feb', enrollments: 245 },
    { month: 'Mar', enrollments: 278 },
    { month: 'Apr', enrollments: 301 },
    { month: 'May', enrollments: 356 },
    { month: 'Jun', enrollments: 402 },
    { month: 'Jul', enrollments: 468 },
    { month: 'Aug', enrollments: 542 },
  ],
  usersByRole: mockRoles.map((role) => ({
    role: role.name,
    count: mockUsers.filter((u) => u.roleIds.includes(role._id)).length,
  })),
  recentUsers: mockUsers
    .slice()
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5)
    .map((u) => ({
      _id: u._id,
      fullName: `${u.firstName} ${u.lastName}`,
      email: u.email,
      role: roleNames(u.roleIds)[0] ?? '—',
      createdAt: u.createdAt,
    })),
};
