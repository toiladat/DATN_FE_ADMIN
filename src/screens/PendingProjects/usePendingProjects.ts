import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instance } from '@/services/instance';

export type PendingProjectUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  walletAddress?: string | null;
  phoneNumber?: string | null;
  location?: string | null;
};

export type PendingProject = {
  id: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  status: 'pending';
  fundingGoal: number;
  raisedAmount: number;
  primaryCategory?: string;
  startDate: number;
  endDate: number;
  createdAt: number;
  totalMilestones: number;
  user: PendingProjectUser;
};

export function usePendingProjects() {
  return useQuery<PendingProject[]>({
    queryKey: ['admin-pending-projects'],
    queryFn: async () => {
      const res = await instance
        .get('admin/projects/pending')
        .json<{ projects: PendingProject[] }>();
      return res.projects;
    },
  });
}

export function useApproveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) =>
      instance.put(`projects/${projectId}/approve`).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-projects'] });
    },
  });
}

export function useRejectProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, reason }: { projectId: string; reason: string }) =>
      instance.put(`projects/${projectId}/reject`, { json: { reason } }).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-projects'] });
    },
  });
}
