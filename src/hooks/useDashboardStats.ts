import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats, DashboardStats } from '@/services/dashboard';

export const DASHBOARD_STATS_QUERY_KEY = ['admin', 'dashboard', 'stats'];

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: DASHBOARD_STATS_QUERY_KEY,
    queryFn: fetchDashboardStats,
    staleTime: 60 * 1000, // 1 phút
    refetchOnWindowFocus: true,
  });
}
