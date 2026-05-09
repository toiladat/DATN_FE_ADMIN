import { View, ScrollView } from 'react-native';
import { YStack, Theme } from 'tamagui';

import { HeaderSection } from '@/components/dashboard/HeaderSection';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { BottomNavigation } from '@/components/dashboard/BottomNavigation';

function Home() {
  return (
    <View style={{ flex: 1 }}>
      <Theme name="light">
        <YStack flex={1} backgroundColor="#f8f9fc">
          <ScrollView 
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={true}
            bounces={true}
            contentContainerStyle={{ paddingBottom: 120 }} // Space for BottomNav
          >
            <HeaderSection />
            
            <YStack 
              marginTop={-32} // Negative margin to overlap the header like the HTML
              paddingHorizontal="$6"
              zIndex={10}
              space="$6"
            >
              <QuickActions />
              <RecentActivity />
            </YStack>
          </ScrollView>
          
          <BottomNavigation />
        </YStack>
      </Theme>
    </View>
  );
}

export default Home;
