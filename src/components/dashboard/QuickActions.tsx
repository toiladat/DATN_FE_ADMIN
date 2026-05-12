import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Users, Rocket, BarChart3, Settings } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

export function QuickActions() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const ACTIONS = [
    { id: 'users', label: 'Users', Icon: Users, color: '#6a1bf5', onPress: () => navigation.navigate(Paths.Users) },
    { id: 'projects', label: 'Projects', Icon: Rocket, color: '#6a1bf5', onPress: () => navigation.navigate(Paths.PendingProjects) },
    { id: 'analytics', label: 'Analytics', Icon: BarChart3, color: '#6a1bf5', onPress: () => {} },
    { id: 'settings', label: 'Settings', Icon: Settings, color: '#6a1bf5', onPress: () => {} },
  ];

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
        <TouchableOpacity key={action.id} activeOpacity={0.75} onPress={action.onPress} style={{ alignItems: 'center' }}>
          <View style={{
            width: 52, height: 52, borderRadius: 26,
            backgroundColor: '#f4effe',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 6,
          }}>
            <action.Icon color={action.color} size={24} strokeWidth={2.5} />
          </View>
          <Text fontSize={13} fontWeight="600" color="#1e2246">{action.label}</Text>
        </TouchableOpacity>
      ))}
    </XStack>
  );
}

