import { useQuery } from '@tanstack/react-query';
import { instance } from '@/services/instance';

export interface WalletProject {
  id: string;
  title: string;
  image?: string;
  daysLeft: number;
  currentPhase: number;
  totalPhases: number;
}

export interface ProjectWithdrawal {
  id: string;
  amount: number;
  createdAt: string;
  milestone: {
    title: string;
    image?: string;
  };
}

export const useWalletProjects = (userId: string, status?: 'ACTIVE' | 'SUCCESS') => {
  return useQuery({
    queryKey: ['walletProjects', userId, status],
    queryFn: async () => {
      const url = `admin/users/${userId}/wallet/projects${status ? `?status=${status}` : ''}`;
      const response = await instance.get(url).json<{ data: WalletProject[] }>();
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useProjectWithdrawals = (userId: string, projectId: string | null) => {
  return useQuery({
    queryKey: ['projectWithdrawals', userId, projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await instance.get(`admin/users/${userId}/wallet/projects/${projectId}/withdrawals`).json<{ data: ProjectWithdrawal[] }>();
      return response.data;
    },
    enabled: !!userId && !!projectId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
