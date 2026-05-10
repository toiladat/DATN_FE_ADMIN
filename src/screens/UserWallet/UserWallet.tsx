import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Theme, Card, Spinner } from 'tamagui';
import { ArrowLeft, ArrowUp, Folder, Box, Wallet, X } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';

import { useUserDetail } from '../UserDetail/useUserDetail';
import { useWalletProjects, useProjectWithdrawals } from './useUserWallet';
import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

export default function UserWallet() {
  const route = useRoute<RootScreenProps<Paths.UserWallet>['route']>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id } = route.params;

  const [projectFilter, setProjectFilter] = useState<'ACTIVE' | 'SUCCESS'>('ACTIVE');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Full screen image viewer state
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const { data: userDetail, isLoading: isLoadingUser } = useUserDetail(id);
  const { data: projects, isLoading: isLoadingProjects } = useWalletProjects(id, projectFilter);
  const { data: withdrawals, isLoading: isLoadingWithdrawals } = useProjectWithdrawals(id, selectedProjectId);

  // Auto-select the first project when projects list loads or changes
  useEffect(() => {
    if (projects && projects.length > 0) {
      if (!selectedProjectId || !projects.find(p => p.id === selectedProjectId)) {
        setSelectedProjectId(projects[0].id);
      }
    } else {
      setSelectedProjectId(null);
    }
  }, [projects]);

  const isLoading = isLoadingUser || isLoadingProjects;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFAFC', justifyContent: 'center', alignItems: 'center' }}>
        <Spinner size="large" color="#6a1bf5" />
      </View>
    );
  }

  if (!userDetail) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFAFC', justifyContent: 'center', alignItems: 'center' }}>
        <Text color="#ef4444" fontWeight="600">Error loading wallet details.</Text>
      </View>
    );
  }

  const { stats } = userDetail;

  const formatUSDT = (amount: number) =>
    `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} usdt`;

  return (
    <Theme name="light">
      <View style={{ flex: 1, backgroundColor: '#FAFAFC' }}>
        
        {/* Floating back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={{
            position: 'absolute', top: insets.top + 10, left: 20, zIndex: 50,
            width: 40, height: 40, borderRadius: 12, backgroundColor: 'white',
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
            borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)'
          }}
        >
          <ArrowLeft size={20} color="#1a1b1f" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={{ paddingTop: insets.top + 60, paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Current Balance Card */}
          <Card 
            backgroundColor="#6a1bf5" 
            borderRadius={24} 
            padding="$5" 
            marginBottom="$4" 
            overflow="hidden"
            style={{
              shadowColor: '#6a1bf5', shadowOpacity: 0.25, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }
            }}
          >
            {/* Decorative background watermark - much softer now */}
            <View style={{ position: 'absolute', top: -30, right: -20, opacity: 0.05 }}>
              <Wallet size={160} color="white" />
            </View>
            <View style={{ position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.03)' }} />
            
            <YStack space="$1" position="relative" zIndex={10}>
              <Text fontSize={15} fontWeight="500" color="rgba(255,255,255,0.8)">Total Withdrawn</Text>
              <Text fontSize={36} fontWeight="800" color="white" letterSpacing={-0.5}>
                {formatUSDT(stats.financials.totalReceived)}
              </Text>
            </YStack>
          </Card>

          {/* Project Filter - iOS Segmented Control style */}
          <XStack backgroundColor="rgba(118, 118, 128, 0.12)" borderRadius={9} padding={2} marginBottom="$4">
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => setProjectFilter('ACTIVE')}
              style={{ flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: projectFilter === 'ACTIVE' ? 'white' : 'transparent', borderRadius: 7, shadowColor: projectFilter === 'ACTIVE' ? '#000' : 'transparent', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 3 } }}
            >
              <Text fontSize={13} fontWeight={projectFilter === 'ACTIVE' ? '600' : '500'} color={projectFilter === 'ACTIVE' ? '#1a1b1f' : '#8e8e93'}>Active</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => setProjectFilter('SUCCESS')}
              style={{ flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: projectFilter === 'SUCCESS' ? 'white' : 'transparent', borderRadius: 7, shadowColor: projectFilter === 'SUCCESS' ? '#000' : 'transparent', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 3 } }}
            >
              <Text fontSize={13} fontWeight={projectFilter === 'SUCCESS' ? '600' : '500'} color={projectFilter === 'SUCCESS' ? '#1a1b1f' : '#8e8e93'}>Completed</Text>
            </TouchableOpacity>
          </XStack>

          {/* Upcoming Payments / Projects */}
          <YStack marginBottom="$4">
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
              <Text fontSize={18} fontWeight="700" color="#1a1b1f" letterSpacing={-0.5}>Projects</Text>
            </XStack>
            
            {projects && projects.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ overflow: 'visible' }}>
                <XStack space="$3" paddingBottom="$3">
                  {projects.map((project) => {
                    const isSelected = project.id === selectedProjectId;
                    return (
                      <TouchableOpacity 
                        key={project.id} 
                        activeOpacity={0.9} 
                        style={{ marginRight: 5 }}
                        onPress={() => setSelectedProjectId(project.id)}
                      >
                        <Card 
                          backgroundColor="white"
                          borderRadius={16}
                          width={160}
                          overflow="hidden"
                          style={{
                            shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
                            borderWidth: isSelected ? 1.5 : 1, 
                            borderStyle: isSelected ? 'dashed' : 'solid',
                            borderColor: isSelected ? '#d4d4d8' : 'rgba(0,0,0,0.04)'
                          }}
                        >
                          {/* Cover Image Half */}
                          <TouchableOpacity 
                            activeOpacity={0.8}
                            onPress={() => {
                              if (project.image) setFullScreenImage(project.image);
                              else setSelectedProjectId(project.id);
                            }}
                          >
                            <View style={{ width: '100%', height: 80, backgroundColor: '#f4f5f8', overflow: 'hidden' }}>
                              {project.image ? (
                                <Image source={{ uri: project.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                              ) : (
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                  <Box size={24} color="#a1a1aa" />
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                          
                          {/* Content Half */}
                          <YStack space="$1" padding="$3">
                            <Text fontSize={15} fontWeight="700" color="#1a1b1f" numberOfLines={1}>{project.title}</Text>
                            <Text fontSize={13} fontWeight="500" color="#717786" numberOfLines={1}>Phase: {project.currentPhase}/{project.totalPhases}</Text>
                            {projectFilter === 'ACTIVE' && (
                              <Text fontSize={12} color="#a1a1aa" numberOfLines={1}>{project.daysLeft} days left</Text>
                            )}
                          </YStack>
                        </Card>
                      </TouchableOpacity>
                    );
                  })}
                </XStack>
              </ScrollView>
            ) : (
              <Card backgroundColor="white" borderRadius={16} padding="$5" alignItems="center" justifyContent="center" style={{ borderStyle: 'dashed', borderWidth: 1, borderColor: '#d4d4d8' }}>
                <Folder size={32} color="#e4e4e7" style={{ marginBottom: 10 }} />
                <Text fontSize={15} fontWeight="500" color="#717786">No projects found</Text>
              </Card>
            )}
          </YStack>

          {/* Recent Transactions */}
          <YStack>
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
              <Text fontSize={18} fontWeight="700" color="#1a1b1f" letterSpacing={-0.5}> History</Text>
            </XStack>
            
            {isLoadingWithdrawals ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Spinner color="#6a1bf5" />
              </View>
            ) : withdrawals && withdrawals.length > 0 ? (
              <Card backgroundColor="white" borderRadius={20} paddingHorizontal="$4" paddingVertical="$2" style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)'}}>
                {withdrawals.map((tx, index) => (
                  <View key={tx.id}>
                    <XStack alignItems="center" justifyContent="space-between" paddingVertical="$3">
                      <XStack alignItems="center" space="$3" flex={1}>
                        <TouchableOpacity 
                          activeOpacity={0.8}
                          onPress={() => {
                            if (tx.milestone.image) setFullScreenImage(tx.milestone.image);
                          }}
                        >
                          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#f4f5f8', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', marginRight: 10 }}>
                            {tx.milestone.image ? (
                              <Image source={{ uri: tx.milestone.image }} style={{ width: 44, height: 44 }} resizeMode="cover" />
                            ) : (
                              <ArrowUp size={18} color="#a1a1aa" />
                            )}
                          </View>
                        </TouchableOpacity>
                        <YStack flex={1} paddingRight="$2">
                          <Text fontSize={15} fontWeight="600" color="#1a1b1f" numberOfLines={1}>{tx.milestone.title}</Text>
                          <Text fontSize={13} color="#8e8e93" marginTop="$1">{dayjs(tx.createdAt).format('DD MMM, YYYY')}</Text>
                        </YStack>
                      </XStack>
                      <Text fontSize={15} fontWeight="700" color="#ef4444">-{formatUSDT(tx.amount)}</Text>
                    </XStack>
                    {index < withdrawals.length - 1 && (
                      <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.04)', marginLeft: 56 }} />
                    )}
                  </View>
                ))}
              </Card>
            ) : (
              <Card backgroundColor="white" borderRadius={16} padding="$5" alignItems="center" justifyContent="center" style={{ borderStyle: 'dashed', borderWidth: 1, borderColor: '#d4d4d8' }}>
                <Wallet size={32} color="#e4e4e7" style={{ marginBottom: 10 }} />
                <Text fontSize={15} fontWeight="500" color="#717786">No withdrawal history</Text>
              </Card>
            )}
          </YStack>

        </ScrollView>
        
        {/* Full Screen Image Modal */}
        <Modal
          visible={!!fullScreenImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setFullScreenImage(null)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity 
              style={{ position: 'absolute', top: insets.top + 20, right: 20, zIndex: 100, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 }}
              onPress={() => setFullScreenImage(null)}
            >
              <X size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableWithoutFeedback onPress={() => setFullScreenImage(null)}>
              <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                {fullScreenImage && (
                  <Image 
                    source={{ uri: fullScreenImage }} 
                    style={{ width: '100%', height: '80%' }} 
                    resizeMode="contain" 
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </Modal>

      </View>
    </Theme>
  );
}
