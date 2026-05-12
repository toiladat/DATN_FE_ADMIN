import React, { useState } from 'react';
import { View, TouchableOpacity, Image, ScrollView, Modal, Linking } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import {
  Calendar, DollarSign, ChevronDown, ChevronUp,
  Video, ExternalLink, Lightbulb, TrendingUp, AlertCircle, FileCheck,
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
  content: string;
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
    <XStack gap="$2" flexWrap="wrap">
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
            <Text fontSize={11} fontWeight={on ? '700' : '500'} color={on ? color : '#a1a1aa'}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </XStack>
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

  const meta = MILESTONE_STATUS[m.status] || MILESTONE_STATUS.PENDING;
  const firstImage = m.images?.[0];

  const toggleChip = (k: string) => setActiveChip(p => (p === k ? null : k));

  // Build chips only for fields that exist
  const chips: IconChipDef[] = [
    m.outcome    && { key: 'outcome',    label: 'Outcome',    icon: Lightbulb,    color: '#10b981', content: stripHtml(m.outcome) },
    m.advantages && { key: 'advantages', label: 'Advantages', icon: TrendingUp,   color: '#0ea5e9', content: stripHtml(m.advantages) },
    m.challenges && { key: 'challenges', label: 'Challenges', icon: AlertCircle,  color: '#f43f5e', content: stripHtml(m.challenges) },
  ].filter(Boolean) as IconChipDef[];

  const hasUpdate = !!m.milestoneUpdates;

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

          {/* Icon chips for outcome / advantages / challenges */}
          {chips.length > 0 && (
            <YStack gap="$3">
              <IconChipRow chips={chips} active={activeChip} onToggle={toggleChip} />
              {activeChip && (
                <Text fontSize={13} color="#4b5563" lineHeight={20}>
                  {chips.find(c => c.key === activeChip)?.content}
                </Text>
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
