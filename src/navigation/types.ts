import type { StackScreenProps } from '@react-navigation/stack';

import type { Paths } from '@/navigation/paths';

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;

export type RootStackParamList = {
  [Paths.Home]: undefined;
  [Paths.Startup]: undefined;
  [Paths.Login]: undefined;
  [Paths.Users]: undefined;
  [Paths.UserDetail]: { id: string };
  [Paths.UserWallet]: { id: string };
  [Paths.UserInvestments]: { id: string };
  [Paths.UserProjects]: { id: string; name?: string };
  [Paths.AdminProjectDetail]: { projectId: string; title?: string };
  [Paths.PendingProjects]: undefined;
};
