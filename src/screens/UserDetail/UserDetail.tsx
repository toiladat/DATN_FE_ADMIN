import React from 'react';
import { View, ScrollView, TouchableOpacity, Animated, Clipboard, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Button, Theme, Card, Spinner, Avatar } from 'tamagui';
import {
  ArrowLeft, WalletMinimal, Ban, Globe, Send, PlayCircle, Briefcase,
  Mail, Phone, MapPin, Calendar, Copy, Users, AtSign, Unlock,
  Layers, ArrowDownToLine, TrendingUp, ArrowUpRight
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';

import { CircularStats, CircularStatsRef } from '@/components/common/CircularStats';

import { useUserDetail, useBanUser, useUnbanUser } from './useUserDetail';
import type { RootScreenProps, RootStackParamList } from '@/navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { Paths } from '@/navigation/paths';

// --- Contact row ---
const ContactItem = ({ icon: Icon, text, fallback }: any) => (
  <XStack alignItems="center" paddingVertical={2}>
    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(106, 27, 245, 0.06)', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={16} color="#6a1bf5" />
    </View>
    <Text fontSize={14} color={text ? '#1a1b1f' : '#a1a1aa'} fontWeight="500" flex={1} numberOfLines={1} marginLeft={10}>
      {text || fallback}
    </Text>
  </XStack>
);

// --- Financial summary row (inside a card, no individual card per item) ---
const SummaryRow = ({ icon: Icon, title, value, onPress }: any) => {
  const content = (
    <XStack alignItems="center" justifyContent="space-between" paddingVertical={10}>
      <XStack alignItems="center">
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(106, 27, 245, 0.06)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color="#6a1bf5" />
        </View>
        <Text fontSize={14} color="#717786" fontWeight="500" marginLeft={10}>{title}</Text>
      </XStack>
      <Text fontSize={14} fontWeight="700" color="#1a1b1f">{value}</Text>
    </XStack>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};


export default function UserDetail() {
  const route = useRoute<RootScreenProps<Paths.UserDetail>['route']>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const circularStatsRef = React.useRef<CircularStatsRef>(null);
  const toastOpacity = React.useRef(new Animated.Value(0)).current;

  const showToast = () => {
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const copyWallet = (address: string) => {
    Clipboard.setString(address);
    showToast();
  };

  const { data, isLoading, isError } = useUserDetail(id);
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();


  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f4f5f8', justifyContent: 'center', alignItems: 'center' }}>
        <Spinner size="large" color="#6a1bf5" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f4f5f8', justifyContent: 'center', alignItems: 'center' }}>
        <Text color="#ef4444" fontWeight="600">Error loading user details.</Text>
        <Button marginTop="$4" backgroundColor="#6a1bf5" color="white" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  const { user, stats } = data;
  const initial = user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');

  const formatCurrency = (amount: number) =>
    `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USDT`;


  return (
    <Theme name="light">
      <View style={{ flex: 1, backgroundColor: '#f4f5f8' }}>

        {/* Floating back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={{
            position: 'absolute', top: insets.top + 10, left: 20, zIndex: 50,
            width: 40, height: 40, borderRadius: 12, backgroundColor: 'white',
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
          }}
        >
          <ArrowLeft size={20} color="#1a1b1f" />
        </TouchableOpacity>

        {/* Toast */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute', bottom: 110, alignSelf: 'center', zIndex: 999,
            opacity: toastOpacity,
            backgroundColor: '#1a1b1f', borderRadius: 12,
            paddingHorizontal: 18, paddingVertical: 10,
            flexDirection: 'row', alignItems: 'center', gap: 8,
            shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
          }}
        >
          <WalletMinimal size={14} color="white"  />
          <Text color="white" fontSize={13} fontWeight="600">Wallet copied!</Text>
        </Animated.View>

        <ScrollView
          contentContainerStyle={{ paddingTop: insets.top + 62, paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => circularStatsRef.current?.clearSelection()}
        >

          {/* ── Profile Card ── */}
          <Card backgroundColor="white" borderRadius={24} padding="$5" marginBottom="$4" overflow="hidden">

            {/* Avatar + name */}
            <YStack alignItems="center" marginBottom="$5">
              <View style={{ position: 'relative', marginBottom: 14 }}>
                <Avatar circular size={88} backgroundColor="rgba(106, 27, 245, 0.06)">
                  <Avatar.Image src={user.avatar || ''} />
                  <Avatar.Fallback alignItems="center" justifyContent="center">
                    <Text fontSize={34} fontWeight="700" color="#6a1bf5">{initial}</Text>
                  </Avatar.Fallback>
                </Avatar>
              </View>

              <Text fontSize={20} fontWeight="800" color="#1a1b1f" textAlign="center" marginBottom="$2">
                {user.name || 'Unnamed User'}
              </Text>

              {/* Wallet address — click to copy */}
              {user.walletAddress ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => copyWallet(user.walletAddress!)}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: '#F5F4F6',
                    paddingHorizontal: 12, paddingVertical: 6,
                    borderRadius: 100, gap: 6,
                  }}
                >
                  <WalletMinimal size={13} color="#88848fff" />
                  <Text fontSize={12} fontWeight="600" color="#1a1b1f" letterSpacing={0.3}>
                    {`${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
                  </Text>
                  <Copy size={11} color="#88848fff" />
                </TouchableOpacity>
              ) : (
                <View style={{ backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 }}>
                  <Text fontSize={12} fontWeight="500" color="#a1a1aa">No wallet</Text>
                </View>
              )}
            </YStack>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 20 }} />
              
            {/* Contact Info */}
            <YStack space="$2">
              <ContactItem icon={Mail} text={user.email} fallback="No email" />
              <ContactItem icon={Phone} text={user.phoneNumber} fallback="No phone" />
              <ContactItem icon={MapPin} text={user.location} fallback="Unknown location" />
              <ContactItem icon={Calendar} text={dayjs(user.createdAt).format('DD MMM, YYYY')} />
            </YStack>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 20 }} />

            {/* Social Links */}
            <XStack space="$3" justifyContent="center">
              {(() => {
                const parsedSocialLinks = user.socialLinks?.map(linkStr => {
                  const [platform, ...urlParts] = linkStr.split(':');
                  return { platform, url: urlParts.join(':') };
                }) || [];

                if (user.website) {
                  parsedSocialLinks.unshift({ platform: 'website', url: user.website });
                }

                if (parsedSocialLinks.length === 0) return null;

                const getSocialIcon = (platform: string) => {
                  switch (platform.toLowerCase()) {
                    case 'youtube': return PlayCircle;
                    case 'linkedin': return Briefcase;
                    case 'telegram': return Send;
                    case 'facebook': return Users;
                    case 'twitter': return AtSign;
                    case 'website': return Globe;
                    default: return Globe;
                  }
                };

                return parsedSocialLinks.map((link, i) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <Button 
                      key={i} 
                      unstyled 
                      width={44} height={44} borderRadius={14}
                      margin="$2"
                      backgroundColor="rgba(106, 27, 245, 0.06)"
                      alignItems="center" justifyContent="center"
                      pressStyle={{ opacity: 0.6 }}
                      onPress={() => Linking.openURL(link.url).catch(() => {})}
                    >
                      <Icon size={20} color="#6a1bf5" />
                    </Button>
                  );
                });
              })()}
            </XStack>
          </Card>

          {/* ── Projects Card ── */}
          <CircularStats ref={circularStatsRef} stats={stats.projects} title="Projects" />

          {/* ── Financial Summary Card ── */}
          <Card backgroundColor="white" borderRadius={24} paddingHorizontal="$5" paddingTop="$4" paddingBottom="$2" marginBottom="$5">
            <Text fontSize={15} fontWeight="700" color="#1a1b1f" marginBottom="$1">Summary</Text>

            <SummaryRow 
              icon={Layers} 
              title="Invested" 
              value={`${stats.financials.totalInvestmentsCount} Projects`} 
              onPress={() => navigation.navigate(Paths.UserInvestments, { id })}
            />
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.05)' }} />
            <SummaryRow 
              icon={ArrowDownToLine} 
              title="Received" 
              value={formatCurrency(stats.financials.totalReceived)} 
              onPress={() => navigation.navigate(Paths.UserWallet, { id })}
            />
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.05)' }} />
            <SummaryRow icon={TrendingUp} title="Raised amount" value={formatCurrency(stats.financials.totalRaised)} />
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.05)' }} />
            <SummaryRow icon={ArrowUpRight} title="Total invested" value={formatCurrency(stats.financials.totalInvestedAmount)} />
          </Card>

          {/* ── Action Buttons ── */}
          <XStack space="$3">
            {user.status !== 'BLOCKED' ? (
              <Button
                flex={1} height={52} backgroundColor="rgba(239,68,68,0.06)" color="#ef4444"
                borderRadius={16}
                fontSize={15} fontWeight="700" icon={<Ban color="#ef4444" size={18} />}
                pressStyle={{ backgroundColor: 'rgba(239, 68, 68, 0.12)' }}
                disabled={banUserMutation.isPending}
                opacity={banUserMutation.isPending ? 0.6 : 1}
                onPress={() => {
                  Alert.alert(
                    "Ban User Confirmation",
                    `Are you sure you want to ban ${user.name}? This will lock their account immediately and send an email notification.`,
                    [
                      { text: "Cancel", style: "cancel" },
                      { 
                        text: "Confirm Ban", 
                        style: "destructive", 
                        onPress: () => banUserMutation.mutate(id) 
                      }
                    ]
                  );
                }}
              >
                {banUserMutation.isPending ? 'Banning...' : 'Ban User'}
              </Button>
            ) : (
              <Button
                flex={1} height={52} backgroundColor="rgba(16, 185, 129, 0.06)" color="#10b981"
                borderRadius={16}
                fontSize={15} fontWeight="700" icon={<Unlock color="#10b981" size={18} />}
                pressStyle={{ backgroundColor: 'rgba(16, 185, 129, 0.12)' }}
                disabled={unbanUserMutation.isPending}
                opacity={unbanUserMutation.isPending ? 0.6 : 1}
                onPress={() => {
                  Alert.alert(
                    "Unban User Confirmation",
                    `Are you sure you want to unlock ${user.name}'s account? They will regain full access to the platform.`,
                    [
                      { text: "Cancel", style: "cancel" },
                      { 
                        text: "Confirm Unban", 
                        style: "default", 
                        onPress: () => unbanUserMutation.mutate(id) 
                      }
                    ]
                  );
                }}
              >
                {unbanUserMutation.isPending ? 'Unbanning...' : 'Unban User'}
              </Button>
            )}
          </XStack>

        </ScrollView>
      </View>
    </Theme>
  );
}