import React, { useState } from 'react';
import { View, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { YStack, XStack, Text, Button, Spinner } from 'tamagui';
import { Bell, LogOut, User } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { instance } from '@/services/instance';
import { useAuth } from '@/contexts/AuthContext';
import { authStorage } from '@/services/storage';

interface HeaderSectionProps {
  platformRevenue?: number;
  activeUsers?: number;
  liveProjects?: number;
  adminProfile?: { avatar?: string | null };
  isLoading?: boolean;
}

function formatRevenue(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
  return String(value);
}

export function HeaderSection({ platformRevenue, activeUsers, liveProjects, adminProfile, isLoading }: HeaderSectionProps) {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await instance.post('admin-auth/logout', {
          json: { refreshToken }
        }).json();
      }
    },
    onSettled: () => {
      setMenuOpen(false);
      logout();
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <YStack 
      backgroundColor="#36068e" 
      paddingTop="$8" 
      paddingBottom="$6" 
      paddingHorizontal="$5" 
      borderBottomLeftRadius={40}
      borderBottomRightRadius={40}
      position="relative"
    >
      {/* User Profile & Notification */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
        
        <View>
          <Button unstyled pressStyle={{ opacity: 0.8 }} onPress={() => setMenuOpen(true)}>
            <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
              {adminProfile?.avatar ? (
                <Image 
                  source={{ uri: adminProfile.avatar }} 
                  style={{ width: '100%', height: '100%' }} 
                />
              ) : (
                <User color="white" size={20} />
              )}
            </View>
          </Button>

          <Modal visible={menuOpen} transparent={true} animationType="fade">
            <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
              <View style={{ flex: 1 }}>
                <YStack
                  position="absolute"
                  top={110}
                  left={20}
                  width={160}
                  backgroundColor="white"
                  borderRadius={16}
                  padding="$2"
                  shadowColor="rgba(0,0,0,0.15)"
                  shadowOffset={{ width: 0, height: 8 }}
                  shadowOpacity={1}
                  shadowRadius={24}
                  elevation={10}
                >
                  <View style={{ position: 'absolute', top: -5, left: 18, width: 12, height: 12, backgroundColor: 'white', transform: [{ rotate: '45deg' }] }} />
                  <Button 
                     unstyled 
                     padding="$3" 
                     paddingHorizontal="$4"
                     flexDirection="row" 
                     alignItems="center" 
                     space="$3" 
                     borderRadius={12}
                     pressStyle={{ backgroundColor: '#fff0f0' }}
                     onPress={handleLogout}
                     disabled={logoutMutation.isPending}
                  >
                    <LogOut color="#f44336" size={18} strokeWidth={2.5} />
                    <Text color="#f44336" fontWeight="700" fontSize={15}>
                      {logoutMutation.isPending ? 'Wait...' : 'Logout'}
                    </Text>
                  </Button>
                </YStack>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
        
        <Button 
          unstyled
          width={44} 
          height={44} 
          borderRadius={22} 
          backgroundColor="rgba(255,255,255,0.15)" 
          justifyContent="center" 
          alignItems="center"
          animation="bouncy"
          pressStyle={{ scale: 0.9, backgroundColor: 'rgba(255,255,255,0.25)' }}
        >
          <Bell color="white" size={20} strokeWidth={2.5} />
          <View style={{ position: 'absolute', top: 10, right: 12, width: 8, height: 8, backgroundColor: '#f44336', borderRadius: 4, borderWidth: 1.5, borderColor: '#36068e' }} />
        </Button>
      </XStack>

      {/* Overview Area */}
      <YStack alignItems="center">
        <Text color="rgba(255,255,255,0.8)" fontSize={14} fontWeight="500" marginBottom="$1">Platform Revenue</Text>
        {isLoading ? (
          <Spinner size="large" color="white" marginVertical="$2" />
        ) : (
          <Text color="white" fontSize={42} fontWeight="800" letterSpacing={-1}>
            {formatRevenue(platformRevenue ?? 0)}
          </Text>
        )}
        
        <XStack space="$4" marginTop="$5">
          <YStack alignItems="center" backgroundColor="rgba(255,255,255,0.12)" paddingHorizontal="$5" paddingVertical="$3" borderRadius="$5">
            {isLoading ? (
              <Spinner size="small" color="white" />
            ) : (
              <Text color="white" fontWeight="bold" fontSize={18}>{formatCount(activeUsers ?? 0)}</Text>
            )}
            <Text color="rgba(255,255,255,0.7)" fontSize={12} marginTop="$1">Active Users</Text>
          </YStack>
          <YStack alignItems="center" backgroundColor="rgba(255,255,255,0.12)" paddingHorizontal="$5" paddingVertical="$3" borderRadius="$5">
            {isLoading ? (
              <Spinner size="small" color="white" />
            ) : (
              <Text color="white" fontWeight="bold" fontSize={18}>{formatCount(liveProjects ?? 0)}</Text>
            )}
            <Text color="rgba(255,255,255,0.7)" fontSize={12} marginTop="$1">Live Projects</Text>
          </YStack>
        </XStack>
      </YStack>
    </YStack>
  );
}
