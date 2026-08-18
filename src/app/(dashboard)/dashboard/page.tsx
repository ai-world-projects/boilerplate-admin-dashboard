'use client';

import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AVXPageHeader } from '@/components/AVXPageHeader';
import { AVXStatCard } from '@/components/AVXStatCard';
import { PermissionGate, useAuth } from '@/auth';
import { useDashboard } from '@/features/dashboard/useDashboard';
import DashboardActivityFeed from '@/features/dashboard/DashboardActivityFeed';

const cardIcons: Record<string, React.ReactNode> = {
  users: <PeopleAltOutlinedIcon />,
  active: <BoltOutlinedIcon />,
  pending: <PendingActionsOutlinedIcon />,
  records: <DescriptionOutlinedIcon />,
};

const APPROVED_COLOR = '#2ea043';
const REJECTED_COLOR = '#d32f2f';

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const { hasPermission } = useAuth();
  const canReadAudit = hasPermission('audit:read');

  if (isLoading || !data) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AVXPageHeader
        title="Dashboard"
        subtitle="Overview of your platform"
        action={
          <PermissionGate permission="approvals:read">
            <Button
              component={Link}
              href="/approvals"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
            >
              Review approvals
            </Button>
          </PermissionGate>
        }
      />

      {/* KPI cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2.5,
          mb: 3,
        }}
      >
        {data.cardStats.map((stat) => (
          <AVXStatCard
            key={stat.type}
            title={stat.title}
            value={stat.count}
            changePct={stat.changePct}
            icon={cardIcons[stat.type]}
          />
        ))}
      </Box>

      {/* Charts */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2.5,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Records by status
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.recordsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.recordsByStatus.map((slice) => (
                      <Cell key={slice.status} fill={slice.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Approvals throughput
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.approvalsThroughput}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="approved" name="Approved" fill={APPROVED_COLOR} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="rejected" name="Rejected" fill={REJECTED_COLOR} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Recent activity — reads the latest audit entries (blueprint §2.1). */}
      <Card>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Recent activity
          </Typography>
          {canReadAudit ? (
            <DashboardActivityFeed />
          ) : (
            <Box
              sx={{
                py: 4,
                display: 'grid',
                placeItems: 'center',
                textAlign: 'center',
                gap: 1,
                color: 'text.secondary',
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
              <Typography variant="body2">
                You don&apos;t have access to the activity log.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </>
  );
}
