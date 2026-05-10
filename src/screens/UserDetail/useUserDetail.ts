import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instance } from '@/services/instance';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'KYC_PENDING';

export interface User {
  id: string;
  email?: string;
  name?: string;
  phoneNumber?: string;
  avatar?: string;
  location?: string;
  walletAddress: string;
  status: UserStatus;
  createdAt: string;
  socialLinks?: string[];
  website?: string;
}

export interface UserDetailStats {
  projects: {
    total: number;
    success: number;
    failed: number;
    pending: number;
    fundraising: number;
    executing: number;
  };
  financials: {
    totalReceived: number;
    totalRaised: number;
    totalInvestmentsCount: number;
    totalInvestedAmount: number;
  };
}

export interface UserDetailData {
  user: User;
  stats: UserDetailStats;
}

export const useUserDetail = (id: string) => {
  return useQuery({
    queryKey: ['userDetail', id],
    queryFn: async () => {
      console.log('Fetching user detail for id:', id);
      try {
        const response = await instance.get(`admin/users/${id}`).json<UserDetailData>();
        console.log('Fetched user detail:', response);
        return response;
      } catch (error: any) {
        console.error('Error fetching user detail:', error?.response?.data || error.message);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes instead of 0
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await instance.patch(`admin/users/${id}/ban`).json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['userDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await instance.patch(`admin/users/${id}/unban`).json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['userDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};
