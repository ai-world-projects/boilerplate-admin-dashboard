'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '@/api/services/dashboard';

/** Loads the dashboard summary payload (cards, charts, recent users). */
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    select: (res) => res.data,
  });
}
