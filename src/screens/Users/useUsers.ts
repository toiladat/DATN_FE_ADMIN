import { useInfiniteQuery } from '@tanstack/react-query';
import { instance } from '@/services/instance';

export type UserStatus = 'KYC_PENDING' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  status: UserStatus;
  avatar: string | null;
  walletAddress: string;
}

interface GetUsersParams {
  limit: number;
  keyword?: string;
  status?: UserStatus;
}

interface GetUsersResponse {
  data: User[];
  total: number;
  page: number;
  totalPages: number;
}

export const useUsers = (params: GetUsersParams) => {
  return useInfiniteQuery({
    queryKey: ['admin-users', params],
    queryFn: async ({ pageParam = 1 }) => {
      console.log('Fetching users API... page:', pageParam, 'params:', params);
      try {
        // clean up undefined params because ky's searchParams might not like undefined
        const searchParams: Record<string, string | number> = { page: pageParam, limit: params.limit };
        if (params.keyword) searchParams.keyword = params.keyword;
        if (params.status) searchParams.status = params.status;

        const data = await instance.get('admin/users', { 
          searchParams
        }).json<GetUsersResponse>();
        
        console.log('Fetched users data:', data);
        return data;
      } catch (error: any) {
        console.error('Error fetching users:', error?.response?.data || error.message);
        throw error;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
};
