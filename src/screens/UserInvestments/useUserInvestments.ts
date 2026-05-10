import { useQuery } from '@tanstack/react-query';
import { instance } from '@/services/instance';

export interface UserInvestment {
  id: string;
  amount: number;
  content?: string | null;
  txHash?: string | null;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
  project: {
    id: string;
    title: string;
    image?: string;
  };
}

export const useUserInvestments = (userId: string) => {
  return useQuery({
    queryKey: ['userInvestments', userId],
    queryFn: async () => {
      const response = await instance.get(`admin/users/${userId}/investments`).json<{ data: UserInvestment[] }>();
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
