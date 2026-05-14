import { instance } from '@/services/instance';

export type ActivityType = 'PROJECT_LAUNCHED' | 'WITHDRAWAL_REQUEST' | 'MILESTONE_COMPLETED';

export interface ActivityItem {
  type: ActivityType;
  createdAt: number;
  title?: string;
}

export interface ProjectStats {
  total: number;
  pending: number;
  fundraising: number;
  executing: number;
  success: number;
  failed: number;
}

export interface DashboardStats {
  platformRevenue: number;
  activeUsers: number;
  liveProjects: number;
  totalUsers: number;
  pendingProjects: number;
  pendingWithdrawals: number;
  pendingMilestones: number;
  projectStats: ProjectStats;
  adminProfile?: { avatar?: string | null };
  recentActivities: ActivityItem[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return instance.get('admin/dashboard/stats').json<DashboardStats>();
}
