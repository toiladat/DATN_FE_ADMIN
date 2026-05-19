import React from 'react';
import { View, TouchableOpacity, Linking, Alert } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { FileText, Image as ImageIcon, ExternalLink, Archive } from 'lucide-react-native';

interface Attachment {
  id: string;
  url: string;
  category: string;
  customCategoryName?: string;
  description?: string;
}

interface AttachmentsTabProps {
  attachments?: Attachment[];
}

export function AttachmentsTab({ attachments = [] }: AttachmentsTabProps) {
  if (!attachments || attachments.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f4f5f8', borderRadius: 16, padding: 32, marginTop: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' }}>
        <Archive size={40} color="#a1a1aa" style={{ marginBottom: 12 }} />
        <Text fontSize={16} fontWeight="700" color="#1a1b1f" marginBottom={4}>No Attachments</Text>
        <Text fontSize={14} color="#717786" textAlign="center">
          This project hasn't uploaded any additional documents.
        </Text>
      </View>
    );
  }

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while opening the file.');
    }
  };

  return (
    <YStack gap="$3" marginTop="$4">
      <XStack alignItems="center" justifyContent="space-between" marginBottom="$2" paddingHorizontal="$1">
        <Text fontSize={15} fontWeight="700" color="#1a1b1f">
          Documents ({attachments.length})
        </Text>
      </XStack>

      {attachments.map((att) => {
        const isDoc = att.url.toLowerCase().match(/\.(pdf|doc|docx)$/i);
        const extMatch = att.url.match(/\.([a-zA-Z0-9]+)(?:[\?#]|$)/);
        const ext = extMatch ? extMatch[1].substring(0, 4).toUpperCase() : 'FILE';
        
        const categoryName = att.category === 'Other' && att.customCategoryName
          ? att.customCategoryName
          : att.category;

        return (
          <View
            key={att.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#e2e8f0',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: '#000',
              shadowOpacity: 0.02,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <XStack flex={1} alignItems="center" gap="$3">
              {/* Icon Container */}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: isDoc ? 'rgba(106,27,245,0.08)' : 'rgba(14,165,233,0.08)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDoc ? (
                  <FileText size={22} color="#6a1bf5" />
                ) : (
                  <ImageIcon size={22} color="#0ea5e9" />
                )}
              </View>

              {/* Info */}
              <YStack flex={1} paddingRight={12}>
                <XStack alignItems="center" gap="$2" marginBottom={2}>
                  <Text fontSize={15} fontWeight="700" color="#1a1b1f" numberOfLines={1}>
                    {categoryName}
                  </Text>
                  <View style={{ backgroundColor: '#f4f5f8', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text fontSize={10} fontWeight="700" color="#717786" letterSpacing={0.5}>
                      {ext}
                    </Text>
                  </View>
                </XStack>
                {att.description ? (
                  <Text fontSize={13} color="#717786" numberOfLines={2}>
                    {att.description}
                  </Text>
                ) : (
                  <Text fontSize={13} color="#a1a1aa" fontStyle="italic">
                    No description provided
                  </Text>
                )}
              </YStack>
            </XStack>

            {/* Action */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleOpenLink(att.url)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#f4f5f8',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ExternalLink size={18} color="#1a1b1f" />
            </TouchableOpacity>
          </View>
        );
      })}
    </YStack>
  );
}
