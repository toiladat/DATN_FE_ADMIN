import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Linking } from 'react-native';
import { YStack, XStack, Text, Avatar } from 'tamagui';
import { Calendar, WalletMinimal, Copy, MapPin, Tag, Video, AlertTriangle, ExternalLink, FileText } from 'lucide-react-native';
import { stripHtml } from '../useAdminProject';
import { fmt } from '../helpers';
import { VideoPlayerModal } from '../components/VideoPlayerModal';

type InfoTabProps = {
  project: any;
  copyWallet: (addr: string) => void;
};

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
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: on ? `${color}18` : '#f4f5f8',
            }}
          >
            <Icon size={14} color={on ? color : '#a1a1aa'} />
            <Text fontSize={12} fontWeight={on ? '700' : '600'} color={on ? color : '#a1a1aa'}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </XStack>
  );
}

export function InfoTab({ project, copyWallet }: InfoTabProps) {
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const toggleChip = (k: string) => setActiveChip(p => (p === k ? null : k));
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const chips: IconChipDef[] = [
    project.description && { key: 'desc', label: 'Description', icon: FileText, color: '#0ea5e9', content: stripHtml(project.description) },
    project.risks && { key: 'risks', label: 'Risks & Challenges', icon: AlertTriangle, color: '#f59e0b', content: stripHtml(project.risks) },
  ].filter(Boolean) as IconChipDef[];

  return (
    <YStack gap="$5" paddingBottom={20}>

      {/* Owner */}
      {project.user && (
        <View>
          <Text fontSize={11} fontWeight="800" color="#a1a1aa" marginBottom={10} letterSpacing={1}> OWNER</Text>
          <XStack alignItems="center" gap="$3">
            <Avatar circular size="$5" backgroundColor="rgba(14,165,233,0.08)">
              <Avatar.Image src={project.user.avatar || ''} />
              <Avatar.Fallback alignItems="center" justifyContent="center">
                <Text fontSize={18} fontWeight="700" color="#0369a1">
                  {(project.user.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </Avatar.Fallback>
            </Avatar>
            <YStack flex={1}>
              <Text fontSize={15} fontWeight="700" color="#1a1b1f">{project.user.name || 'Unknown'}</Text>
              {project.user.email && <Text fontSize={12} color="#717786">{project.user.email}</Text>}
              {project.user.walletAddress && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => copyWallet(project.user.walletAddress!)}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, gap: 6, alignSelf: 'flex-start', marginTop: 6 }}
                >
                  <WalletMinimal size={13} color="#88848f" />
                  <Text fontSize={12} fontWeight="600" color="#1a1b1f" letterSpacing={0.3}>
                    {`${project.user.walletAddress.slice(0, 6)}...${project.user.walletAddress.slice(-4)}`}
                  </Text>
                  <Copy size={11} color="#88848f" />
                </TouchableOpacity>
              )}
            </YStack>
          </XStack>
        </View>
      )}

      {/* Meta: category, location, dates */}
      <View style={{ gap: 10 }}>
        <Text fontSize={11} fontWeight="800" color="#a1a1aa" letterSpacing={1}>PROJECT INFO</Text>
        {project.category?.name && (
          <XStack alignItems="center" gap="$3">
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#f4f5f8', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={13} color="#a1a1aa" />
            </View>
            <Text fontSize={14} color="#1a1b1f" fontWeight="600">{project.category.name}</Text>
          </XStack>
        )}
        {project.location && (
          <XStack alignItems="center" gap="$3">
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#f4f5f8', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={13} color="#a1a1aa" />
            </View>
            <Text fontSize={14} color="#1a1b1f" fontWeight="500">{project.location}</Text>
          </XStack>
        )}
        <XStack alignItems="center" gap="$3">
          <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#f4f5f8', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={13} color="#a1a1aa" />
          </View>
          <Text fontSize={14} color="#1a1b1f" fontWeight="500">
            {fmt(project.startDate, 'MMM D, YYYY')} → {fmt(project.endDate, 'MMM D, YYYY')}
          </Text>
        </XStack>
      </View>

      {/* Chips for Description and Risks */}
      {chips.length > 0 && (
        <YStack gap="$3" marginTop={4}>
          <IconChipRow chips={chips} active={activeChip} onToggle={toggleChip} />
          {activeChip && (
            <Text fontSize={14} color="#4b5563" lineHeight={22}>
              {chips.find(c => c.key === activeChip)?.content}
            </Text>
          )}
        </YStack>
      )}

      {/* Video */}
      {project.video && (
        <View>
          <Text fontSize={11} fontWeight="800" color="#a1a1aa" marginBottom={10} letterSpacing={1} marginTop={10}>VIDEO TRAILER</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsVideoModalOpen(true)}
            style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: '#1a1b1f', height: 180, alignItems: 'center', justifyContent: 'center' }}
          >
            {project.images?.[0] ? (
              <Image source={{ uri: project.images[0] }} style={{ width: '100%', height: '100%', position: 'absolute' }} resizeMode="cover" />
            ) : null}
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
              <Video size={24} color="white" />
            </View>
            <View style={{ position: 'absolute', bottom: 10, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Video size={12} color="rgba(255,255,255,0.7)" />
              <Text fontSize={11} color="rgba(255,255,255,0.7)">Tap to play video</Text>
            </View>
          </TouchableOpacity>

          <VideoPlayerModal 
            visible={isVideoModalOpen} 
            videoUrl={project.video} 
            onClose={() => setIsVideoModalOpen(false)} 
          />
        </View>
      )}

    </YStack>
  );
}
