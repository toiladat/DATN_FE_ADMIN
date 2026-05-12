import React, { useRef } from 'react';
import {
  View, FlatList, Image, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { YStack, XStack, Text, Spinner, Avatar, Theme } from 'tamagui';
import {
  ArrowLeft, Folder, Calendar, Users, Clock, CheckCircle, XCircle,
} from 'lucide-react-native';
import dayjs from 'dayjs';

import type { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { usePendingProjects, type PendingProject } from './usePendingProjects';
import { BottomNavigation } from '@/components/dashboard/BottomNavigation';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(ts: number | null | undefined, f: string) {
  if (!ts) return 'TBA';
  const d = dayjs(ts);
  return d.isValid() ? d.format(f) : 'TBA';
}

function fmtUSDT(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function PendingProjectCard({
  project,
  onPress,
}: {
  project: PendingProject;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.92} onPress={onPress}>
      <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 12, gap: 14 }}>
        
        {/* Project info row */}
        <XStack alignItems="flex-start" gap="$3">
          <View style={{
            width: 64, height: 64, borderRadius: 14, overflow: 'hidden',
            backgroundColor: '#f4f5f8', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {project.image
              ? <Image source={{ uri: project.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              : <Folder size={24} color="#a1a1aa" />}
          </View>

          <YStack flex={1} gap="$1">
            <XStack justifyContent="space-between" alignItems="center" marginBottom={2}>
              {project.primaryCategory && (
                <Text fontSize={10} fontWeight="800" color="#0369a1" letterSpacing={0.8}>
                  {project.primaryCategory.toUpperCase()}
                </Text>
              )}
              <XStack alignItems="center" gap="$1">
                <Clock size={10} color="#a1a1aa" />
                <Text fontSize={11} fontWeight="600" color="#a1a1aa">{timeAgo(project.createdAt)}</Text>
              </XStack>
            </XStack>
            
            <Text fontSize={16} fontWeight="600" color="#1a1b1f" numberOfLines={2} lineHeight={22}>{project.title}</Text>
            
            {/* Meta data integrated beautifully */}
            <XStack alignItems="center" gap="$2" marginTop={4}>
              <View style={{ backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                <Text fontSize={11} fontWeight="800" color="#059669">{fmtUSDT(project.fundingGoal)}</Text>
              </View>
              <Text fontSize={12} color="#d1d5db">•</Text>
              <XStack alignItems="center" gap="$1">
                <Calendar size={12} color="#a1a1aa" />
                <Text fontSize={12} color="#717786" fontWeight="500">
                  {fmt(project.startDate, 'MMM D')} - {fmt(project.endDate, 'MMM D')}
                </Text>
              </XStack>
            </XStack>
          </YStack>
        </XStack>

      </View>
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <YStack alignItems="center" justifyContent="center" paddingVertical="$12" gap="$3">
      <View style={{
        width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.04)',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <CheckCircle size={28} color="#10b981" />
      </View>
      <Text fontSize={14} color="#717786" textAlign="center">All caught up!{'\n'}No pending projects to review.</Text>
    </YStack>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PendingProjects() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const { data: projects = [], isLoading, isError, refetch, isRefetching } = usePendingProjects();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f4f5f8', justifyContent: 'center', alignItems: 'center' }}>
        <Spinner size="large" color="#6a1bf5" />
      </View>
    );
  }

  return (
    <Theme name="light">
      <View style={{ flex: 1, backgroundColor: '#f4f5f8' }}>

        {/* Back button */}
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()}
          style={{
            position: 'absolute', top: insets.top + 10, left: 20, zIndex: 50,
            width: 40, height: 40, borderRadius: 12, backgroundColor: 'white',
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
          }}>
          <ArrowLeft size={20} color="#1a1b1f" />
        </TouchableOpacity>

        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PendingProjectCard
              project={item}
              onPress={() => navigation.navigate(Paths.AdminProjectDetail, {
                projectId: item.id,
                title: item.title,
              })}
            />
          )}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6a1bf5" />}
          ListHeaderComponent={
            <YStack gap="$1" paddingBottom="$4" paddingTop={insets.top + 56}>
              <XStack alignItems="center" gap="$2">
                <Text fontSize={24} fontWeight="800" color="#1a1b1f" letterSpacing={-0.5}>
                  Pending Review
                </Text>
                {projects.length > 0 && (
                  <View style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
                    <Text fontSize={13} fontWeight="800" color="#ef4444">{projects.length}</Text>
                  </View>
                )}
              </XStack>
              <Text fontSize={13} color="#717786">
                Projects awaiting your approval
              </Text>
            </YStack>
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        />
        <BottomNavigation />
      </View>
    </Theme>
  );
}
