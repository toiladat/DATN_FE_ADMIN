import React from 'react';
import { View } from 'react-native';
import { XStack, YStack, Text, Avatar } from 'tamagui';
import { type Investor } from '../useAdminProject';
import { fmtUSDT } from '../helpers';

function InvestorRow({ inv, rank }: { inv: Investor; rank?: number }) {
  return (
    <XStack padding={16} alignItems="center" gap="$3">
      <Avatar circular size="$5" backgroundColor="rgba(14,165,233,0.08)">
        <Avatar.Image src={inv.avatar || ''} />
        <Avatar.Fallback alignItems="center" justifyContent="center">
          <Text fontSize={16} fontWeight="700" color="#0369a1">
            {(inv.name || '?').charAt(0).toUpperCase()}
          </Text>
        </Avatar.Fallback>
      </Avatar>
      <YStack flex={1}>
        <Text fontSize={14} fontWeight="600" color="#1a1b1f">{inv.name || 'Anonymous'}</Text>
        {inv.content ? <Text fontSize={12} color="#717786" numberOfLines={1}>{inv.content}</Text> : null}
      </YStack>
      <YStack alignItems="flex-end">
        {rank ? <Text fontSize={10} fontWeight="700" color="#a1a1aa">#{rank}</Text> : null}
        <Text fontSize={14} fontWeight="800" color="#047857">{fmtUSDT(inv.amount)}</Text>
      </YStack>
    </XStack>
  );
}

type InvestorsTabProps = {
  top: Investor[];
  recent: Investor[];
};

export function InvestorsTab({ top }: InvestorsTabProps) {
  if (!top.length) return (
    <View style={{ padding: 32, alignItems: 'center' }}>
      <Text color="#717786">No investors yet.</Text>
    </View>
  );
  return (
    <View>
      {top.map((inv, i) => (
        <View key={i}>
          <InvestorRow inv={inv} rank={i + 1} />
          {i < top.length - 1 && <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.04)', marginHorizontal: 16 }} />}
        </View>
      ))}
    </View>
  );
}
