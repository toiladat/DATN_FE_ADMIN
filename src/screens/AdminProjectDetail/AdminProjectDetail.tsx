import React, { useState, useRef } from 'react';
import {
  View, ScrollView, TouchableOpacity, Image, RefreshControl,
  Animated, Clipboard, Modal, Alert, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { YStack, XStack, Text, Spinner, Theme } from 'tamagui';
import { ArrowLeft, Users, WalletMinimal, Flame, Target, Clock, Heart } from 'lucide-react-native';

import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { useAdminProject, useApproveProject, useRejectProject } from './useAdminProject';
import { fmtUSDT, TABS, type Tab } from './helpers';
import { InfoTab } from './tabs/InfoTab';
import { MilestonesTab } from './tabs/MilestonesTab';
import { TeamTab } from './tabs/TeamTab';
import { InvestorsTab } from './tabs/InvestorsTab';

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 4 }}>
      {TABS.map(t => (
        <TouchableOpacity key={t} activeOpacity={0.75} onPress={() => onChange(t)}
          style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: active === t ? '#1a1b1f' : '#f4f5f8' }}>
          <Text fontSize={13} fontWeight="600" color={active === t ? 'white' : '#717786'}>{t}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminProjectDetail() {
  const route = useRoute<RootScreenProps<Paths.AdminProjectDetail>['route']>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { projectId } = route.params;

  const [activeTab, setActiveTab] = useState<Tab>('Info');
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data: project, isLoading, isError, refetch, isRefetching } = useAdminProject(projectId);
  const approveMutation = useApproveProject(projectId);
  const rejectMutation = useRejectProject(projectId);

  const toastOpacity = useRef(new Animated.Value(0)).current;

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f4f5f8', justifyContent: 'center', alignItems: 'center' }}>
        <Spinner size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (isError || !project) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f4f5f8', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text color="#ef4444" fontWeight="600" textAlign="center">Failed to load project.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16, padding: 12 }}>
          <Text color="#0ea5e9" fontWeight="600">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fundPct = project.totalAmount > 0
    ? Math.min(100, Math.round((project.raisedAmount / project.totalAmount) * 100)) : 0;
  const daysLeft = Math.max(0, Math.ceil(
    (new Date(project.endDate).getTime() - Date.now()) / 86400000));

  const STATS = [
    { icon: Flame,  label: 'Raised',    value: fmtUSDT(project.raisedAmount),    color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
    { icon: Target, label: 'Goal',      value: fmtUSDT(project.totalAmount),      color: '#6a1bf5', bg: 'rgba(106,27,245,0.08)' },
    { icon: Clock,  label: 'Days Left', value: String(daysLeft),                  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    { icon: Heart,  label: 'Likes',     value: String(project.stats.likes),       color: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
  ];

  return (
    <Theme name="light">
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>

        {/* Back button */}
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()}
          style={{ position: 'absolute', top: insets.top + 10, left: 20, zIndex: 50, width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
          <ArrowLeft size={20} color="#1a1b1f" />
        </TouchableOpacity>

        {/* Clipboard toast */}
        <Animated.View pointerEvents="none"
          style={{ position: 'absolute', bottom: 110, alignSelf: 'center', zIndex: 999, opacity: toastOpacity, backgroundColor: '#1a1b1f', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}>
          <WalletMinimal size={14} color="white" />
          <Text color="white" fontSize={13} fontWeight="600">Wallet copied!</Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#0ea5e9" />}>

          {/* Hero image */}
          <View style={{ width: '100%', height: 240, backgroundColor: '#e2e8f0' }}>
            {project.images?.[0]
              ? <Image source={{ uri: project.images[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Users size={48} color="#a1a1aa" /></View>}
          </View>

          <YStack gap="$4" padding={16} paddingTop={16}>

            {/* Title + category badge */}
            <YStack gap="$2">
              {project.category && (
                <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(14,165,233,0.08)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text fontSize={10} fontWeight="700" color="#0369a1" letterSpacing={1}>{project.category.name.toUpperCase()}</Text>
                </View>
              )}
              <Text fontSize={22} fontWeight="800" color="#1a1b1f" letterSpacing={-0.5}>{project.title}</Text>
              <Text fontSize={14} color="#717786">{project.subtitle}</Text>
            </YStack>

            {/* Stats 2×2 */}
            <View style={{ paddingBottom: 4, marginTop: -12 }}>
              <XStack flexWrap="wrap" rowGap={16}>
                {STATS.map(({ icon: Icon, label, value, color, bg }, i) => (
                  <View key={label} style={{ width: '50%', paddingRight: i % 2 === 0 ? 8 : 0, paddingLeft: i % 2 !== 0 ? 8 : 0 }}>
                    <XStack alignItems="center" gap="$3">
                      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={18} color={color} />
                      </View>
                      <YStack flex={1}>
                        <Text fontSize={11} color="#717786" fontWeight="600" textTransform="uppercase" letterSpacing={0.5}>{label}</Text>
                        <Text fontSize={16} fontWeight="800" color="#1a1b1f" marginTop={2}>{value}</Text>
                      </YStack>
                    </XStack>
                  </View>
                ))}
              </XStack>
            </View>

            {/* Funding progress bar */}
            {project.status === 'progress' && (
              <View style={{ paddingVertical: 8 }}>
                <XStack justifyContent="space-between" marginBottom={8}>
                  <Text fontSize={12} color="#717786" fontWeight="600">Funding Progress</Text>
                  <Text fontSize={12} fontWeight="800" color="#0369a1">{fundPct}%</Text>
                </XStack>
                <View style={{ height: 6, backgroundColor: '#f4f5f8', borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${fundPct}%`, backgroundColor: '#0ea5e9', borderRadius: 3 }} />
                </View>
              </View>
            )}

            {/* Tab bar */}
            <View style={{ marginHorizontal: -20 }}>
              <TabBar active={activeTab} onChange={setActiveTab} />
            </View>

            {/* Tab content */}
            {activeTab === 'Info'       && <InfoTab project={project} copyWallet={copyWallet} />}
            {activeTab === 'Milestones' && <MilestonesTab milestones={project.milestones} />}
            {activeTab === 'Team'       && <TeamTab members={project.projectMembers} copyWallet={copyWallet} />}
            {activeTab === 'Investors'  && <InvestorsTab top={project.topInvestors} recent={project.recentInvestors} />}

            {/* Approve / Reject — pending only */}
            {project.status === 'pending' && (
              <XStack gap="$3" marginTop="$2" marginBottom="$4">
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={approveMutation.isPending}
                  onPress={() => Alert.alert('Approve Project', `Approve "${project.title}"?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Approve', onPress: () => approveMutation.mutate() },
                  ])}
                  style={{ flex: 1, height: 52, borderRadius: 16, backgroundColor: 'rgba(16,185,129,0.08)', alignItems: 'center', justifyContent: 'center', opacity: approveMutation.isPending ? 0.6 : 1 }}>
                  <Text fontSize={15} fontWeight="700" color="#047857">
                    {approveMutation.isPending ? 'Approving...' : '✓ Approve'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={rejectMutation.isPending}
                  onPress={() => setRejectModalVisible(true)}
                  style={{ flex: 1, height: 52, borderRadius: 16, backgroundColor: 'rgba(239,68,68,0.06)', alignItems: 'center', justifyContent: 'center', opacity: rejectMutation.isPending ? 0.6 : 1 }}>
                  <Text fontSize={15} fontWeight="700" color="#ef4444">
                    {rejectMutation.isPending ? 'Rejecting...' : '✕ Reject'}
                  </Text>
                </TouchableOpacity>
              </XStack>
            )}
          </YStack>
        </ScrollView>

        {/* Reject Modal */}
        <Modal visible={rejectModalVisible} transparent animationType="slide" onRequestClose={() => setRejectModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 }}>
              <Text fontSize={18} fontWeight="800" color="#1a1b1f">Reject Project</Text>
              <Text fontSize={14} color="#717786">Please provide a reason. The owner will be notified.</Text>
              <TextInput
                multiline numberOfLines={4}
                placeholder="Enter rejection reason..."
                placeholderTextColor="#a1a1aa"
                value={rejectReason}
                onChangeText={setRejectReason}
                style={{ backgroundColor: '#f4f5f8', borderRadius: 12, padding: 14, fontSize: 14, color: '#1a1b1f', minHeight: 100, textAlignVertical: 'top' }}
              />
              <XStack gap="$3">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => { setRejectModalVisible(false); setRejectReason(''); }}
                  style={{ flex: 1, height: 50, borderRadius: 14, backgroundColor: '#f4f5f8', alignItems: 'center', justifyContent: 'center' }}>
                  <Text fontSize={15} fontWeight="600" color="#717786">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={!rejectReason.trim() || rejectMutation.isPending}
                  onPress={() => rejectMutation.mutate(rejectReason.trim(), {
                    onSuccess: () => { setRejectModalVisible(false); setRejectReason(''); },
                  })}
                  style={{ flex: 1, height: 50, borderRadius: 14, backgroundColor: (!rejectReason.trim() || rejectMutation.isPending) ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.9)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text fontSize={15} fontWeight="700" color="white">
                    {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
                  </Text>
                </TouchableOpacity>
              </XStack>
            </View>
          </View>
        </Modal>

      </View>
    </Theme>
  );
}
