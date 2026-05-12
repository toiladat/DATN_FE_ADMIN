import { useQuery } from '@tanstack/react-query';
import { instance } from '@/services/instance';

export type AdminProject = {
  id: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  status: 'pending' | 'progress' | 'active' | 'success' | 'rejected';
  fundingGoal: number;
  raisedAmount: number;
  primaryCategory?: string;
  startDate: number;
  endDate: number;
  updatedAt: number;
  totalMilestones: number;
  completedMilestones: number;
};

export type ProjectStatus = AdminProject['status'];

export const STATUS_META: Record<
  ProjectStatus,
  { label: string; accent: string; bgColor: string; textColor: string }
> = {
  pending:  { label: 'Pending',     accent: '#f59e0b', bgColor: 'rgba(245,158,11,0.08)',  textColor: '#b45309' },
  progress: { label: 'Fundraising', accent: '#06b6d4', bgColor: 'rgba(6,182,212,0.08)',   textColor: '#0e7490' },
  active:   { label: 'Active',      accent: '#0ea5e9', bgColor: 'rgba(14,165,233,0.08)',  textColor: '#0369a1' },
  success:  { label: 'Success',     accent: '#10b981', bgColor: 'rgba(16,185,129,0.08)',  textColor: '#047857' },
  rejected: { label: 'Rejected',    accent: '#ef4444', bgColor: 'rgba(239,68,68,0.08)',   textColor: '#b91c1c' },
};

export const ALL_STATUSES: ProjectStatus[] = [
  'pending',
  'progress',
  'active',
  'success',
  'rejected',
];

export function useUserProjects(userId: string) {
  return useQuery<AdminProject[]>({
    queryKey: ['admin-user-projects', userId],
    queryFn: async () => {
      const res = await instance
        .get(`admin/users/${userId}/projects`)
        .json<{ data: AdminProject[] }>();
      return res.data;
    },
    enabled: !!userId,
  });
}
