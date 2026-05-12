import React from 'react';
import { View } from 'react-native';
import { XStack, Button } from 'tamagui';
import { Home, Users, Zap, Rocket, Settings } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export function BottomNavigation() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  
  const isHome = route.name === Paths.Home;
  const isUsers = route.name === Paths.Users;
  return (
    <XStack 
      position="absolute" 
      bottom={30} 
      left={20} 
      right={20} 
      backgroundColor="white" 
      paddingHorizontal="$6" 
      height={72}
      justifyContent="space-between" 
      alignItems="center"
      borderRadius={40}
      borderWidth={1}
      borderColor="rgba(0,0,0,0.04)"
      zIndex={20}
    >
      <Button 
        unstyled 
        animation="bouncy" 
        pressStyle={{ scale: 0.9, opacity: 0.6 }} 
        padding="$2"
        onPress={() => navigation.navigate(Paths.Home)}
      >
        <Home color={isHome ? "#6a1bf5" : "#a3a6bc"} size={26} strokeWidth={2.5} />
      </Button>
      
      <Button 
        unstyled 
        animation="bouncy" 
        pressStyle={{ scale: 0.9, opacity: 0.6 }} 
        padding="$2"
        onPress={() => navigation.navigate(Paths.Users)}
      >
        <Users color={isUsers ? "#6a1bf5" : "#a3a6bc"} size={26} strokeWidth={2.5} />
      </Button>
      
      <View>
        <Button 
          unstyled
          width={56} 
          height={56} 
          backgroundColor="#6a1bf5" 
          borderRadius={28} 
          justifyContent="center" 
          alignItems="center"
          animation="bouncy"
          pressStyle={{ scale: 0.9, backgroundColor: '#5811d6' }}
          shadowColor="rgba(106, 27, 245, 0.4)"
          shadowOffset={{ width: 0, height: 6 }}
          shadowOpacity={1}
          shadowRadius={12}
          elevation={6}
        >
          <Zap color="white" size={24} strokeWidth={2.5} />
        </Button>
      </View>
      
      <Button unstyled animation="bouncy" pressStyle={{ scale: 0.9, opacity: 0.6 }} padding="$2"
        onPress={() => navigation.navigate(Paths.PendingProjects)}>
        <Rocket color={route.name === Paths.PendingProjects ? '#6a1bf5' : '#a3a6bc'} size={26} strokeWidth={2.5} />
      </Button>
      
      <Button unstyled animation="bouncy" pressStyle={{ scale: 0.9, opacity: 0.6 }} padding="$2">
        <Settings color="#a3a6bc" size={26} strokeWidth={2.5} />
      </Button>
    </XStack>
  );
}
