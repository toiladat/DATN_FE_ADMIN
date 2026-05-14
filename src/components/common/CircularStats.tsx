import React, { useState } from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { XStack, YStack, Text, Card } from 'tamagui';
import Svg, { Circle } from 'react-native-svg';
import { ProjectStats } from '@/services/dashboard';

interface CircularStatsProps {
  stats: ProjectStats;
  title?: string;
}

export interface CircularStatsRef {
  clearSelection: () => void;
}

export const CircularStats = React.forwardRef<CircularStatsRef, CircularStatsProps>(({ stats, title = 'Projects' }, ref) => {
  const [activeSegKey, setActiveSegKey] = useState<string | null>(null);

  React.useImperativeHandle(ref, () => ({
    clearSelection: () => setActiveSegKey(null),
  }));

  const total = stats.total || 1;

  const pendingPercent = stats.pending / total;
  const progressPercent = stats.fundraising / total;
  const activePercent = stats.executing / total;
  const successPercent = stats.success / total;
  const failedPercent = stats.failed / total;

  // Order: pending, progress, active, success, failed
  const segments = [
    { key: 'pending', label: 'Pending', color: '#eab308', value: stats.pending, percent: pendingPercent, rotateBase: 0 },
    { key: 'progress', label: 'Progress', color: '#3b82f6', value: stats.fundraising, percent: progressPercent, rotateBase: pendingPercent * 360 },
    { key: 'active', label: 'Active', color: '#6a1bf5', value: stats.executing, percent: activePercent, rotateBase: (pendingPercent + progressPercent) * 360 },
    { key: 'success', label: 'Success', color: '#22c55e', value: stats.success, percent: successPercent, rotateBase: (pendingPercent + progressPercent + activePercent) * 360 },
    { key: 'failed', label: 'Failed', color: '#ef4444', value: stats.failed, percent: failedPercent, rotateBase: (pendingPercent + progressPercent + activePercent + successPercent) * 360 },
  ];

  const handleSegmentPress = (key: string) => {
    setActiveSegKey((prev) => (prev === key ? null : key));
  };

  return (
    <Card backgroundColor="white" borderRadius={24} padding="$5" marginBottom="$4">
      <TouchableWithoutFeedback onPress={() => setActiveSegKey(null)}>
        <View>
          <Text fontSize={15} fontWeight="700" color="#1a1b1f" marginBottom="$4">{title}</Text>

          {/* Chart + Legend */}
          <XStack alignItems="center">
        {/* Premium Custom SVG Donut */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => {
            const { locationX, locationY } = e.nativeEvent;
            // Center is 70, 70 since width/height is 140
            const dx = locationX - 70;
            const dy = locationY - 70;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If clicked in the hole (center) or outside the donut ring, clear selection
            if (distance < 35 || distance > 70) {
              setActiveSegKey(null);
              return;
            }
            
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (angle < 0) angle += 360;
            
            let adjustedAngle = angle + 90;
            if (adjustedAngle >= 360) adjustedAngle -= 360;

            for (const seg of segments) {
              if (seg.percent > 0) {
                const startAngle = seg.rotateBase;
                const endAngle = startAngle + (seg.percent * 360);
                if (adjustedAngle >= startAngle && adjustedAngle <= endAngle) {
                  handleSegmentPress(seg.key);
                  break;
                }
              }
            }
          }}
          style={{ 
            position: 'relative', width: 140, height: 140, alignItems: 'center', justifyContent: 'center',
            shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }
          }}
        >
          <Svg width="140" height="140" viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }} pointerEvents="none">
            {/* Track */}
            <Circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(0,0,0,0.03)" strokeWidth="8" />
            
            {stats.total === 0 ? null : segments.map((seg) => {
              if (seg.percent <= 0) return null;
              
              const gapReduction = seg.percent > 0.05 ? 0.04 : 0; 
              const visualPercent = Math.max(seg.percent - gapReduction, 0.01);
              
              const isActive = activeSegKey === seg.key;
              
              return (
                <Circle
                  key={seg.key}
                  cx="50" cy="50" 
                  r="45"
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isActive ? 11 : 8}
                  strokeOpacity={activeSegKey && !isActive ? 0.25 : 1}
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={(2 * Math.PI * 45) - visualPercent * (2 * Math.PI * 45)}
                  transform={`rotate(${seg.rotateBase + (gapReduction/2 * 360)}, 50, 50)`}
                />
              );
            })}
          </Svg>

          {/* Center */}
          <View pointerEvents="none" style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
            {activeSegKey ? (
              <>
                <Text fontSize={28} fontWeight="900" color={segments.find(s => s.key === activeSegKey)?.color ?? '#1a1b1f'}>
                  {segments.find(s => s.key === activeSegKey)?.value ?? 0}
                </Text>
                <Text fontSize={10} color="#717786" fontWeight="700" textTransform="uppercase" letterSpacing={1}>
                  {segments.find(s => s.key === activeSegKey)?.label}
                </Text>
              </>
            ) : (
              <>
                <Text fontSize={28} fontWeight="900" color="#1a1b1f">{stats.total}</Text>
                <Text fontSize={10} color="#717786" fontWeight="700" textTransform="uppercase" letterSpacing={1}>Total</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Legend */}
        <YStack flex={1} marginLeft="$5" height={130} justifyContent="space-between" paddingVertical={4}>
          {segments.map((seg) => (
            <TouchableOpacity activeOpacity={0.7} key={seg.key} onPress={() => handleSegmentPress(seg.key)}>
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" space="$2">
                  <View style={{
                    width: activeSegKey === seg.key ? 10 : 8,
                    height: activeSegKey === seg.key ? 10 : 8,
                    borderRadius: 5,
                    backgroundColor: seg.color,
                    opacity: activeSegKey && activeSegKey !== seg.key ? 0.35 : 1,
                    marginRight: 6,
                  }} />
                  <Text
                    fontSize={12}
                    color={activeSegKey === seg.key ? '#1a1b1f' : '#717786'}
                    fontWeight={activeSegKey === seg.key ? '700' : '500'}
                    textTransform="uppercase"
                    letterSpacing={0.4}
                  >
                  {seg.label}
                </Text>
              </XStack>
            </XStack>
            </TouchableOpacity>
          ))}
        </YStack>
          </XStack>
        </View>
      </TouchableWithoutFeedback>
    </Card>
  );
});
