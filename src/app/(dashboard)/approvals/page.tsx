'use client';

import { useMemo, useState } from 'react';
import {
  IconButton,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/CancelOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import type { GridColDef } from '@mui/x-data-grid';
import { AVXPageHeader } from '@/components/AVXPageHeader';
import { AVXSearchField } from '@/components/AVXSearchField';
import { AVXDataTable } from '@/components/AVXDataTable';
import { useAuth } from '@/auth';
import type { RecordItem } from '@/api/interfaces/Record';
import type { ApprovalScope, ApprovalTab } from '@/api/services/approvals';
import {
  useApprovals,
  useApprovalMutations,
} from '@/features/approvals/useApprovals';
import ApprovalDecisionDialog, {
  type ApprovalDecision,
} from '@/features/approvals/ApprovalDecisionDialog';
import RecordDetailDrawer from '@/features/records/RecordDetailDrawer';
import WorkflowStatusChip from '@/features/settings/WorkflowStatusChip';
import { formatDate } from '@/utils/formatDate';

export default function ApprovalsPage() {
  const { hasPermission } = useAuth();
  const [tab, setTab] = useState<ApprovalTab>('pending');
  const [scope, setScope] = useState<ApprovalScope>('all');
  const [keyword, setKeyword] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [viewing, setViewing] = useState<RecordItem | null>(null);
  const [decision, setDecision] = useState<{
    mode: ApprovalDecision;
    record: RecordItem;
  } | null>(null);

  const { data, isFetching } = useApprovals({
    tab,
    scope: tab === 'pending' ? scope : undefined,
    keyword,
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });
  const { approve, reject } = useApprovalMutations();

  const canApprove = hasPermission('approvals:approve');
  const canReject = hasPermission('approvals:reject');
  const resetPage = () => setPaginationModel((p) => ({ ...p, page: 0 }));

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
        field: 'currentApprovalLevel',
        headerName: 'Level',
        width: 90,
        valueFormatter: (value: number) => `L${value + 1}`,
      },
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
          const isPending = record.status === 'pending';
          return (
            <Stack direction="row">
              <Tooltip title="View details">
                <IconButton size="small" onClick={() => setViewing(record)}>
                  <VisibilityOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {isPending && canApprove && (
                <Tooltip title="Approve">
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => setDecision({ mode: 'approve', record })}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {isPending && canReject && (
                <Tooltip title="Reject">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDecision({ mode: 'reject', record })}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          );
        },
      },
    ],
    [canApprove, canReject],
  );

  const loading = approve.isPending || reject.isPending;

  const onConfirmDecision = async (remarks: string) => {
    if (!decision) return;
    if (decision.mode === 'approve') {
      await approve.mutateAsync({ id: decision.record._id, remarks });
    } else {
      await reject.mutateAsync({ id: decision.record._id, remarks });
    }
    setDecision(null);
  };

  return (
    <>
      <AVXPageHeader
        title="Approvals"
        subtitle="Review records awaiting a decision"
      />

      <Tabs
        value={tab}
        onChange={(_e, v: ApprovalTab) => {
          setTab(v);
          resetPage();
        }}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Pending" value="pending" />
        <Tab label="Approved" value="approved" />
        <Tab label="Rejected" value="rejected" />
      </Tabs>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ mb: 2, alignItems: { sm: 'center' } }}
      >
        <AVXSearchField
          placeholder="Search by title or owner…"
          onDebouncedChange={(v) => {
            setKeyword(v);
            resetPage();
          }}
        />
        {tab === 'pending' && (
          <ToggleButtonGroup
            size="small"
            exclusive
            value={scope}
            onChange={(_e, v: ApprovalScope | null) => {
              if (v) {
                setScope(v);
                resetPage();
              }
            }}
          >
            <ToggleButton value="mine">Mine</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>
        )}
      </Stack>

      <AVXDataTable<RecordItem>
        rows={data?.data ?? []}
        columns={columns}
        loading={isFetching}
        rowCount={data?.total ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />

      <RecordDetailDrawer
        open={Boolean(viewing)}
        record={viewing}
        onClose={() => setViewing(null)}
      />

      <ApprovalDecisionDialog
        open={Boolean(decision)}
        mode={decision?.mode ?? 'approve'}
        record={decision?.record ?? null}
        loading={loading}
        onCancel={() => setDecision(null)}
        onConfirm={onConfirmDecision}
      />
    </>
  );
}
