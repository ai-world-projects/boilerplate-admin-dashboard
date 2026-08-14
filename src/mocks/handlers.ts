import { http, HttpResponse } from 'msw';
import { Paginated, StandardResponse } from '@/api/interfaces/Common';
import {
  AssignRolesRequest,
  UpdateUserStatusRequest,
  User,
  UserFormRequest,
} from '@/api/interfaces/User';
import { Role, RoleFormRequest } from '@/api/interfaces/Rbac';
import { Subject, SubjectFormRequest } from '@/api/interfaces/Subject';
import {
  mockCurrentUser,
  mockDashboard,
  mockRoles,
  mockSubjects,
  mockUsers,
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

  // ---- Dashboard --------------------------------------------------------
  http.get('/api/dashboard', async () => {
    await delay();
    return HttpResponse.json(ok(mockDashboard));
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

  // ---- Subjects ---------------------------------------------------------
  http.get('/api/subjects', async ({ request }) => {
    await delay();
    const url = new URL(request.url);
    const result = paginate(
      mockSubjects,
      url,
      (s, k) =>
        s.name.toLowerCase().includes(k) || s.code.toLowerCase().includes(k),
    );
    return HttpResponse.json(ok(result));
  }),

  http.post('/api/subjects', async ({ request }) => {
    await delay();
    const body = (await request.json()) as SubjectFormRequest;
    const subject: Subject = {
      _id: genId('s'),
      ...body,
      enrolledCount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    mockSubjects.unshift(subject);
    return HttpResponse.json(ok(subject, 'Subject created'), { status: 201 });
  }),

  http.put('/api/subjects/:id', async ({ params, request }) => {
    await delay();
    const body = (await request.json()) as Partial<SubjectFormRequest>;
    const idx = mockSubjects.findIndex((s) => s._id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    mockSubjects[idx] = { ...mockSubjects[idx], ...body, updatedAt: nowIso() };
    return HttpResponse.json(ok(mockSubjects[idx], 'Subject updated'));
  }),

  http.delete('/api/subjects/:id', async ({ params }) => {
    await delay();
    const idx = mockSubjects.findIndex((s) => s._id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    mockSubjects.splice(idx, 1);
    return HttpResponse.json(ok({ acknowledged: true, deletedCount: 1 }, 'Subject deleted'));
  }),
];
