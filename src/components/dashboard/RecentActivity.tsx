import React from 'react';
import { TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { Rocket, Wallet, User, Target } from 'lucide-react-native';

const ACTIVITIES = [
  { id: 1, title: 'New Project Launch', time: '10 mins ago', Icon: Rocket, color: '#6a1bf5' },
  { id: 2, title: 'Withdrawal Request', time: '1 hr ago', Icon: Wallet, color: '#6a1bf5' },
  { id: 3, title: 'User Registered', time: '2 hrs ago', Icon: User, color: '#6a1bf5' },
  { id: 4, title: 'Milestone Completed', time: '5 hrs ago', Icon: Target, color: '#6a1bf5' },
];

export function RecentActivity() {
  return (
    <YStack marginTop="$6" paddingBottom="$10">
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$5" paddingHorizontal="$1">
        <Text color="#1e2246" fontWeight="bold" fontSize={20}>Recent Activity</Text>
        <TouchableOpacity>
          <Text color="#6a1bf5" fontSize={15} fontWeight="600">See all</Text>
        </TouchableOpacity>
      </XStack>

      <YStack space="$4">
        {ACTIVITIES.map((activity) => (
          <Button 
            key={activity.id}
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
              <YStack 
                width={40} 
                height={40} 
                justifyContent="center" 
                alignItems="center"
              >
                <activity.Icon color={activity.color} size={24} strokeWidth={2.5} />
              </YStack>
              <YStack flex={1} paddingRight="$2">
                <Text color="#1e2246" fontWeight="700" fontSize={15} numberOfLines={1}>{activity.title}</Text>
              </YStack>
            </XStack>
            <Text color="#a3a6bc" fontSize={12} fontWeight="500">{activity.time}</Text>
          </Button>
        ))}
      </YStack>
    </YStack>
  );
}
