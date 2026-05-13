import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instance } from '@/services/instance';

export type PendingMilestone = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  amount: number;
  startDate: string;
  endDate: string;
  order: number;
  project: {
    id: string;
    title: string;
    slug: string;
    images: string[];
    user: {
      name: string;
      avatar: string;
    };
  };
  previousMilestone?: {
    id: string;
    title: string;
    milestoneUpdates?: {
      completed: string;
      blockers: string;
      images: string[];
      video: string;
      link: string | null;
      isLate: boolean;
      createdAt: string;
    } | null;
  } | null;
};

export function usePendingMilestones() {
  return useQuery<PendingMilestone[]>({
    queryKey: ['admin-pending-milestones'],
    queryFn: async () => {
      const res = await instance
        .get('admin/projects/pending-milestones')
        .json<PendingMilestone[]>();
      return res;
    },
  });
}

export function useApproveMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (milestoneId: string) =>
      instance.put(`admin/projects/milestones/${milestoneId}/approve`).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-milestones'] });
    },
  });
}

export function useRejectMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ milestoneId, reason }: { milestoneId: string; reason: string }) =>
      instance.put(`admin/projects/milestones/${milestoneId}/reject`, { json: { reason } }).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-milestones'] });
    },
  });
}
