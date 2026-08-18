import { http, HttpResponse } from 'msw';
import { Paginated, StandardResponse } from '@/api/interfaces/Common';
import {
  AssignRolesRequest,
  UpdateUserStatusRequest,
  User,
  UserFormRequest,
} from '@/api/interfaces/User';
import { Role, RoleFormRequest } from '@/api/interfaces/Rbac';
import {
  BrandingSettings,
  SecuritySettings,
  WorkflowSettings,
} from '@/api/interfaces/Settings';
import {
  ApprovalAction,
  ApproveRecordRequest,
  ArchiveRecordRequest,
  RecordFormRequest,
  RecordItem,
  RejectRecordRequest,
} from '@/api/interfaces/Record';
import { AuditEntry } from '@/api/interfaces/Audit';
import { Notification } from '@/api/interfaces/Notification';
import {
  buildDashboard,
  buildReportsSummary,
  mockApprovalActions,
  mockAuditEntries,
  mockBrandingSettings,
  mockCurrentUser,
  mockNotifications,
  mockRecords,
  mockRoles,
  mockSecuritySettings,
  mockUsers,
  mockWorkflowSettings,
  permissionsForRoleIds,
} from './data';
import { PERMISSIONS } from '@/auth/permissions';

/** Wrap any payload in the StandardResponse envelope the real API uses. */
function ok<T>(data: T, message = 'Success'): StandardResponse<T> {
  return { result: 'success', message, data };
}

/** Apply keyword filter + pagination to a collection, mirroring the backend. */
function paginate<T>(
  items: T[],
  url: URL,
  matches: (item: T, keyword: string) => boolean,
): Paginated<T> {
  const keyword = (url.searchParams.get('keyword') || '').toLowerCase();
  const page = Number(url.searchParams.get('page') || 1);
  const limit = Number(url.searchParams.get('limit') || 10);

  const filtered = keyword
    ? items.filter((item) => matches(item, keyword))
    : items;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return {
    total: filtered.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    data,
  };
}

const genId = (prefix: string) =>
  `${prefix}${Math.random().toString(36).slice(2, 8)}`;
const nowIso = () => new Date().toISOString();

/**
 * Small artificial delay so loading states are visible in development. Remove or
 * lower for snappier local testing.
 */
const LATENCY_MS = 350;
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS));

const currentActorName = () =>
  `${mockCurrentUser.firstName} ${mockCurrentUser.lastName}`;

/** Append an approval-history entry to a record. */
function appendApprovalAction(
  entry: Omit<ApprovalAction, '_id' | 'createdAt'>,
): ApprovalAction {
  const action: ApprovalAction = {
    ...entry,
    _id: genId('aa'),
    createdAt: nowIso(),
  };
  mockApprovalActions.push(action);
  return action;
}

/**
 * Cross-cutting event emitter (skill "approval / audit / notification" note).
 * Every approval transition writes an AuditEntry AND fires a Notification, so the
 * Phase 4 read side has nothing to refactor.
 */
function emitAudit(entry: Omit<AuditEntry, '_id' | 'createdAt' | 'ip'>): void {
  mockAuditEntries.unshift({
    ...entry,
    _id: genId('aud'),
    ip: '10.0.0.4',
    createdAt: nowIso(),
  });
}

function emitNotification(
  entry: Omit<Notification, '_id' | 'isRead' | 'createdAt'>,
): void {
  mockNotifications.unshift({
    ...entry,
    _id: genId('ntf'),
    isRead: false,
    createdAt: nowIso(),
  });
}

/** Build a CSV body for a given report type from the summary. */
function buildReportCsv(type: string): string {
  const summary = buildReportsSummary();
  if (type === 'records') {
    return [
      'Status,Count',
      ...summary.recordsByStatus.map((s) => `${s.label},${s.count}`),
    ].join('\n');
  }
  if (type === 'approvals') {
    return [
      'Metric,Value',
      `Average turnaround (hours),${summary.approvalTurnaround.averageHours}`,
      `Approved,${summary.approvalTurnaround.approvedCount}`,
      `Rejected,${summary.approvalTurnaround.rejectedCount}`,
    ].join('\n');
  }
  // users
  return [
    'Metric,Count',
    `Total,${summary.users.total}`,
    `Active,${summary.users.active}`,
    `Inactive,${summary.users.inactive}`,
    `Pending,${summary.users.pending}`,
  ].join('\n');
}

