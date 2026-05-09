import React from 'react';
import { YStack, XStack, Text, Button } from 'tamagui';
import { Users, Rocket, BarChart3, Settings } from 'lucide-react-native';

const ACTIONS = [
  { id: 'users', label: 'Users', Icon: Users, color: '#6a1bf5' },
  { id: 'projects', label: 'Projects', Icon: Rocket, color: '#6a1bf5' },
  { id: 'analytics', label: 'Analytics', Icon: BarChart3, color: '#6a1bf5' },
  { id: 'settings', label: 'Settings', Icon: Settings, color: '#6a1bf5' },
];

export function QuickActions() {
  return (
    <XStack 
      backgroundColor="white" 
      borderRadius={24} 
      paddingHorizontal="$5" 
      paddingVertical="$4"
      justifyContent="space-between" 
      alignItems="center"
      shadowColor="rgba(0,0,0,0.06)"
      shadowOffset={{ width: 0, height: 8 }}
      shadowOpacity={1}
      shadowRadius={24}
      elevation={5}
    >
      {ACTIONS.map((action) => (
        <YStack key={action.id} alignItems="center">
          <Button 
            unstyled
            width={52} 
            height={52} 
            borderRadius={26} 
            backgroundColor="#f4effe" 
            justifyContent="center" 
            alignItems="center"
            marginBottom="$1.5"
            animation="bouncy"
            pressStyle={{ scale: 0.9, backgroundColor: '#e9dbfd' }}
          >
            <action.Icon color={action.color} size={24} strokeWidth={2.5} />
          </Button>
          <Text fontSize={13} fontWeight="600" color="#1e2246">{action.label}</Text>
        </YStack>
      ))}
    </XStack>
  );
}
