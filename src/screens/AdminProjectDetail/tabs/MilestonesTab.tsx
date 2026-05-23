import React, { useState } from 'react';
import { View, TouchableOpacity, Image, ScrollView, Modal, Linking } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import {
  Calendar, DollarSign, ChevronDown, ChevronUp,
  Video, ExternalLink, Lightbulb, TrendingUp, AlertCircle, FileCheck, Paperclip,
} from 'lucide-react-native';
import { stripHtml, type Milestone } from '../useAdminProject';
import { fmt, fmtUSDT, MILESTONE_STATUS } from '../helpers';
import { VideoPlayerModal } from '../components/VideoPlayerModal';

// ─── Icon Chip (icon + label, tap to toggle) ──────────────────────────────────

type IconChipDef = {
  key: string;
  label: string;
  icon: React.FC<{ size: number; color: string }>;
  color: string;
  content: React.ReactNode;
};

function IconChipRow({
  chips,
  active,
  onToggle,
}: {
  chips: IconChipDef[];
  active: string | null;
  onToggle: (k: string) => void;
}) {
  if (!chips.length) return null;
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -20 }}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
    >
      {chips.map(({ key, label, icon: Icon, color }) => {
        const on = active === key;
        return (
          <TouchableOpacity
            key={key}
            activeOpacity={0.75}
            onPress={() => onToggle(key)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: on ? `${color}18` : '#f4f5f8',
            }}
          >
            <Icon size={12} color={on ? color : '#a1a1aa'} />
            <Text fontSize={11} fontWeight={on ? '700' : '500'} color={on ? color : '#a1a1aa'} numberOfLines={1}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Milestone Item ───────────────────────────────────────────────────────────

function MilestoneItem({ m, index }: { m: Milestone; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [imgViewer, setImgViewer] = useState(false);
  const [coverViewer, setCoverViewer] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const [updateImgIdx, setUpdateImgIdx] = useState(0);
  const [updateImgViewer, setUpdateImgViewer] = useState(false);
  const [isUpdateVideoModalOpen, setIsUpdateVideoModalOpen] = useState(false);

  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [blockersExpanded, setBlockersExpanded] = useState(false);
  const [proofExpanded, setProofExpanded] = useState(false);

  const meta = MILESTONE_STATUS[m.status] || MILESTONE_STATUS.PENDING;
  const firstImage = m.images?.[0];

  const toggleChip = (k: string) => setActiveChip(p => (p === k ? null : k));

  const hasUpdate = !!m.milestoneUpdates;

  const updateContent = hasUpdate && m.milestoneUpdates ? (
    <View style={{ marginTop: 4, paddingLeft: 8 }}>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$4">
        <YStack>
          <Text fontSize={15} fontWeight="700" color="#111827">Progress Report</Text>
          {m.milestoneUpdates.createdAt && (
            <Text fontSize={12} color="#9ca3af" marginTop={2}>
              Submitted on {fmt(m.milestoneUpdates.createdAt, 'MMM D, YYYY')}
            </Text>
          )}
        </YStack>
        {m.milestoneUpdates.isLate && (
          <View style={{ backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Text fontSize={10} fontWeight="700" color="#ef4444">LATE SUBMISSION</Text>
          </View>
        )}
      </XStack>

      <View style={{ position: 'relative', paddingLeft: 24 }}>
        {/* Timeline Connecting Line */}
        <View style={{ position: 'absolute', left: 4, top: 4, bottom: 12, width: 2, backgroundColor: '#f3f4f6' }} />

        {/* Section 1: Completed */}
        <YStack gap="$1" marginBottom="$4" style={{ position: 'relative' }}>
          {/* Timeline Dot */}
          <View style={{ position: 'absolute', left: -24, top: 5, width: 10, height: 10, borderRadius: 5, backgroundColor: '#d1d5db', borderWidth: 2, borderColor: 'white' }} />
          
          <TouchableOpacity activeOpacity={0.7} onPress={() => setCompletedExpanded(e => !e)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <FileCheck size={14} color="#6b7280" />
            <Text fontSize={13} fontWeight="600" color="#4b5563">Completed</Text>
            {completedExpanded ? <ChevronUp size={12} color="#a1a1aa" /> : <ChevronDown size={12} color="#a1a1aa" />}
          </TouchableOpacity>
          {completedExpanded && (
            <Text fontSize={13} color="#6b7280" lineHeight={18} marginTop={4}>{stripHtml(m.milestoneUpdates.completed)}</Text>
          )}
        </YStack>

        {/* Section 2: Blockers */}
        {m.milestoneUpdates.blockers && (
          <YStack gap="$1" marginBottom="$4" style={{ position: 'relative' }}>
            {/* Timeline Dot */}
            <View style={{ position: 'absolute', left: -24, top: 5, width: 10, height: 10, borderRadius: 5, backgroundColor: '#d1d5db', borderWidth: 2, borderColor: 'white' }} />
            
            <TouchableOpacity activeOpacity={0.7} onPress={() => setBlockersExpanded(e => !e)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={14} color="#6b7280" />
              <Text fontSize={13} fontWeight="600" color="#4b5563">Challenges</Text>
              {blockersExpanded ? <ChevronUp size={12} color="#a1a1aa" /> : <ChevronDown size={12} color="#a1a1aa" />}
            </TouchableOpacity>
            {blockersExpanded && (
              <Text fontSize={13} color="#6b7280" lineHeight={18} marginTop={4}>{stripHtml(m.milestoneUpdates.blockers)}</Text>
            )}
          </YStack>
        )}

        {/* Section 3: Media & Attachments */}
        {((m.milestoneUpdates.images && m.milestoneUpdates.images.length > 0) || m.milestoneUpdates.video || m.milestoneUpdates.link) && (
          <YStack gap="$3" style={{ position: 'relative' }}>
            {/* Timeline Dot */}
            <View style={{ position: 'absolute', left: -24, top: 5, width: 10, height: 10, borderRadius: 5, backgroundColor: '#d1d5db', borderWidth: 2, borderColor: 'white' }} />
            
            <TouchableOpacity activeOpacity={0.7} onPress={() => setProofExpanded(e => !e)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Paperclip size={14} color="#6b7280" />
              <Text fontSize={13} fontWeight="600" color="#4b5563">Proof</Text>
              {proofExpanded ? <ChevronUp size={12} color="#a1a1aa" /> : <ChevronDown size={12} color="#a1a1aa" />}
            </TouchableOpacity>

            {proofExpanded && (
              <YStack gap="$3" marginTop={2}>
                {/* Images */}
                {m.milestoneUpdates.images && m.milestoneUpdates.images.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
                    {m.milestoneUpdates.images.map((img, idx) => (
                      <TouchableOpacity key={idx} activeOpacity={0.9} onPress={() => { setUpdateImgIdx(idx); setUpdateImgViewer(true); }}>
                        <Image source={{ uri: img }} style={{ width: 100, height: 65, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }} resizeMode="cover" />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {/* Video & Links Row */}
                {(m.milestoneUpdates.video || m.milestoneUpdates.link) && (
                  <XStack gap="$2" flexWrap="wrap">
                    {m.milestoneUpdates.video && (
                      <TouchableOpacity activeOpacity={0.85} onPress={() => setIsUpdateVideoModalOpen(true)}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f5f3ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
                        <Video size={13} color="#7c3aed" />
                        <Text fontSize={12} color="#7c3aed" fontWeight="600">Proof Video</Text>
                      </TouchableOpacity>
                    )}

                    {m.milestoneUpdates.link && (
                      <TouchableOpacity activeOpacity={0.85} onPress={() => Linking.openURL(m.milestoneUpdates!.link!).catch(() => {})}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0f9ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}>
                        <ExternalLink size={13} color="#0369a1" />
                        <Text fontSize={12} color="#0369a1" fontWeight="600">External Link</Text>
                      </TouchableOpacity>
                    )}
                  </XStack>
                )}
              </YStack>
            )}
          </YStack>
        )}
      </View>
    </View>
  ) : null;

  // Build chips only for fields that exist
  const chips: IconChipDef[] = [
    hasUpdate    && { key: 'update',     label: 'Update', icon: FileCheck,  color: '#8b5cf6', content: updateContent },
    m.outcome    && { key: 'outcome',    label: 'Outcome',    icon: Lightbulb,    color: '#10b981', content: stripHtml(m.outcome) },
    m.advantages && { key: 'advantages', label: 'Advantages', icon: TrendingUp,   color: '#0ea5e9', content: stripHtml(m.advantages) },
    m.challenges && { key: 'challenges', label: 'Challenges', icon: AlertCircle,  color: '#f43f5e', content: stripHtml(m.challenges) },
  ].filter(Boolean) as IconChipDef[];

  return (
    <View>
      {/* ── Row Header ─────────────────────────────────────────────────────── */}
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => { setExpanded(e => !e); setActiveChip(null); }}
      >
        <XStack paddingHorizontal={20} paddingVertical={14} alignItems="center" gap="$3">
          {/* Thumbnail / order badge */}
          {firstImage ? (
            <TouchableOpacity activeOpacity={0.85} onPress={e => { e.stopPropagation?.(); setCoverViewer(true); }}>
              <Image source={{ uri: firstImage }} style={{ width: 42, height: 42, borderRadius: 10 }} resizeMode="cover" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: meta.bg, alignItems: 'center', justifyContent: 'center' }}>
              <Text fontSize={15} fontWeight="800" color={meta.color}>{m.order}</Text>
            </View>
          )}

          <YStack flex={1} gap={4}>
            <Text fontSize={14} fontWeight="700" color="#1a1b1f" numberOfLines={1}>{m.title}</Text>
            <XStack alignItems="center" gap="$2">
              <View style={{ backgroundColor: meta.bg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                <Text fontSize={10} fontWeight="700" color={meta.color}>{m.status}</Text>
              </View>
              <Text fontSize={12} color="#a1a1aa" fontWeight="600">{fmtUSDT(m.amount)}</Text>
              {hasUpdate && (
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#6a1bf5' }} />
              )}
            </XStack>
          </YStack>

          {expanded
            ? <ChevronUp size={16} color="#d1d5db" />
            : <ChevronDown size={16} color="#d1d5db" />}
        </XStack>
      </TouchableOpacity>

      {/* ── Expanded ───────────────────────────────────────────────────────── */}
      {expanded && (
        <YStack paddingHorizontal={20} paddingBottom={20} gap="$4">

          {/* Meta row with icons */}
          <XStack gap="$4">
            <XStack alignItems="center" gap={5}>
              <Calendar size={12} color="#d1d5db" />
              <Text fontSize={12} color="#9ca3af">{fmt(m.startDate, 'MMM D')} – {fmt(m.endDate, 'MMM D, YY')}</Text>
            </XStack>
            <XStack alignItems="center" gap={5}>
              <DollarSign size={12} color="#d1d5db" />
              <Text fontSize={12} color="#10b981" fontWeight="700">{fmtUSDT(m.amount)} USDT</Text>
            </XStack>
          </XStack>

          {/* Brief description */}
          {!!m.description && (
            <Text fontSize={13} color="#9ca3af" lineHeight={19} numberOfLines={2}>
              {stripHtml(m.description)}
            </Text>
          )}

          {/* Reference images strip */}
          {(m.images?.length ?? 0) > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
              {m.images.map((img, idx) => (
                <TouchableOpacity key={idx} activeOpacity={0.9}
                  onPress={() => { setImgIdx(idx); setImgViewer(true); }}>
                  <Image source={{ uri: img }} style={{ width: 110, height: 80, borderRadius: 10 }} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Icon chips for outcome / advantages / challenges / update */}
          {chips.length > 0 && (
            <YStack gap="$3">
              <IconChipRow chips={chips} active={activeChip} onToggle={toggleChip} />
              {activeChip && (
                <View>
                  {typeof chips.find(c => c.key === activeChip)?.content === 'string' ? (
                    <Text fontSize={13} color="#4b5563" lineHeight={20}>
                      {chips.find(c => c.key === activeChip)?.content}
                    </Text>
                  ) : (
                    chips.find(c => c.key === activeChip)?.content
                  )}
                </View>
              )}
            </YStack>
          )}

          {/* Video */}
          {!!m.video && (
            <TouchableOpacity activeOpacity={0.85} onPress={() => setIsVideoModalOpen(true)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: '#f4f5f8', alignItems: 'center', justifyContent: 'center' }}>
                <Video size={13} color="#9ca3af" />
              </View>
              <Text fontSize={12} color="#9ca3af" flex={1} numberOfLines={1}>{m.video}</Text>
            </TouchableOpacity>
          )}
        </YStack>
      )}

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 20 }} />

      {/* Cover image viewer */}
      <Modal visible={coverViewer} transparent animationType="fade" onRequestClose={() => setCoverViewer(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setCoverViewer(false)}
            style={{ position: 'absolute', top: 56, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20 }}>
            <Text color="white" fontSize={13} fontWeight="600">Close</Text>
          </TouchableOpacity>
          {firstImage && <Image source={{ uri: firstImage }} style={{ width: '100%', height: '75%' }} resizeMode="contain" />}
        </View>
      </Modal>

      {/* Reference images viewer */}
      <Modal visible={imgViewer} transparent animationType="fade" onRequestClose={() => setImgViewer(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setImgViewer(false)}
            style={{ position: 'absolute', top: 56, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20 }}>
            <Text color="white" fontSize={13} fontWeight="600">Close</Text>
          </TouchableOpacity>
          {m.images?.[imgIdx] && (
            <Image source={{ uri: m.images[imgIdx] }} style={{ width: '100%', height: '70%' }} resizeMode="contain" />
          )}
          {(m.images?.length ?? 0) > 1 && (
            <XStack gap="$2" marginTop="$4">
              {m.images.map((_: string, i: number) => (
                <TouchableOpacity key={i} onPress={() => setImgIdx(i)}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: i === imgIdx ? 'white' : 'rgba(255,255,255,0.3)' }} />
                </TouchableOpacity>
              ))}
            </XStack>
          )}
        </View>
      </Modal>

      {/* Fullscreen Video Player Modal */}
      <VideoPlayerModal 
        visible={isVideoModalOpen} 
        videoUrl={m.video ?? null} 
        onClose={() => setIsVideoModalOpen(false)} 
      />

      {/* Update images viewer */}
      <Modal visible={updateImgViewer} transparent animationType="fade" onRequestClose={() => setUpdateImgViewer(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setUpdateImgViewer(false)}
            style={{ position: 'absolute', top: 56, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20 }}>
            <Text color="white" fontSize={13} fontWeight="600">Close</Text>
          </TouchableOpacity>
          {m.milestoneUpdates?.images?.[updateImgIdx] && (
            <Image source={{ uri: m.milestoneUpdates.images[updateImgIdx] }} style={{ width: '100%', height: '70%' }} resizeMode="contain" />
          )}
          {(m.milestoneUpdates?.images?.length ?? 0) > 1 && (
            <XStack gap="$2" marginTop="$4">
              {m.milestoneUpdates!.images!.map((_: string, i: number) => (
                <TouchableOpacity key={i} onPress={() => setUpdateImgIdx(i)}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: i === updateImgIdx ? 'white' : 'rgba(255,255,255,0.3)' }} />
                </TouchableOpacity>
              ))}
            </XStack>
          )}
        </View>
      </Modal>

      {/* Fullscreen Update Video Player Modal */}
      {m.milestoneUpdates?.video && (
        <VideoPlayerModal 
          visible={isUpdateVideoModalOpen} 
          videoUrl={m.milestoneUpdates.video} 
          onClose={() => setIsUpdateVideoModalOpen(false)} 
        />
      )}
    </View>
  );
}

// ─── Milestones Tab ───────────────────────────────────────────────────────────

export function MilestonesTab({ milestones }: { milestones: Milestone[] }) {
  const sorted = [...milestones].sort((a, b) => a.order - b.order);
  if (!sorted.length) return (
    <View style={{ padding: 40, alignItems: 'center' }}>
      <Text color="#c4c4c8" fontSize={14}>No milestones defined.</Text>
    </View>
  );
  return (
    <YStack>
      {sorted.map((m, i) => <MilestoneItem key={m.id || i} m={m} index={i} />)}
    </YStack>
  );
}
