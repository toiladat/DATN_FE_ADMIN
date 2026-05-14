import React from 'react';
import { TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, Button, Spinner } from 'tamagui';
import { Rocket, Wallet, Target, Users } from 'lucide-react-native';
import { ActivityType } from '@/services/dashboard';

const ACTIVITY_CONFIG: Record<
  ActivityType | 'USERS',
  { label: string; Icon: React.ComponentType<any>; color: string }
> = {
  PROJECT_LAUNCHED: { label: 'New Project Launch', Icon: Rocket, color: '#6a1bf5' },
  WITHDRAWAL_REQUEST: { label: 'Withdrawal Request', Icon: Wallet, color: '#6a1bf5' },
  MILESTONE_COMPLETED: { label: 'Milestone Completed', Icon: Target, color: '#6a1bf5' },
  USERS: { label: 'Users', Icon: Users, color: '#6a1bf5' },
};


interface RecentActivityProps {
  pendingProjects?: number;
  pendingWithdrawals?: number;
  pendingMilestones?: number;
  totalUsers?: number;
  isLoading?: boolean;
}

export function RecentActivity({ pendingProjects = 0, pendingWithdrawals = 0, pendingMilestones = 0, totalUsers = 0, isLoading }: RecentActivityProps) {
  // Build display list: replace timeAgo with pending counts
  const displayItems = [
    {
      key: 'projects',
      type: 'PROJECT_LAUNCHED' as ActivityType,
      title: undefined,
      subtitle: pendingProjects > 0 ? `${pendingProjects} pending` : '0 pending',
    },
    {
      key: 'withdrawals',
      type: 'WITHDRAWAL_REQUEST' as ActivityType,
      title: undefined,
      subtitle: pendingWithdrawals > 0 ? `${pendingWithdrawals} pending` : '0 pending',
    },
    {
      key: 'milestones',
      type: 'MILESTONE_COMPLETED' as ActivityType,
      title: undefined,
      subtitle: pendingMilestones > 0 ? `${pendingMilestones} pending` : '0 pending',
    },
    {
      key: 'users',
      type: 'USERS' as const,
      title: undefined,
      subtitle: `${totalUsers.toLocaleString()} total`,
    },
  ];

  return (
    <YStack marginTop="$6" paddingBottom="$10">
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$5" paddingHorizontal="$1">
        <Text color="#1e2246" fontWeight="bold" fontSize={20}>Recent Activity</Text>
        <TouchableOpacity>
          <Text color="#6a1bf5" fontSize={15} fontWeight="600">See all</Text>
        </TouchableOpacity>
      </XStack>

      {isLoading ? (
        <YStack alignItems="center" paddingVertical="$8">
          <Spinner size="large" color="#6a1bf5" />
        </YStack>
      ) : (
        <YStack space="$4">
          {displayItems.map((item) => {
            const config = ACTIVITY_CONFIG[item.type];
            const Icon = config.Icon;
            return (
              <Button
                key={item.key}
                unstyled
                backgroundColor="white"
                padding="$4"
                borderRadius={20}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                animation="bouncy"
                pressStyle={{ scale: 0.98, opacity: 0.8 }}
                borderWidth={1}
                borderColor="rgba(0,0,0,0.03)"
              >
                <XStack alignItems="center" space="$3.5" flex={1}>
                  <YStack width={40} height={40} justifyContent="center" alignItems="center">
                    <Icon color={config.color} size={24} strokeWidth={2.5} />
                  </YStack>
                  <YStack flex={1} paddingRight="$2">
                    <Text color="#1e2246" fontWeight="700" fontSize={15} numberOfLines={1}>
                      {item.title || config.label}
                    </Text>
                  </YStack>
                </XStack>
                <Text color="#a3a6bc" fontSize={12} fontWeight="500">{item.subtitle}</Text>
              </Button>
            );
          })}
        </YStack>
      )}
    </YStack>
  );
}
