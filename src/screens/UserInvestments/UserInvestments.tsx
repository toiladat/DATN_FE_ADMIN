import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Theme, Card, Spinner } from 'tamagui';
import { ArrowLeft, Box, Folder, X, Layers, Hash, Copy } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import Clipboard from '@react-native-clipboard/clipboard';

import { useUserDetail } from '../UserDetail/useUserDetail';
import { useUserInvestments } from './useUserInvestments';
import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

export default function UserInvestments() {
  const route = useRoute<RootScreenProps<Paths.UserInvestments>['route']>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id } = route.params;

  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: userDetail, isLoading: isLoadingUser } = useUserDetail(id);
  const { data: investments, isLoading: isLoadingInvestments } = useUserInvestments(id);

  const isLoading = isLoadingUser || isLoadingInvestments;

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
        <Text color="#ef4444" fontWeight="600">Error loading investments.</Text>
      </View>
    );
  }

  const { stats } = userDetail;

  const formatUSDT = (amount: number) =>
    `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USDT`;

  const truncateHash = (hash: string) => {
    if (!hash || hash.length < 12) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert("Copied", "Transaction hash copied to clipboard!"); 
  };

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
            backgroundColor="#1a1b1f" 
            borderRadius={24} 
            padding="$5" 
            marginBottom="$4" 
            overflow="hidden"
            style={{
              shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }
            }}
          >
            {/* Decorative background watermark */}
            <View style={{ position: 'absolute', top: -30, right: -20, opacity: 0.05 }}>
              <Layers size={160} color="white" />
            </View>
            <View style={{ position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.03)' }} />
            
            <YStack space="$1" position="relative" zIndex={10}>
              <Text fontSize={15} fontWeight="500" color="rgba(255,255,255,0.8)">Total Invested</Text>
              <Text fontSize={36} fontWeight="800" color="white" letterSpacing={-0.5}>
                {formatUSDT(stats.financials.totalInvestedAmount)}
              </Text>
            </YStack>
          </Card>

          {/* Investments List */}
          <YStack>
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
              <Text fontSize={18} fontWeight="700" color="#1a1b1f" letterSpacing={-0.5}>Investment History</Text>
            </XStack>
            
            {investments && investments.length > 0 ? (
              <YStack space="$3">
                {investments.map((inv) => (
                  <TouchableOpacity 
                    key={inv.id} 
                    activeOpacity={0.9} 
                    onPress={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                  >
                    <Card 
                      backgroundColor="white" 
                      borderRadius={20} 
                      padding="$3" 
                      style={{ 
                        shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, 
                        borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)'
                      }}
                    >
                      <YStack space="$3">
                        {/* Top Header: Image + Title/Date + Amount */}
                        <XStack alignItems="center" space="$3">
                          <TouchableOpacity 
                            activeOpacity={0.8}
                            onPress={() => {
                              if (inv.project.image) setFullScreenImage(inv.project.image);
                            }}
                          >
                            <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#f4f5f8', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', marginRight: 5}}>
                              {inv.project.image ? (
                                <Image source={{ uri: inv.project.image }} style={{ width: 48, height: 48 }} resizeMode="cover" />
                              ) : (
                                <Box size={20} color="#a1a1aa" />
                              )}
                            </View>
                          </TouchableOpacity>

                          <YStack flex={1} justifyContent="center">
                            <Text fontSize={16} fontWeight="700" color="#1a1b1f" numberOfLines={1}>{inv.project.title}</Text>
                            <Text fontSize={13} color="#8e8e93" marginTop={2}>{dayjs(inv.createdAt).format('DD MMM, YYYY')}</Text>
                          </YStack>

                          <Text fontSize={16} fontWeight="800" color="#10b981">+{formatUSDT(inv.amount)}</Text>
                        </XStack>

                        {/* Additional Details (Message & Hash) - ONLY SHOW IF EXPANDED */}
                        {expandedId === inv.id && (inv.content || inv.txHash) && (
                          <View style={{ marginTop: 4, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', borderStyle: 'dashed' }}>
                            <YStack space="$4">
                              {inv.content && (
                                <View style={{ flexDirection: 'row', paddingLeft: 12, borderLeftWidth: 3, borderLeftColor: '#e4e4e7' }}>
                                  <Text fontSize={14} color="#52525b" style={{ flex: 1, lineHeight: 22, fontStyle: 'italic' }}>"{inv.content}"</Text>
                                </View>
                              )}
                              {inv.txHash && (
                                <XStack justifyContent="space-between" alignItems="center">
                                  <Text fontSize={13} color="#a1a1aa" fontWeight="500">Transaction ID</Text>
                                  <TouchableOpacity 
                                    activeOpacity={0.6} 
                                    onPress={() => copyToClipboard(inv.txHash!)}
                                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f5f8', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
                                  >
                                    <Hash size={14} color="#8e8e93" style={{ marginRight: 6 }} />
                                    <Text fontSize={13} color="#1a1b1f" fontWeight="600" style={{ fontFamily: 'monospace', marginRight: 8 }}>{truncateHash(inv.txHash)}</Text>
                                    <Copy size={14} color="#8e8e93" />
                                  </TouchableOpacity>
                                </XStack>
                              )}
                            </YStack>
                          </View>
                        )}
                      </YStack>
                    </Card>
                  </TouchableOpacity>
                ))}
              </YStack>
            ) : (
              <Card backgroundColor="white" borderRadius={16} padding="$5" alignItems="center" justifyContent="center" style={{ borderStyle: 'dashed', borderWidth: 1, borderColor: '#d4d4d8' }}>
                <Folder size={32} color="#e4e4e7" style={{ marginBottom: 10 }} />
                <Text fontSize={15} fontWeight="500" color="#717786">No investment history</Text>
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
