import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instance } from '@/services/instance';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MilestoneUpdate = {
  completed: string;
  blockers?: string;
  images?: string[];
  video?: string;
  link?: string | null;
  isLate?: boolean;
};

export type Milestone = {
  id: string;
  order: number;
  title: string;
  description: string;
  amount: number;
  startDate: string | number;
  endDate: string | number;
  status: string;
  advantages?: string;
  challenges?: string;
  outcome?: string;
  images: string[];
  video?: string | null;
  milestoneUpdates?: MilestoneUpdate | null;
};

export type ProjectMember = {
  userId: string;
  role: string;
  description?: string;
  user?: {
    id?: string;
    name?: string | null;
    avatar?: string | null;
    walletAddress: string;
  };
};

export type Investor = {
  amount: number;
  name?: string;
  avatar?: string;
  content?: string | null;
  createdAt?: string | number;
};

export type ProjectDetail = {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  images: string[];
  video?: string | null;
  location: string;
  description: string;
  risks: string;
  totalAmount: number;
  raisedAmount: number;
  status: string;
  startDate: string | number;
  endDate: string | number;
  userId: string;
  user?: {
    id: string;
    name?: string | null;
    avatar?: string | null;
    email?: string | null;
    walletAddress: string;
  };
  category?: { name: string; slug: string } | null;
  stats: { likes: number; reviews: number };
  milestones: Milestone[];
  projectMembers: ProjectMember[];
  topInvestors: Investor[];
  recentInvestors: Investor[];
  createdAt?: string | number;
  updatedAt?: string | number;
};

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Strip HTML tags — dùng cho description/risks từ rich text editor */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAdminProject(projectId: string) {
  return useQuery<ProjectDetail>({
    queryKey: ['admin-project-detail', projectId],
    queryFn: () =>
      instance.get(`projects/${projectId}`).json<ProjectDetail>(),
    enabled: !!projectId,
  });
}

export function useApproveProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => instance.put(`admin/projects/${projectId}/approve`).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-project-detail', projectId] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-projects'] });
    },
  });
}

export function useRejectProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) =>
      instance.put(`admin/projects/${projectId}/reject`, { json: { reason } }).json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-project-detail', projectId] });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-projects'] });
    },
  });
}
