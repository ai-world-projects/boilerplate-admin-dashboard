'use client';

import { useMemo, useState } from 'react';
import {
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import type { GridColDef } from '@mui/x-data-grid';
import { AVXPageHeader } from '@/components/AVXPageHeader';
import { AVXSearchField } from '@/components/AVXSearchField';
import { AVXDataTable } from '@/components/AVXDataTable';
import { AVXConfirmDialog } from '@/components/AVXConfirmDialog';
import { PermissionGate } from '@/auth';
import type { RecordItem } from '@/api/interfaces/Record';
import { useRecords, useRecordMutations } from '@/features/records/useRecords';
import RecordFormDrawer from '@/features/records/RecordFormDrawer';
import RecordDetailDrawer from '@/features/records/RecordDetailDrawer';
import WorkflowStatusChip from '@/features/settings/WorkflowStatusChip';
import { useWorkflowSettings } from '@/features/settings/useWorkflowSettings';
import { useUsers } from '@/features/users/useUsers';
import { formatDate } from '@/utils/formatDate';

export default function RecordsPage() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewing, setViewing] = useState<RecordItem | null>(null);
  const [toArchive, setToArchive] = useState<RecordItem | null>(null);

  const { data, isFetching } = useRecords({
    keyword,
    status: status || undefined,
    ownerId: ownerId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });
  const { archive } = useRecordMutations();
  const { data: workflow } = useWorkflowSettings();
  const { data: usersPage } = useUsers({ limit: 100 });

  const owners = usersPage?.data ?? [];
  const resetPage = () => setPaginationModel((p) => ({ ...p, page: 0 }));

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  const openEdit = (record: RecordItem) => {
    setEditing(record);
    setDrawerOpen(true);
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'title', headerName: 'Title', flex: 1.4, minWidth: 200 },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        renderCell: (params) => (
          <WorkflowStatusChip statusKey={params.value as string} />
        ),
      },
      { field: 'ownerName', headerName: 'Owner', flex: 1, minWidth: 150 },
      {
        field: 'updatedAt',
        headerName: 'Updated',
        width: 130,
        valueFormatter: (value: string) => formatDate(value),
      },
      {
        field: 'actions',
        headerName: '',
        width: 150,
        sortable: false,
        renderCell: (params) => {
          const record = params.row as RecordItem;
          return (
            <Stack direction="row">
              <Tooltip title="View details">
                <IconButton size="small" onClick={() => setViewing(record)}>
                  <VisibilityOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <PermissionGate permission="records:update">
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => openEdit(record)}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </PermissionGate>
              <PermissionGate permission="records:archive">
                {record.isArchived ? (
                  <Tooltip title="Restore">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() =>
                        archive.mutate({ id: record._id, isArchived: false })
                      }
                    >
                      <UnarchiveOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Archive">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setToArchive(record)}
                    >
                      <ArchiveOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </PermissionGate>
            </Stack>
          );
        },
      },
    ],
    // archive mutation identity is stable; columns don't depend on other state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <AVXPageHeader
        title="Records"
        subtitle="Create, review and archive records across the workflow"
        action={
          <PermissionGate permission="records:create">
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Create record
            </Button>
          </PermissionGate>
        }
      />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ mb: 2, flexWrap: 'wrap' }}
      >
        <AVXSearchField
          placeholder="Search by title or owner…"
          onDebouncedChange={(v) => {
            setKeyword(v);
            resetPage();
          }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            resetPage();
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {(workflow?.statuses ?? []).map((s) => (
            <MenuItem key={s.key} value={s.key}>
              {s.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Owner"
          value={ownerId}
          onChange={(e) => {
            setOwnerId(e.target.value);
            resetPage();
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All owners</MenuItem>
          {owners.map((u) => (
            <MenuItem key={u._id} value={u._id}>
              {u.firstName} {u.lastName}
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
      </Stack>

      <AVXDataTable<RecordItem>
        rows={data?.data ?? []}
        columns={columns}
        loading={isFetching}
        rowCount={data?.total ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />

      <RecordFormDrawer
        open={drawerOpen}
        record={editing}
        onClose={() => setDrawerOpen(false)}
      />

      <RecordDetailDrawer
        open={Boolean(viewing)}
        record={viewing}
        onClose={() => setViewing(null)}
      />

      <AVXConfirmDialog
        open={Boolean(toArchive)}
        title="Archive record"
        message={
          <>
            Archive <strong>{toArchive?.title}</strong>? Archived records are hidden
            from active workflows but can be restored later.
          </>
        }
        confirmLabel="Archive"
        loading={archive.isPending}
        onCancel={() => setToArchive(null)}
        onConfirm={async () => {
          if (toArchive)
            await archive.mutateAsync({ id: toArchive._id, isArchived: true });
          setToArchive(null);
        }}
      />
    </>
  );
}
