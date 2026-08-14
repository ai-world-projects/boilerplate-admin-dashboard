'use client';

import { useMemo, useState } from 'react';
import {
  Button,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ToggleOnIcon from '@mui/icons-material/ToggleOnOutlined';
import ToggleOffIcon from '@mui/icons-material/ToggleOffOutlined';
import type { GridColDef } from '@mui/x-data-grid';
import { AVXPageHeader } from '@/components/AVXPageHeader';
import { AVXSearchField } from '@/components/AVXSearchField';
import { AVXDataTable } from '@/components/AVXDataTable';
import { AVXConfirmDialog } from '@/components/AVXConfirmDialog';
import { PermissionGate } from '@/auth';
import type { User, UserStatus } from '@/api/interfaces/User';
import { useUsers, useUserMutations } from '@/features/users/useUsers';
import { useRoles } from '@/features/roles/useRoles';
import UserFormDrawer from '@/features/users/UserFormDrawer';
import { formatDate } from '@/utils/formatDate';
import { getRoleColor } from '@/utils/roleColor';

const statusChip: Record<UserStatus, { color: 'success' | 'warning' | 'default'; variant: 'filled' | 'outlined' }> = {
  active: { color: 'success', variant: 'filled' },
  pending: { color: 'warning', variant: 'filled' },
  inactive: { color: 'default', variant: 'outlined' },
};

export default function UsersPage() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [editing, setEditing] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toDelete, setToDelete] = useState<User | null>(null);

  const { data, isFetching } = useUsers({
    keyword,
    status: status || undefined,
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });
  const { remove, setStatus: setUserStatus } = useUserMutations();
  const { data: roles = [] } = useRoles();

  const roleName = (id: string) => roles.find((r) => r._id === id)?.name ?? id;

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  const openEdit = (user: User) => {
    setEditing(user);
    setDrawerOpen(true);
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        minWidth: 170,
        valueGetter: (_v, row: User) => `${row.firstName} ${row.lastName}`,
      },
      { field: 'email', headerName: 'Email', flex: 1.3, minWidth: 210 },
      {
        field: 'roleIds',
        headerName: 'Roles',
        flex: 1,
        minWidth: 180,
        sortable: false,
        renderCell: (params) => {
          const ids = params.value as string[];
          const names = ids.map(roleName);
          const shown = ids.slice(0, 2);
          const extra = ids.length - shown.length;
          return (
            <Tooltip title={extra > 0 ? names.join(', ') : ''}>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}
              >
                {shown.map((id) => {
                  const c = getRoleColor(id);
                  return (
                    <Chip
                      key={id}
                      label={roleName(id)}
                      size="small"
                      sx={{ bgcolor: c.bg, color: c.fg, fontWeight: 600, border: 'none' }}
                    />
                  );
                })}
                {extra > 0 && (
                  <Chip label={`+${extra}`} size="small" variant="outlined" />
                )}
              </Stack>
            </Tooltip>
          );
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => {
          const s = params.value as UserStatus;
          return (
            <Chip
              label={s}
              size="small"
              color={statusChip[s].color}
              variant={statusChip[s].variant}
              sx={{ textTransform: 'capitalize' }}
            />
          );
        },
      },
      {
        field: 'lastLoginAt',
        headerName: 'Last login',
        width: 130,
        valueFormatter: (value: string | null) => (value ? formatDate(value) : 'Never'),
      },
      {
        field: 'actions',
        headerName: '',
        width: 130,
        sortable: false,
        renderCell: (params) => {
          const user = params.row as User;
          const isActive = user.status === 'active';
          return (
            <Stack direction="row">
              <PermissionGate permission="users:update">
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => openEdit(user)}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isActive ? 'Deactivate' : 'Activate'}>
                  <IconButton
                    size="small"
                    color={isActive ? 'success' : 'default'}
                    onClick={() =>
                      setUserStatus.mutate({
                        id: user._id,
                        status: isActive ? 'inactive' : 'active',
                      })
                    }
                  >
                    {isActive ? (
                      <ToggleOnIcon fontSize="small" />
                    ) : (
                      <ToggleOffIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </PermissionGate>
              <PermissionGate permission="users:delete">
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => setToDelete(user)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </PermissionGate>
            </Stack>
          );
        },
      },
    ],
    // roleName depends on roles; re-render columns when roles load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roles],
  );

  return (
    <>
      <AVXPageHeader
        title="Users"
        subtitle="Manage platform members, roles and access"
        action={
          <PermissionGate permission="users:create">
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Create user
            </Button>
          </PermissionGate>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <AVXSearchField
          placeholder="Search by name or email…"
          onDebouncedChange={(v) => {
            setKeyword(v);
            setPaginationModel((p) => ({ ...p, page: 0 }));
          }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => {
            alert("A")
            setStatus(e.target.value as UserStatus | '');
            setPaginationModel((p) => ({ ...p, page: 0 }));
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </Stack>

      <AVXDataTable<User>
        rows={data?.data ?? []}
        columns={columns}
        loading={isFetching}
        rowCount={data?.total ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />

      <UserFormDrawer
        open={drawerOpen}
        user={editing}
        onClose={() => setDrawerOpen(false)}
      />

      <AVXConfirmDialog
        open={Boolean(toDelete)}
        title="Delete user"
        message={
          <>
            Delete <strong>{toDelete?.firstName} {toDelete?.lastName}</strong>? This
            action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await remove.mutateAsync(toDelete._id);
          setToDelete(null);
        }}
      />
    </>
  );
}
