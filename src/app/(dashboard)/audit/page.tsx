'use client';

import { useMemo, useState } from 'react';
import {
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { AVXPageHeader } from '@/components/AVXPageHeader';
import { AVXSearchField } from '@/components/AVXSearchField';
import { AVXDataTable } from '@/components/AVXDataTable';
import type { AuditEntry } from '@/api/interfaces/Audit';
import {
  useAudit,
  AUDIT_ACTIONS,
  AUDIT_ENTITIES,
} from '@/features/audit/useAudit';
import { useUsers } from '@/features/users/useUsers';
import { formatDateTime } from '@/utils/formatDate';

export default function AuditPage() {
  const [keyword, setKeyword] = useState('');
  const [actorId, setActorId] = useState('');
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [adminOnly, setAdminOnly] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const { data, isFetching } = useAudit({
    keyword,
    actorId: actorId || undefined,
    action: action || undefined,
    entity: entity || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    adminOnly: adminOnly || undefined,
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });
  const { data: usersPage } = useUsers({ limit: 100 });
  const actors = usersPage?.data ?? [];

  const resetPage = () => setPaginationModel((p) => ({ ...p, page: 0 }));

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'createdAt',
        headerName: 'When',
        width: 190,
        valueFormatter: (value: string) => formatDateTime(value),
      },
      { field: 'actorName', headerName: 'Actor', flex: 1, minWidth: 150 },
      {
        field: 'action',
        headerName: 'Action',
        width: 160,
        renderCell: (params) => (
          <Chip label={params.value as string} size="small" variant="outlined" />
        ),
      },
      { field: 'entity', headerName: 'Entity', width: 110 },
      { field: 'entityId', headerName: 'Entity ID', flex: 1, minWidth: 120 },
      { field: 'ip', headerName: 'IP', width: 130 },
    ],
    [],
  );

  return (
    <>
      <AVXPageHeader
        title="Audit Log"
        subtitle="Immutable record of who did what, and when"
      />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ mb: 2, flexWrap: 'wrap', alignItems: { md: 'center' } }}
      >
        <AVXSearchField
          placeholder="Search actor, action or entity…"
          onDebouncedChange={(v) => {
            setKeyword(v);
            resetPage();
          }}
        />
        <TextField
          select
          size="small"
          label="Actor"
          value={actorId}
          onChange={(e) => {
            setActorId(e.target.value);
            resetPage();
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All actors</MenuItem>
          {actors.map((u) => (
            <MenuItem key={u._id} value={u._id}>
              {u.firstName} {u.lastName}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Action"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            resetPage();
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All actions</MenuItem>
          {AUDIT_ACTIONS.map((a) => (
            <MenuItem key={a} value={a}>
              {a}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Entity"
          value={entity}
          onChange={(e) => {
            setEntity(e.target.value);
            resetPage();
          }}
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="">All entities</MenuItem>
          {AUDIT_ENTITIES.map((en) => (
            <MenuItem key={en} value={en}>
              {en}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          type="date"
          size="small"
          label="From"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            resetPage();
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          type="date"
          size="small"
          label="To"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            resetPage();
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 150 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={adminOnly}
              onChange={(e) => {
                setAdminOnly(e.target.checked);
                resetPage();
              }}
            />
          }
          label="Admin activity"
        />
      </Stack>

      <AVXDataTable<AuditEntry>
        rows={data?.data ?? []}
        columns={columns}
        loading={isFetching}
        rowCount={data?.total ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />
    </>
  );
}
