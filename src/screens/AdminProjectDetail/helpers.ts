import dayjs from 'dayjs';

export const fmt = (ts: any, f: string): string =>
  ts ? dayjs(ts).format(f) : 'TBA';

export const fmtUSDT = (n: number): string =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(1)}K`
  : `$${n.toLocaleString()}`;

export const MILESTONE_STATUS: Record<string, { color: string; bg: string }> = {
  PENDING:   { color: '#717786', bg: 'rgba(113,119,134,0.08)' },
  PROGRESS:  { color: '#0e7490', bg: 'rgba(6,182,212,0.08)' },
  COMPLETED: { color: '#047857', bg: 'rgba(16,185,129,0.08)' },
  APPROVED:  { color: '#047857', bg: 'rgba(16,185,129,0.08)' },
  WITHDRAWN: { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  CANCELLED: { color: '#b91c1c', bg: 'rgba(239,68,68,0.08)' },
};

export const TABS = ['Info', 'Milestones', 'Team', 'Investors', 'Attachments'] as const;
export type Tab = typeof TABS[number];
