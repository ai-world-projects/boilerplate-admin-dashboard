'use client';

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AVXPageHeader } from '@/components/AVXPageHeader';
import { AVXStatCard } from '@/components/AVXStatCard';
import { formatDate } from '@/utils/formatDate';
import { useDashboard } from '@/features/dashboard/useDashboard';

const cardIcons: Record<string, React.ReactNode> = {
  users: <PeopleAltOutlinedIcon />,
  active: <BoltOutlinedIcon />,
  pending: <PendingActionsOutlinedIcon />,
  enrollments: <HowToRegOutlinedIcon />,
};

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AVXPageHeader title="Dashboard" subtitle="Overview of your platform" />

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
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 2.5,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Enrollment trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.enrollmentTrend}>
                  <defs>
                    <linearGradient id="enroll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2e7ddb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2e7ddb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={32} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#2e7ddb"
                    strokeWidth={2}
                    fill="url(#enroll)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Users by role
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.usersByRole}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="role" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={32} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#192a56" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Recent users */}
      <Card>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Recent users
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.recentUsers.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.fullName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{u.role}</TableCell>
                  <TableCell>{formatDate(u.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
