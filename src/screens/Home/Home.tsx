import React, { useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { YStack, Theme } from 'tamagui';

import { HeaderSection } from '@/components/dashboard/HeaderSection';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { CircularStats, CircularStatsRef } from '@/components/common/CircularStats';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { BottomNavigation } from '@/components/dashboard/BottomNavigation';
import { useDashboardStats } from '@/hooks/useDashboardStats';

function Home() {
  const { data: stats, isLoading } = useDashboardStats();
  const circularStatsRef = useRef<CircularStatsRef>(null);

  return (
    <View style={{ flex: 1 }}>
      <Theme name="light">
        <YStack flex={1} backgroundColor="#f8f9fc">
          <ScrollView 
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={true}
            bounces={true}
            contentContainerStyle={{ paddingBottom: 120 }}
            onScrollBeginDrag={() => circularStatsRef.current?.clearSelection()}
          >
            <HeaderSection
              platformRevenue={stats?.platformRevenue}
              activeUsers={stats?.activeUsers}
              liveProjects={stats?.liveProjects}
              adminProfile={stats?.adminProfile}
              isLoading={isLoading}
            />
            
            <YStack 
              marginTop={-32}
              paddingHorizontal="$6"
              zIndex={10}
            >
              <QuickActions />
              {stats?.projectStats && (
                <YStack marginTop="$6">
                  <CircularStats ref={circularStatsRef} stats={stats.projectStats} title="System Projects" />
                </YStack>
              )}
              <YStack marginTop="$6">
                <RecentActivity
                pendingProjects={stats?.pendingProjects}
                pendingWithdrawals={stats?.pendingWithdrawals}
                pendingMilestones={stats?.pendingMilestones}
                totalUsers={stats?.totalUsers}
                isLoading={isLoading}
              />
              </YStack>
            </YStack>
          </ScrollView>
          
          <BottomNavigation />
        </YStack>
      </Theme>
    </View>
  );
}

export default Home;
