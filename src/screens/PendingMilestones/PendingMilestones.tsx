import React, { useState, useRef } from 'react';
import {
  View, FlatList, Image, TouchableOpacity, RefreshControl, Alert, Modal, Linking, ScrollView
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Video from 'react-native-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Spinner, Button } from 'tamagui';
import {
  ChevronDown, ChevronUp, Folder, Calendar, CheckCircle2, XCircle, AlertCircle, PlayCircle, ExternalLink, Lightbulb
} from 'lucide-react-native';
import dayjs from 'dayjs';

import { BottomNavigation } from '@/components/dashboard/BottomNavigation';
import { usePendingMilestones, useApproveMilestone, useRejectMilestone, type PendingMilestone } from './usePendingMilestones';
import { VideoPlayerModal } from '../AdminProjectDetail/components/VideoPlayerModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(ts: string | null | undefined, f: string) {
  if (!ts) return 'TBA';
  const d = dayjs(ts);
  return d.isValid() ? d.format(f) : 'TBA';
}

function fmtUSDT(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

// ─── Milestone Card ─────────────────────────────────────────────────────────────

function PendingMilestoneCard({
  milestone,
  onApprove,
  onReject,
  onViewProject,
  onViewImage,
  onViewVideo,
}: {
  milestone: PendingMilestone;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewProject: (projectId: string) => void;
  onViewImage: (url: string) => void;
  onViewVideo: (url: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const prevUpdate = milestone.previousMilestone?.milestoneUpdates;

  const isLate = dayjs().isAfter(dayjs(milestone.endDate));

  const swipeableRef = useRef<Swipeable>(null);

  const handleApprove = () => {
    swipeableRef.current?.close();
    // Use a tiny timeout to let the close animation begin before the alert pops up
    setTimeout(() => onApprove(milestone.id), 150);
  };

  const handleReject = () => {
    swipeableRef.current?.close();
    setTimeout(() => onReject(milestone.id), 150);
  };

  const renderLeftActions = () => (
    <View style={{ flex: 1, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 24, borderRadius: 20, marginBottom: 12, marginRight: -20 }}>
      <XStack gap="$2" alignItems="center">
        <CheckCircle2 size={24} color="white" />
        <Text fontSize={15} fontWeight="700" color="white">Approve</Text>
      </XStack>
    </View>
  );

  const renderRightActions = () => (
    <View style={{ flex: 1, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'flex-end', paddingRight: 24, borderRadius: 20, marginBottom: 12, marginLeft: -20 }}>
      <XStack gap="$2" alignItems="center">
        <Text fontSize={15} fontWeight="700" color="white">Reject</Text>
        <XCircle size={24} color="white" />
      </XStack>
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableLeftWillOpen={handleApprove}
      onSwipeableRightWillOpen={handleReject}
      friction={1.5}
      leftThreshold={40}
      rightThreshold={40}
    >
      <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' }}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setExpanded(!expanded)}>
        <XStack alignItems="center" gap="$3">
          <View style={{
            width: 56, height: 56, borderRadius: 14, overflow: 'hidden',
            backgroundColor: '#f4f5f8', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {milestone.project.images?.[0]
              ? <Image source={{ uri: milestone.project.images[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              : <Folder size={24} color="#a1a1aa" />}
          </View>

          <YStack flex={1} gap="$1">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={11} fontWeight="800" color="#6a1bf5" letterSpacing={0.5} numberOfLines={1}>
                {milestone.project.title.toUpperCase()}
              </Text>
              {isLate && (
                <View style={{ backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                  <Text fontSize={10} fontWeight="700" color="#ef4444">OVERDUE</Text>
                </View>
              )}
            </XStack>
            
            <Text fontSize={16} fontWeight="700" color="#1a1b1f" numberOfLines={1}>{milestone.title}</Text>
            
            <XStack alignItems="center" gap="$2" marginTop={4}>
              <View style={{ backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                <Text fontSize={11} fontWeight="800" color="#059669">{fmtUSDT(milestone.amount)}</Text>
              </View>
              <Text fontSize={12} color="#d1d5db">•</Text>
              <XStack alignItems="center" gap="$1">
                <Calendar size={12} color="#a1a1aa" />
                <Text fontSize={12} color="#717786" fontWeight="500">
                  {fmt(milestone.endDate, 'MMM D, YYYY')}
                </Text>
              </XStack>
            </XStack>
          </YStack>

          <View style={{ padding: 4 }}>
            {expanded ? <ChevronUp size={20} color="#a1a1aa" /> : <ChevronDown size={20} color="#a1a1aa" />}
          </View>
        </XStack>
      </TouchableOpacity>

      {/* Expanded Report Area */}
      {expanded && (
        <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f4f5f8' }}>
          {prevUpdate ? (
            <YStack gap="$4">
              <Text fontSize={13} fontWeight="700" color="#1a1b1f">PREVIOUS PHASE UPDATE</Text>
              
              {/* Text Chips */}
              <XStack gap="$2" flexWrap="wrap">
                {!!prevUpdate.completed && (
                  <TouchableOpacity 
                    activeOpacity={0.7} 
                    onPress={() => setActiveChip(activeChip === 'completed' ? null : 'completed')}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: activeChip === 'completed' ? 'rgba(16,185,129,0.1)' : '#f4f5f8' }}
                  >
                    <Lightbulb size={14} color={activeChip === 'completed' ? '#10b981' : '#717786'} />
                    <Text fontSize={12} fontWeight={activeChip === 'completed' ? '700' : '600'} color={activeChip === 'completed' ? '#10b981' : '#717786'}>What was completed</Text>
                  </TouchableOpacity>
                )}
                {!!prevUpdate.blockers && (
                  <TouchableOpacity 
                    activeOpacity={0.7} 
                    onPress={() => setActiveChip(activeChip === 'blockers' ? null : 'blockers')}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: activeChip === 'blockers' ? 'rgba(239,68,68,0.1)' : '#f4f5f8' }}
                  >
                    <AlertCircle size={14} color={activeChip === 'blockers' ? '#ef4444' : '#717786'} />
                    <Text fontSize={12} fontWeight={activeChip === 'blockers' ? '700' : '600'} color={activeChip === 'blockers' ? '#ef4444' : '#717786'}>Blockers & Issues</Text>
                  </TouchableOpacity>
                )}
              </XStack>

              {/* Expanded Text Content */}
              {activeChip === 'completed' && (
                <View style={{ backgroundColor: 'rgba(16,185,129,0.05)', padding: 12, borderRadius: 12 }}>
                  <Text fontSize={14} color="#059669" lineHeight={20}>{prevUpdate.completed}</Text>
                </View>
              )}
              {activeChip === 'blockers' && (
                <View style={{ backgroundColor: 'rgba(239,68,68,0.05)', padding: 12, borderRadius: 12 }}>
                  <Text fontSize={14} color="#ef4444" lineHeight={20}>{prevUpdate.blockers}</Text>
                </View>
              )}

              {/* Media */}
              {(prevUpdate.images?.length > 0 || prevUpdate.video || prevUpdate.link) && (
                <YStack gap="$2" marginTop={8}>
                  <Text fontSize={12} fontWeight="600" color="#717786">Attached Media</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                    {!!prevUpdate.video && (
                      <TouchableOpacity activeOpacity={0.8} onPress={() => onViewVideo(prevUpdate.video!)}>
                        <View style={{ width: 100, height: 100, borderRadius: 12, backgroundColor: '#000', overflow: 'hidden' }}>
                          <Video 
                            source={{ uri: prevUpdate.video }} 
                            style={{ width: '100%', height: '100%', opacity: 0.6 }} 
                            resizeMode="cover" 
                            paused={true} 
                          />
                          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                            <PlayCircle size={32} color="white" />
                          </View>
                        </View>
                      </TouchableOpacity>
                    )}
                    {prevUpdate.images?.map((img, i) => (
                      <TouchableOpacity key={i} activeOpacity={0.8} onPress={() => onViewImage(img)}>
                        <Image source={{ uri: img }} style={{ width: 100, height: 100, borderRadius: 12, backgroundColor: '#f4f5f8' }} />
                      </TouchableOpacity>
                    ))}
                    {!!prevUpdate.link && (
                      <TouchableOpacity activeOpacity={0.8} onPress={() => Linking.openURL(prevUpdate.link!)}>
                        <View style={{ width: 100, height: 100, borderRadius: 12, backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center' }}>
                          <ExternalLink size={32} color="#a855f7" />
                          <Text fontSize={11} color="#a855f7" marginTop={8} fontWeight="600">Link</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </YStack>
              )}

              {/* Action Buttons */}
              <YStack gap="$3" marginTop={12}>
                <Button 
                  width="100%"
                  backgroundColor="#f4f5f8" 
                  color="#1a1b1f" 
                  icon={<ExternalLink size={16} color="#717786" />}
                  borderRadius={12}
                  height={40}
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => onViewProject(milestone.projectId)}
                >
                  <Text fontWeight="600" color="#4b5563">View Full Project</Text>
                </Button>
              </YStack>
            </YStack>
          ) : (
            <YStack gap="$4" alignItems="center" paddingVertical="$4">
              <AlertCircle size={32} color="#f59e0b" />
              <Text fontSize={14} color="#717786" textAlign="center" paddingHorizontal="$4">
                The founder has not submitted an update report for the previous phase.
              </Text>
              <YStack gap="$2" width="100%" marginTop={8}>
                <Button 
                  width="100%"
                  backgroundColor="#f4f5f8" 
                  color="#1a1b1f" 
                  icon={<ExternalLink size={16} color="#717786" />}
                  borderRadius={12}
                  height={44}
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => onViewProject(milestone.projectId)}
                >
                  <Text fontWeight="600" color="#4b5563">View Full Project</Text>
                </Button>
              </YStack>
            </YStack>
          )}
        </View>
      )}
    </View>
    </Swipeable>
  );
}

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PendingMilestones() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { data, isLoading, refetch, isRefetching } = usePendingMilestones();
  const approveMutation = useApproveMilestone();
  const rejectMutation = useRejectMilestone();

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    Alert.alert('Approve Phase', 'Are you sure you want to approve this phase? Funds will be unlocked.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', style: 'default', onPress: () => approveMutation.mutate(id) },
    ]);
  };

  const handleReject = (id: string) => {
    Alert.prompt(
      'Reject Phase & Fail Project',
      'Please enter the reason for rejection. This will mark the project as FAILED.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive', 
          onPress: (reason?: string) => {
            if (!reason) {
              Alert.alert('Error', 'Reason is required.');
              return;
            }
            rejectMutation.mutate({ milestoneId: id, reason });
          }
        },
      ],
      'plain-text'
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text fontSize={28} fontWeight="800" color="#1a1b1f" letterSpacing={-0.5}>
          Phase Approvals
        </Text>
        <Text fontSize={15} color="#717786" marginTop={4}>
          Review reports and unlock funding phases
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Spinner size="large" color="#6a1bf5" />
        </View>
      ) : (
        <FlatList
          data={data || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6a1bf5" />}
          renderItem={({ item }) => (
            <PendingMilestoneCard 
              milestone={item} 
              onApprove={handleApprove}
              onReject={handleReject}
              onViewProject={(id) => navigation.navigate(Paths.AdminProjectDetail, { projectId: id, title: item.project.title })}
              onViewImage={setActiveImage}
              onViewVideo={setActiveVideo}
            />
          )}
          ListEmptyComponent={
            <YStack alignItems="center" justifyContent="center" paddingVertical={60} gap="$4">
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#f4f5f8', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={32} color="#a1a1aa" />
              </View>
              <Text fontSize={16} fontWeight="600" color="#717786">All caught up!</Text>
              <Text fontSize={14} color="#a1a1aa">No phases require approval right now.</Text>
            </YStack>
          }
        />
      )}

      <BottomNavigation />

      {/* Image Viewer Modal */}
      <Modal visible={!!activeImage} transparent animationType="fade" onRequestClose={() => setActiveImage(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity style={{ position: 'absolute', top: insets.top + 20, right: 20, zIndex: 10, padding: 8 }} onPress={() => setActiveImage(null)}>
            <XCircle color="white" size={32} />
          </TouchableOpacity>
          {activeImage && <Image source={{ uri: activeImage }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />}
        </View>
      </Modal>

      {/* Video Player Modal */}
      <VideoPlayerModal 
        visible={!!activeVideo} 
        videoUrl={activeVideo || ''} 
        onClose={() => setActiveVideo(null)} 
      />
    </View>
  );
}
