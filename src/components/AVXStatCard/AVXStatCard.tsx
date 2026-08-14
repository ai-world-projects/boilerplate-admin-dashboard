'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export interface AVXStatCardProps {
  title: string;
  value: string | number;
  /** Period-over-period change; positive renders green, negative red. */
  changePct?: number;
  icon?: React.ReactNode;
}

/** KPI card for the dashboard: value, label, and a trend indicator. */
export default function AVXStatCard({
  title,
  value,
  changePct,
  icon,
}: AVXStatCardProps) {
  const isUp = (changePct ?? 0) >= 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent
        sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}
      >
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h2" sx={{ mt: 1 }}>
            {value}
          </Typography>
          {changePct !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              {isUp ? (
                <ArrowUpwardIcon sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: 16, color: 'error.main' }} />
              )}
              <Typography
                variant="caption"
                sx={{ color: isUp ? 'success.main' : 'error.main', fontWeight: 600 }}
              >
                {Math.abs(changePct)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                vs last period
              </Typography>
            </Box>
          )}
        </Box>
        {icon && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'secondary.light',
              color: 'secondary.main',
            }}
          >
            {icon}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
