import React from 'react';
import { View } from 'react-native';
import { XStack, Button } from 'tamagui';
import { Home, Users, Zap, Rocket, Settings } from 'lucide-react-native';

export function BottomNavigation() {
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
      shadowColor="rgba(0,0,0,0.15)"
      shadowOffset={{ width: 0, height: 12 }}
      shadowOpacity={1}
      shadowRadius={30}
      elevation={15}
      zIndex={20}
    >
      <Button unstyled animation="bouncy" pressStyle={{ scale: 0.9, opacity: 0.6 }} padding="$2">
        <Home color="#6a1bf5" size={26} strokeWidth={2.5} />
      </Button>
      
      <Button unstyled animation="bouncy" pressStyle={{ scale: 0.9, opacity: 0.6 }} padding="$2">
        <Users color="#a3a6bc" size={26} strokeWidth={2.5} />
      </Button>
      
      {/* Center Action Button */}
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
      
      <Button unstyled animation="bouncy" pressStyle={{ scale: 0.9, opacity: 0.6 }} padding="$2">
        <Rocket color="#a3a6bc" size={26} strokeWidth={2.5} />
      </Button>
      
      <Button unstyled animation="bouncy" pressStyle={{ scale: 0.9, opacity: 0.6 }} padding="$2">
        <Settings color="#a3a6bc" size={26} strokeWidth={2.5} />
      </Button>
    </XStack>
  );
}
