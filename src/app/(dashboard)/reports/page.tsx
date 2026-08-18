'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { AVXPageHeader } from '@/components/AVXPageHeader';
import { AVXStatCard } from '@/components/AVXStatCard';
import { PermissionGate } from '@/auth';
import type { ReportType } from '@/api/interfaces/Reports';
import {
  useReportsSummary,
  useExportReport,
} from '@/features/reports/useReports';

function ExportButtons({
  type,
  disabled,
  onExport,
}: {
  type: ReportType;
  disabled: boolean;
  onExport: (type: ReportType, format: 'csv' | 'pdf') => void;
}) {
  return (
    <PermissionGate permission="reports:export">
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DescriptionOutlinedIcon />}
          disabled={disabled}
          onClick={() => onExport(type, 'csv')}
        >
          CSV
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<PictureAsPdfOutlinedIcon />}
          disabled={disabled}
          onClick={() => onExport(type, 'pdf')}
        >
          PDF
        </Button>
      </Stack>
    </PermissionGate>
  );
}

function SectionHeader({
  title,
  type,
  disabled,
  onExport,
}: {
  title: string;
  type: ReportType;
  disabled: boolean;
  onExport: (type: ReportType, format: 'csv' | 'pdf') => void;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1.5,
        mb: 2,
      }}
    >
      <Typography variant="h4">{title}</Typography>
      <ExportButtons type={type} disabled={disabled} onExport={onExport} />
    </Box>
  );
}

export default function ReportsPage() {
  const { data, isLoading, isError } = useReportsSummary();
  const exportReport = useExportReport();

  const onExport = (type: ReportType, format: 'csv' | 'pdf') =>
    exportReport.mutate({ type, format });
  const exporting = exportReport.isPending;

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <>
        <AVXPageHeader title="Reports" subtitle="Summaries and exports" />
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              Couldn&apos;t load the reports. Please try again.
            </Typography>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <AVXPageHeader
        title="Reports"
        subtitle="Summaries across users, records and approvals — export to CSV or PDF"
      />

      <Stack spacing={2.5}>
        {/* Users */}
        <Card>
          <CardContent>
            <SectionHeader title="Users" type="users" disabled={exporting} onExport={onExport} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: 2,
              }}
            >
              <AVXStatCard title="Total" value={data.users.total} />
              <AVXStatCard title="Active" value={data.users.active} />
              <AVXStatCard title="Inactive" value={data.users.inactive} />
              <AVXStatCard title="Pending" value={data.users.pending} />
            </Box>
          </CardContent>
        </Card>

        {/* Records by status */}
        <Card>
          <CardContent>
            <SectionHeader
              title="Records by status"
              type="records"
              disabled={exporting}
              onExport={onExport}
            />
            <Stack spacing={1.25}>
              {data.recordsByStatus.map((s) => (
                <Box
                  key={s.status}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: s.color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {s.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {s.count}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Approval turnaround */}
        <Card>
          <CardContent>
            <SectionHeader
              title="Approval turnaround"
              type="approvals"
              disabled={exporting}
              onExport={onExport}
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              <AVXStatCard
                title="Avg. turnaround (hours)"
                value={data.approvalTurnaround.averageHours}
              />
              <AVXStatCard title="Approved" value={data.approvalTurnaround.approvedCount} />
              <AVXStatCard title="Rejected" value={data.approvalTurnaround.rejectedCount} />
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </>
  );
}
