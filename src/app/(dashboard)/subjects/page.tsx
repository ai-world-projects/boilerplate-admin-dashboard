'use client';

import { useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import type { GridColDef } from '@mui/x-data-grid';
import { AVXPageHeader } from '@/components/AVXPageHeader';
import { AVXSearchField } from '@/components/AVXSearchField';
import { AVXDataTable } from '@/components/AVXDataTable';
import { AVXConfirmDialog } from '@/components/AVXConfirmDialog';
import type { Subject } from '@/api/interfaces/Subject';
import { useSubjects, useSubjectMutations } from '@/features/subjects/useSubjects';
import SubjectFormDrawer from '@/features/subjects/SubjectFormDrawer';

export default function SubjectsPage() {
  const [keyword, setKeyword] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [editing, setEditing] = useState<Subject | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Subject | null>(null);

  const { data, isFetching } = useSubjects({
    keyword,
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });
  const { remove } = useSubjectMutations();

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  const openEdit = (subject: Subject) => {
    setEditing(subject);
    setDrawerOpen(true);
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'name', headerName: 'Subject', flex: 1.4, minWidth: 200 },
      { field: 'code', headerName: 'Code', width: 120 },
      { field: 'instructor', headerName: 'Instructor', flex: 1, minWidth: 160 },
      { field: 'enrolledCount', headerName: 'Enrolled', width: 110, type: 'number' },
      {
        field: 'isPublished',
        headerName: 'Status',
        width: 130,
        renderCell: (params) => (
          <Chip
            label={params.value ? 'Published' : 'Draft'}
            size="small"
            color={params.value ? 'success' : 'default'}
            variant={params.value ? 'filled' : 'outlined'}
          />
        ),
      },
      {
        field: 'actions',
        headerName: '',
        width: 100,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row">
            <IconButton size="small" onClick={() => openEdit(params.row)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => setToDelete(params.row)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <AVXPageHeader
        title="Subjects"
        subtitle="Manage courses and their content"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Create subject
          </Button>
        }
      />

      <Box sx={{ mb: 2 }}>
        <AVXSearchField
          placeholder="Search by name or code…"
          onDebouncedChange={(v) => {
            setKeyword(v);
            setPaginationModel((p) => ({ ...p, page: 0 }));
          }}
        />
      </Box>

      <AVXDataTable<Subject>
        rows={data?.data ?? []}
        columns={columns}
        loading={isFetching}
        rowCount={data?.total ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />

      <SubjectFormDrawer
        open={drawerOpen}
        subject={editing}
        onClose={() => setDrawerOpen(false)}
      />

      <AVXConfirmDialog
        open={Boolean(toDelete)}
        title="Delete subject"
        message={
          <>
            Delete <strong>{toDelete?.name}</strong>? This action cannot be undone.
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