/** Build a minimal, valid single-page PDF with correct xref offsets. */
function buildStubPdf(title: string): string {
  const objs = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 420 200]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>',
    '', // placeholder for the content stream, filled below
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
  ];
  const stream = `BT /F1 16 Tf 40 130 Td (${title.replace(/[()\\]/g, ' ')}) Tj ET`;
  objs[3] = `<</Length ${stream.length}>>\nstream\n${stream}\nendstream`;

  let body = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(body.length);
    body += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xrefStart = body.length;
  let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    xref += `${off.toString().padStart(10, '0')} 00000 n \n`;
  });
  const trailer = `trailer\n<</Size ${
    objs.length + 1
  }/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`;
  return body + xref + trailer;
}

export const handlers = [
  // ---- Auth -------------------------------------------------------------
  http.post('/api/auth/login', async () => {
    await delay();
    return HttpResponse.json(
      ok({
        user: mockUsers[0],
        token: 'mock-jwt-token',
        expiresIn: '7d',
      }),
      { status: 200 },
    );
  }),

  http.get('/api/auth/me', async () => {
    await delay();
    const roles = mockRoles.filter((r) => mockCurrentUser.roleIds.includes(r._id));
    return HttpResponse.json(
      ok({
        user: mockCurrentUser,
        roles,
        permissions: permissionsForRoleIds(mockCurrentUser.roleIds),
      }),
    );
  }),

  http.post('/api/auth/logout', async () => {
    await delay();
    return HttpResponse.json(ok(null, 'Logged out'));
  }),

  http.put('/api/profile/password', async ({ request }) => {
    await delay();
    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };
    if (!body.currentPassword || !body.newPassword)
      return HttpResponse.json(
        { message: 'Both current and new passwords are required' },
        { status: 400 },
      );
    // The mock accepts any current password; a real backend verifies it.
    return HttpResponse.json(ok(null, 'Password changed'));
  }),

  // ---- Dashboard --------------------------------------------------------
  http.get('/api/dashboard', async () => {
    await delay();
    return HttpResponse.json(ok(buildDashboard()));
  }),

  // ---- Users ------------------------------------------------------------
  http.get('/api/users', async ({ request }) => {
    await delay();
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const roleId = url.searchParams.get('roleId');
    let source = mockUsers;
    if (status) source = source.filter((u) => u.status === status);
    if (roleId) source = source.filter((u) => u.roleIds.includes(roleId));
    const result = paginate(
      source,
      url,
      (u, k) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(k) ||
        u.email.toLowerCase().includes(k),
    );
    return HttpResponse.json(ok(result));
  }),

  http.post('/api/users', async ({ request }) => {
    await delay();
    const body = (await request.json()) as UserFormRequest;
    const user: User = {
      _id: genId('u'),
      ...body,
      lastLoginAt: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    mockUsers.unshift(user);
    return HttpResponse.json(ok(user, 'User created'), { status: 201 });
  }),

  http.put('/api/users/:id', async ({ params, request }) => {
    await delay();
    const body = (await request.json()) as Partial<UserFormRequest>;
    const idx = mockUsers.findIndex((u) => u._id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    mockUsers[idx] = { ...mockUsers[idx], ...body, updatedAt: nowIso() };
    return HttpResponse.json(ok(mockUsers[idx], 'User updated'));
  }),

  http.patch('/api/users/:id/status', async ({ params, request }) => {
    await delay();
    const body = (await request.json()) as UpdateUserStatusRequest;
    const idx = mockUsers.findIndex((u) => u._id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    mockUsers[idx] = { ...mockUsers[idx], status: body.status, updatedAt: nowIso() };
    return HttpResponse.json(ok(mockUsers[idx], 'Status updated'));
  }),

  http.put('/api/users/:id/roles', async ({ params, request }) => {
    await delay();
    const body = (await request.json()) as AssignRolesRequest;
    const idx = mockUsers.findIndex((u) => u._id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    mockUsers[idx] = { ...mockUsers[idx], roleIds: body.roleIds, updatedAt: nowIso() };
    return HttpResponse.json(ok(mockUsers[idx], 'Roles updated'));
  }),

  http.delete('/api/users/:id', async ({ params }) => {
    await delay();
    const idx = mockUsers.findIndex((u) => u._id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    mockUsers.splice(idx, 1);
    return HttpResponse.json(ok({ acknowledged: true, deletedCount: 1 }, 'User deleted'));
  }),

  // ---- Roles & permissions ---------------------------------------------
  http.get('/api/permissions', async () => {
    await delay();
    return HttpResponse.json(ok(PERMISSIONS));
  }),

  http.get('/api/roles', async () => {
    await delay();
    return HttpResponse.json(ok(mockRoles));
  }),

  http.post('/api/roles', async ({ request }) => {
    await delay();
    const body = (await request.json()) as RoleFormRequest;
    const role: Role = {
      _id: genId('r'),
      ...body,
      isSystem: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    mockRoles.push(role);
    return HttpResponse.json(ok(role, 'Role created'), { status: 201 });
  }),

  http.put('/api/roles/:id', async ({ params, request }) => {
    await delay();
    const body = (await request.json()) as Partial<RoleFormRequest>;
    const idx = mockRoles.findIndex((r) => r._id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    mockRoles[idx] = { ...mockRoles[idx], ...body, updatedAt: nowIso() };
    return HttpResponse.json(ok(mockRoles[idx], 'Role updated'));
  }),

  http.delete('/api/roles/:id', async ({ params }) => {
    await delay();
    const idx = mockRoles.findIndex((r) => r._id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    if (mockRoles[idx].isSystem)
      return HttpResponse.json({ message: 'System roles cannot be deleted' }, { status: 400 });
    mockRoles.splice(idx, 1);
    return HttpResponse.json(ok({ acknowledged: true, deletedCount: 1 }, 'Role deleted'));
  }),

  // ---- Audit log --------------------------------------------------------
  http.get('/api/audit', async ({ request }) => {
    await delay();
    const url = new URL(request.url);
    const actorId = url.searchParams.get('actorId');
    const action = url.searchParams.get('action');
    const entity = url.searchParams.get('entity');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const adminOnly = url.searchParams.get('adminOnly') === 'true';

    // Admin actors = users holding a super-admin or admin role.
    const adminRoleIds = ['r-super', 'r-admin'];
    const adminUserIds = new Set(
      mockUsers
        .filter((u) => u.roleIds.some((r) => adminRoleIds.includes(r)))
        .map((u) => u._id),
    );

    let source = mockAuditEntries;
    if (actorId) source = source.filter((a) => a.actorId === actorId);
    if (action) source = source.filter((a) => a.action === action);
    if (entity) source = source.filter((a) => a.entity === entity);
    if (dateFrom) source = source.filter((a) => a.createdAt >= dateFrom);
    if (dateTo)
      source = source.filter((a) => a.createdAt <= `${dateTo}T23:59:59.999Z`);
    if (adminOnly) source = source.filter((a) => adminUserIds.has(a.actorId));

    const result = paginate(
      source,
      url,
      (a, k) =>
        a.actorName.toLowerCase().includes(k) ||
        a.action.toLowerCase().includes(k) ||
        a.entity.toLowerCase().includes(k),
    );
    return HttpResponse.json(ok(result));
  }),

  // ---- Reports ----------------------------------------------------------
  http.get('/api/reports/summary', async () => {
    await delay();
    return HttpResponse.json(ok(buildReportsSummary()));
  }),

  http.get('/api/reports/export', async ({ request }) => {
    await delay();
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'users';
    const format = url.searchParams.get('format') || 'csv';
    const filename = `${type}-report.${format}`;

    if (format === 'pdf') {
      const pdf = buildStubPdf(`${type.toUpperCase()} report`);
      return new HttpResponse(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    const csv = buildReportCsv(type);
    return new HttpResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }),

  // ---- Notifications ----------------------------------------------------
  http.get('/api/notifications', async ({ request }) => {
    await delay();
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 10);

    const mine = mockNotifications
      .filter((n) => n.userId === mockCurrentUser._id)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const start = (page - 1) * limit;

    return HttpResponse.json(
      ok({
        total: mine.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(mine.length / limit)),
        data: mine.slice(start, start + limit),
        unreadCount: mine.filter((n) => !n.isRead).length,
      }),
    );
  }),

  http.patch('/api/notifications/:id/read', async ({ params }) => {
    await delay();
    const idx = mockNotifications.findIndex((n) => n._id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    mockNotifications[idx] = { ...mockNotifications[idx], isRead: true };
    return HttpResponse.json(ok(mockNotifications[idx], 'Notification read'));
  }),

  http.post('/api/notifications/read-all', async () => {
    await delay();
    let updated = 0;
    mockNotifications.forEach((n, i) => {
      if (n.userId === mockCurrentUser._id && !n.isRead) {
        mockNotifications[i] = { ...n, isRead: true };
        updated += 1;
      }
    });
    return HttpResponse.json(ok({ updated }, 'All notifications marked as read'));
  }),

  // ---- Settings: Workflow ----------------------------------------------
  http.get('/api/settings/workflow', async () => {
    await delay();
    return HttpResponse.json(ok(mockWorkflowSettings));
  }),

  http.put('/api/settings/workflow', async ({ request }) => {
    await delay();
    const body = (await request.json()) as WorkflowSettings;
    mockWorkflowSettings.statuses = body.statuses;
    mockWorkflowSettings.approvalLevels = body.approvalLevels;
    return HttpResponse.json(ok(mockWorkflowSettings, 'Workflow settings saved'));
  }),

  // ---- Settings: Security ----------------------------------------------
  http.get('/api/settings/security', async () => {
    await delay();
    return HttpResponse.json(ok(mockSecuritySettings));
  }),

  http.put('/api/settings/security', async ({ request }) => {
    await delay();
    const body = (await request.json()) as SecuritySettings;
    mockSecuritySettings.password = body.password;
    mockSecuritySettings.sessionTimeoutMinutes = body.sessionTimeoutMinutes;
    mockSecuritySettings.lockout = body.lockout;
    return HttpResponse.json(ok(mockSecuritySettings, 'Security settings saved'));
  }),

  // ---- Settings: Branding ----------------------------------------------
  http.get('/api/settings/branding', async () => {
    await delay();
    return HttpResponse.json(ok(mockBrandingSettings));
  }),

  http.put('/api/settings/branding', async ({ request }) => {
    await delay();
    const body = (await request.json()) as BrandingSettings;
    mockBrandingSettings.appName = body.appName;
    mockBrandingSettings.logoUrl = body.logoUrl;
    mockBrandingSettings.primaryColor = body.primaryColor;
    return HttpResponse.json(ok(mockBrandingSettings, 'Branding settings saved'));
  }),

  // ---- Records ----------------------------------------------------------
  http.get('/api/records', async ({ request }) => {
    await delay();
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const ownerId = url.searchParams.get('ownerId');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    let source = mockRecords;
    if (status) source = source.filter((r) => r.status === status);
    if (ownerId) source = source.filter((r) => r.ownerId === ownerId);
    if (dateFrom) source = source.filter((r) => r.createdAt >= dateFrom);
    if (dateTo)
      // Inclusive of the whole "to" day.
      source = source.filter((r) => r.createdAt <= `${dateTo}T23:59:59.999Z`);

    const result = paginate(
      source,
      url,
      (r, k) =>
        r.title.toLowerCase().includes(k) ||
        r.ownerName.toLowerCase().includes(k),
    );
    return HttpResponse.json(ok(result));
  }),

  http.get('/api/records/:id', async ({ params }) => {
    await delay();
    const record = mockRecords.find((r) => r._id === params.id);
    if (!record) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    return HttpResponse.json(ok(record));
  }),

  http.post('/api/records', async ({ request }) => {
    await delay();
    const body = (await request.json()) as RecordFormRequest;
    const defaultStatus = mockWorkflowSettings.statuses[0]?.key ?? 'draft';
    const record: RecordItem = {
      _id: genId('rec'),
      title: body.title,
      description: body.description,
      status: body.status || defaultStatus,
      ownerId: mockCurrentUser._id,
      ownerName: `${mockCurrentUser.firstName} ${mockCurrentUser.lastName}`,
      currentApprovalLevel: 0,
      attachments: [],
      isArchived: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    mockRecords.unshift(record);
    return HttpResponse.json(ok(record, 'Record created'), { status: 201 });
  }),

  http.put('/api/records/:id', async ({ params, request }) => {
    await delay();
    const body = (await request.json()) as Partial<RecordFormRequest>;
    const idx = mockRecords.findIndex((r) => r._id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    mockRecords[idx] = { ...mockRecords[idx], ...body, updatedAt: nowIso() };
    return HttpResponse.json(ok(mockRecords[idx], 'Record updated'));
  }),

  http.patch('/api/records/:id/archive', async ({ params, request }) => {
    await delay();
    const body = (await request.json()) as ArchiveRecordRequest;
    const idx = mockRecords.findIndex((r) => r._id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    mockRecords[idx] = {
      ...mockRecords[idx],
      isArchived: body.isArchived,
      // Archiving parks the record in the "archived" status; restoring returns
      // it to Draft (the pre-submission state) since prior status isn't tracked.
      status: body.isArchived ? 'archived' : 'draft',
      updatedAt: nowIso(),
    };
    return HttpResponse.json(
      ok(mockRecords[idx], body.isArchived ? 'Record archived' : 'Record restored'),
    );
  }),

  http.get('/api/records/:id/history', async ({ params }) => {
    await delay();
    const history = mockApprovalActions
      .filter((a) => a.recordId === params.id)
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    return HttpResponse.json(ok(history));
  }),

  // ---- Approvals --------------------------------------------------------
  http.get('/api/approvals', async ({ request }) => {
    await delay();
    const url = new URL(request.url);
    const tab = url.searchParams.get('tab') || 'pending';
    const scope = url.searchParams.get('scope') || 'all';

    let source: RecordItem[];
    if (tab === 'approved') {
      source = mockRecords.filter((r) => r.status === 'approved');
    } else if (tab === 'rejected') {
      source = mockRecords.filter((r) => r.status === 'rejected');
    } else {
      // Pending queue.
      source = mockRecords.filter((r) => r.status === 'pending' && !r.isArchived);
      if (scope === 'mine') {
        // Records the signed-in user can act on: their roles overlap the
        // approver roles of the record's current level.
        source = source.filter((r) => {
          const level = mockWorkflowSettings.approvalLevels.find(
            (l) => l.level === r.currentApprovalLevel,
          );
          return level
            ? level.approverRoleIds.some((rid) =>
                mockCurrentUser.roleIds.includes(rid),
              )
            : false;
        });
      }
    }

    const result = paginate(
      source,
      url,
      (r, k) =>
        r.title.toLowerCase().includes(k) ||
        r.ownerName.toLowerCase().includes(k),
    );
    return HttpResponse.json(ok(result));
  }),

  http.post('/api/records/:id/approve', async ({ params, request }) => {
    await delay();
    const body = (await request.json().catch(() => ({}))) as ApproveRecordRequest;
    const idx = mockRecords.findIndex((r) => r._id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });

    const record = mockRecords[idx];
    const beforeStatus = record.status;
    const level = record.currentApprovalLevel;
    const isFinalLevel = level >= mockWorkflowSettings.approvalLevels.length - 1;

    const updated: RecordItem = {
      ...record,
      status: isFinalLevel ? 'approved' : 'pending',
      currentApprovalLevel: isFinalLevel ? level : level + 1,
      updatedAt: nowIso(),
    };
    mockRecords[idx] = updated;

    appendApprovalAction({
      recordId: record._id,
      actorId: mockCurrentUser._id,
      actorName: currentActorName(),
      level,
      action: 'approve',
      remarks: body.remarks ?? '',
    });
    emitAudit({
      actorId: mockCurrentUser._id,
      actorName: currentActorName(),
      action: 'record.approve',
      entity: 'Record',
      entityId: record._id,
      before: { status: beforeStatus },
      after: { status: updated.status },
    });
    emitNotification({
      userId: record.ownerId,
      title: isFinalLevel ? 'Record approved' : 'Record advanced',
      body: isFinalLevel
        ? `“${record.title}” was fully approved.`
        : `“${record.title}” advanced to the next approval level.`,
      type: isFinalLevel ? 'record.approved' : 'approval.advanced',
      link: `/records`,
    });

    return HttpResponse.json(
      ok(updated, isFinalLevel ? 'Record approved' : 'Approval recorded'),
    );
  }),

  http.post('/api/records/:id/reject', async ({ params, request }) => {
    await delay();
    const body = (await request.json()) as RejectRecordRequest;
    if (!body.remarks || !body.remarks.trim())
      return HttpResponse.json(
        { message: 'Remarks are required to reject a record' },
        { status: 400 },
      );

    const idx = mockRecords.findIndex((r) => r._id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });

    const record = mockRecords[idx];
    const beforeStatus = record.status;
    const updated: RecordItem = {
      ...record,
      status: 'rejected',
      updatedAt: nowIso(),
    };
    mockRecords[idx] = updated;

    appendApprovalAction({
      recordId: record._id,
      actorId: mockCurrentUser._id,
      actorName: currentActorName(),
      level: record.currentApprovalLevel,
      action: 'reject',
      remarks: body.remarks,
    });
    emitAudit({
      actorId: mockCurrentUser._id,
      actorName: currentActorName(),
      action: 'record.reject',
      entity: 'Record',
      entityId: record._id,
      before: { status: beforeStatus },
      after: { status: 'rejected' },
    });
    emitNotification({
      userId: record.ownerId,
      title: 'Record rejected',
      body: `“${record.title}” was rejected.`,
      type: 'record.rejected',
      link: `/records`,
    });

    return HttpResponse.json(ok(updated, 'Record rejected'));
  }),

];
