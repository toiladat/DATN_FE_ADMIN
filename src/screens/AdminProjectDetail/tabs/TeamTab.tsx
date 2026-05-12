import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { XStack, YStack, Text, Avatar } from 'tamagui';
import { WalletMinimal, Copy, ChevronDown, ChevronUp } from 'lucide-react-native';
import { type ProjectMember } from '../useAdminProject';

type TeamTabProps = {
  members: ProjectMember[];
  copyWallet: (addr: string) => void;
};

function TeamMemberItem({ m, copyWallet, isLast }: { m: ProjectMember, copyWallet: (a: string) => void, isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const hasDesc = !!m.description;

  return (
    <View>
      <TouchableOpacity 
        activeOpacity={hasDesc ? 0.8 : 1} 
        onPress={() => hasDesc && setExpanded(!expanded)}
      >
        <YStack padding={16} paddingBottom={expanded && hasDesc ? 4 : 16}>
          {/* Main Info Row (Always visible) */}
          <XStack alignItems="center" gap="$3">
            <Avatar circular size="$5" backgroundColor="rgba(14,165,233,0.08)">
              <Avatar.Image src={m.user?.avatar || ''} />
              <Avatar.Fallback alignItems="center" justifyContent="center">
                <Text fontSize={16} fontWeight="700" color="#0369a1">
                  {(m.user?.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </Avatar.Fallback>
            </Avatar>
            
            <YStack flex={1} gap={2}>
              <Text fontSize={15} fontWeight="700" color="#1a1b1f">{m.user?.name || 'Unknown'}</Text>
              <Text fontSize={12} color="#0ea5e9" fontWeight="600">{m.role}</Text>
              
              {m.user?.walletAddress && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    copyWallet(m.user!.walletAddress!);
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, gap: 6, alignSelf: 'flex-start', marginTop: 4 }}
                >
                  <WalletMinimal size={13} color="#88848f" />
                  <Text fontSize={12} fontWeight="600" color="#1a1b1f" letterSpacing={0.3}>
                    {`${m.user.walletAddress.slice(0, 6)}...${m.user.walletAddress.slice(-4)}`}
                  </Text>
                  <Copy size={11} color="#88848f" />
                </TouchableOpacity>
              )}
            </YStack>

            {hasDesc && (
              <View style={{ padding: 4 }}>
                {expanded ? <ChevronUp size={16} color="#c4c4c8" /> : <ChevronDown size={16} color="#c4c4c8" />}
              </View>
            )}
          </XStack>

          {/* Expandable Description */}
          {expanded && hasDesc && (
            <View style={{ marginTop: 12, paddingLeft: 60, paddingBottom: 12 }}>
              <Text fontSize={13} color="#4b5563" lineHeight={20}>
                {m.description}
              </Text>
            </View>
          )}
        </YStack>
      </TouchableOpacity>
      {!isLast && <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.04)', marginHorizontal: 16 }} />}
    </View>
  );
}

export function TeamTab({ members, copyWallet }: TeamTabProps) {
  if (!members.length) return (
    <View style={{ padding: 32, alignItems: 'center' }}>
      <Text color="#717786">No team members.</Text>
    </View>
  );
  return (
    <View>
      {members.map((m, i) => (
        <TeamMemberItem 
          key={m.userId} 
          m={m} 
          copyWallet={copyWallet} 
          isLast={i === members.length - 1} 
        />
      ))}
    </View>
  );
}
