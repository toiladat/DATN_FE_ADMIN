import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { YStack, XStack, Text, Spinner, Theme } from 'tamagui';
import { ArrowLeft, Folder, Calendar, TrendingUp } from 'lucide-react-native';
import dayjs from 'dayjs';

import type { RootScreenProps, RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import {
  useUserProjects,
  STATUS_META,
  ALL_STATUSES,
  type AdminProject,
  type ProjectStatus,
} from './useUserProjects';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeFormat(ts: number | null | undefined, fmt: string): string {
  if (!ts) return 'TBA';
  const d = dayjs(ts);
  return d.isValid() ? d.format(fmt) : 'TBA';
}

function formatUSDT(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

// ─── Filter Tab ───────────────────────────────────────────────────────────────

const FILTER_TABS: Array<'all' | ProjectStatus> = ['all', ...ALL_STATUSES];

function FilterTab({
  value,
  active,
  count,
  onPress,
}: {
  value: 'all' | ProjectStatus;
  active: boolean;
  count: number;
  onPress: () => void;
}) {
  const meta = value === 'all' ? null : STATUS_META[value];
  const accent = meta?.accent ?? '#334155';
  const label = value === 'all' ? 'All' : meta!.label;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 100,
        marginRight: 8,
        backgroundColor: active ? (meta?.bgColor ?? 'rgba(30,41,59,0.06)') : 'white',
        borderWidth: 1,
        borderColor: active ? accent : 'rgba(0,0,0,0.05)',
      }}
    >
      {value !== 'all' && (
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: accent,
          }}
        />
      )}
      <Text
        fontSize={13}
        fontWeight="600"
        color={active ? (meta?.textColor ?? '#1e293b') : '#717786'}
      >
        {label}
      </Text>
      <View
        style={{
          backgroundColor: active ? accent + '18' : 'rgba(0,0,0,0.04)',
          borderRadius: 8,
          paddingHorizontal: 6,
          paddingVertical: 1,
        }}
      >
        <Text
          fontSize={11}
          fontWeight="700"
          color={active ? (meta?.textColor ?? '#1e293b') : '#a1a1aa'}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: AdminProject }) {
  const meta = STATUS_META[project.status];
  const fundPct =
    project.fundingGoal > 0
      ? Math.min(100, (project.raisedAmount / project.fundingGoal) * 100)
      : 0;
  const milestonePct =
    project.totalMilestones > 0
      ? Math.min(100, (project.completedMilestones / project.totalMilestones) * 100)
      : 0;

  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        padding: 16,
        marginBottom: 12,
        gap: 12,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      {/* Top: thumbnail + title + status */}
      <XStack alignItems="flex-start" gap="$3">
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#f4f5f8',
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.05)',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {project.image ? (
            <Image
              source={{ uri: project.image }}
              style={{ width: 52, height: 52 }}
              resizeMode="cover"
            />
          ) : (
            <Folder size={22} color="#a1a1aa" />
          )}
        </View>

        <YStack flex={1} gap="$1">
          {project.primaryCategory && (
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(0,0,0,0.04)',
                borderRadius: 6,
                paddingHorizontal: 7,
                paddingVertical: 2,
              }}
            >
              <Text fontSize={10} fontWeight="700" color="#64748b" letterSpacing={0.8}>
                {project.primaryCategory.toUpperCase()}
              </Text>
            </View>
          )}
          <Text
            fontSize={15}
            fontWeight="700"
            color="#1a1b1f"
            numberOfLines={2}
          >
            {project.title}
          </Text>
          {project.subtitle && (
            <Text fontSize={12} color="#717786" numberOfLines={1}>
              {project.subtitle}
            </Text>
          )}
        </YStack>

        {/* Status badge */}
        <View
          style={{
            backgroundColor: meta.bgColor,
            borderRadius: 10,
            paddingHorizontal: 8,
            paddingVertical: 5,
            flexShrink: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: meta.accent,
            }}
          />
          <Text fontSize={11} fontWeight="700" color={meta.textColor}>
            {meta.label}
          </Text>
        </View>
      </XStack>

      {/* Progress bar — Fundraising */}
      {project.status === 'progress' && project.fundingGoal > 0 && (
        <YStack gap="$1.5">
          <View
            style={{
              height: 5,
              width: '100%',
              backgroundColor: '#f4f5f8',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${fundPct}%`,
                backgroundColor: meta.accent,
                borderRadius: 3,
              }}
            />
          </View>
          <XStack justifyContent="space-between">
            <Text fontSize={12} fontWeight="700" color={meta.textColor}>
              {formatUSDT(project.raisedAmount)} raised
            </Text>
            <Text fontSize={12} color="#a1a1aa">
              goal {formatUSDT(project.fundingGoal)}
            </Text>
          </XStack>
        </YStack>
      )}

      {/* Progress bar — Active (milestones) */}
      {project.status === 'active' && project.totalMilestones > 0 && (
        <YStack gap="$1.5">
          <View style={{ width: '100%', height: 5, flexDirection: 'row', gap: 3 }}>
            {Array.from({ length: project.totalMilestones }).map((_, idx) => (
              <View
                key={idx}
                style={{
                  flex: 1,
                  height: '100%',
                  borderRadius: 3,
                  backgroundColor:
                    idx < project.completedMilestones ? meta.accent : '#f4f5f8',
                }}
              />
            ))}
          </View>
          <XStack justifyContent="space-between">
            <Text fontSize={12} color="#717786">
              Milestones
            </Text>
            <Text fontSize={12} fontWeight="700" color={meta.textColor}>
              {project.completedMilestones}/{project.totalMilestones}
            </Text>
          </XStack>
        </YStack>
      )}

      {/* Footer divider */}
      <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.04)' }} />

      {/* Footer: timeline + raised */}
      <XStack alignItems="center" gap="$2">
        <Calendar size={12} color="#a1a1aa" />
        <Text fontSize={12} color="#717786">
          {safeFormat(project.startDate, 'MMM D')} – {safeFormat(project.endDate, 'MMM D, YY')}
        </Text>
        {project.status !== 'progress' && project.raisedAmount > 0 && (
          <>
            <View style={{ flex: 1 }} />
            <TrendingUp size={12} color="#a1a1aa" />
            <Text fontSize={12} fontWeight="600" color="#717786">
              {formatUSDT(project.raisedAmount)}
            </Text>
          </>
        )}
      </XStack>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ status }: { status: 'all' | ProjectStatus }) {
  const label =
    status === 'all'
      ? 'No projects yet'
      : `No ${STATUS_META[status].label.toLowerCase()} projects`;
  return (
    <YStack alignItems="center" justifyContent="center" paddingVertical="$12" gap="$3">
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: 'rgba(0,0,0,0.04)',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.06)',
          borderStyle: 'dashed',
        }}
      >
        <Folder size={28} color="#a1a1aa" />
      </View>
      <Text fontSize={14} color="#717786" textAlign="center">
        {label}
      </Text>
    </YStack>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function UserProjects() {
  const route = useRoute<RootScreenProps<Paths.UserProjects>['route']>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { id, name } = route.params;

  const [activeFilter, setActiveFilter] = useState<'all' | ProjectStatus>('all');

  const {
    data: projects = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useUserProjects(id);

  const countMap = useMemo(() => {
    const map: Record<string, number> = { all: projects.length };
    ALL_STATUSES.forEach((s) => {
      map[s] = projects.filter((p) => p.status === s).length;
    });
    return map;
  }, [projects]);

  const filtered = useMemo(
    () =>
      activeFilter === 'all'
        ? projects
        : projects.filter((p) => p.status === activeFilter),
    [projects, activeFilter],
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f4f5f8', justifyContent: 'center', alignItems: 'center' }}>
        <Spinner size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <Theme name="light">
      <View style={{ flex: 1, backgroundColor: '#f4f5f8' }}>

        {/* Floating back button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={{
            position: 'absolute',
            top: insets.top + 10,
            left: 20,
            zIndex: 50,
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <ArrowLeft size={20} color="#1a1b1f" />
        </TouchableOpacity>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() =>
                navigation.navigate(Paths.AdminProjectDetail, {
                  projectId: item.id,
                  title: item.title,
                })
              }
            >
              <ProjectCard project={item} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<EmptyState status={activeFilter} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#0ea5e9"
            />
          }
          ListHeaderComponent={
            <YStack gap="$4" paddingBottom="$3">
              {/* Header */}
              <YStack gap="$0.5" paddingTop={insets.top + 56}>
                <Text fontSize={24} fontWeight="800" color="#1a1b1f" letterSpacing={-0.5}>
                  {name ? `${name}'s` : 'User'} Projects
                </Text>
                <Text fontSize={13} color="#717786">
                  {projects.length} project{projects.length !== 1 ? 's' : ''} total
                </Text>
              </YStack>

              {/* Error banner */}
              {isError && (
                <View
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.06)',
                    borderWidth: 1,
                    borderColor: 'rgba(239,68,68,0.15)',
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <Text fontSize={13} color="#ef4444">
                    {error instanceof Error ? error.message : 'Failed to load projects'}
                  </Text>
                </View>
              )}

              {/* Filter tabs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 8 }}
              >
                {FILTER_TABS.map((tab) => (
                  <FilterTab
                    key={tab}
                    value={tab}
                    active={activeFilter === tab}
                    count={countMap[tab] ?? 0}
                    onPress={() => setActiveFilter(tab)}
                  />
                ))}
              </ScrollView>
            </YStack>
          }
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
        />
      </View>
    </Theme>
  );
}
