import React, { useState, useMemo } from 'react';
import { View, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Input, Button, Theme, Card, Spinner, Avatar } from 'tamagui';
import { Search, MoreVertical, X } from 'lucide-react-native';

import { BottomNavigation } from '@/components/dashboard/BottomNavigation';
import { useUsers, User, UserStatus } from './useUsers';
import { useDebounce } from '@/hooks/useDebounce';

const FILTER_TABS = ['All', 'Blocked', 'Pending'];

function getStatusFromTab(tab: string): UserStatus | undefined {
  switch (tab) {
    case 'Blocked':
      return 'BLOCKED';
    case 'Pending':
      return 'KYC_PENDING';
    case 'All':
    default:
      return undefined;
  }
}

function Users() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 500);
  const insets = useSafeAreaInsets();

  const status = getStatusFromTab(activeTab);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useUsers({
    limit: 10,
    keyword: debouncedSearch || undefined,
    status,
  });

  const users = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const renderHeader = () => (
    <YStack space="$4" paddingBottom="$4">
      <XStack 
        backgroundColor="white" 
        borderRadius={12} 
        alignItems="center" 
        paddingHorizontal="$3"
        borderWidth={1}
        borderColor="rgba(0,0,0,0.05)"
        marginBottom="$2"
      >
        <Search color="#717786" size={20} strokeWidth={2} />
        <Input 
          flex={1} 
          unstyled 
          height={40} 
          paddingHorizontal="$3" 
          fontSize={16}
          color="#1a1b1f"
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder="Search users..."
          placeholderTextColor="$color10"
        />
        {searchValue.length > 0 && (
          <Button 
            unstyled 
            padding="$2" 
            onPress={() => setSearchValue('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X color="#a1a1aa" size={18} />
          </Button>
        )}
      </XStack>

      <View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TABS}
          keyExtractor={(item) => item}
          renderItem={({ item: tab }) => (
            <Button
              unstyled
              paddingHorizontal="$4"
              paddingVertical="$2"
              borderRadius={100}
              backgroundColor={activeTab === tab ? '#6a1bf5' : 'white'}
              borderWidth={1}
              borderColor={activeTab === tab ? '#6a1bf5' : 'rgba(0,0,0,0.05)'}
              onPress={() => setActiveTab(tab)}
              animation="bouncy"
              pressStyle={{ scale: 0.95 }}
              cursor='pointer'
              marginRight={4}
            >
              <Text 
                fontSize={13} 
                fontWeight="600" 
                color={activeTab === tab ? 'white' : '#717786'}
              >
                {tab}
              </Text>
            </Button>
          )}
        />
      </View>
    </YStack>
  );

  const renderItem = ({ item: user }: { item: User }) => {
    const initial = user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');
    return (
      <Card
        backgroundColor="white"
        borderRadius={40}
        borderWidth={1}
        borderColor="rgba(0,0,0,0.03)"
        padding="$4"
        marginBottom="$3"
      >
        <XStack alignItems="center" space="$4">
          <Avatar circular size="$5" backgroundColor="#f0effc" marginRight="$2">
            <Avatar.Image src={user.avatar || ''} />
            <Avatar.Fallback alignItems="center" justifyContent="center">
              <Text fontSize={20} fontWeight="700" color="#4c4aca">
                {initial}
              </Text>
            </Avatar.Fallback>
          </Avatar>

          <YStack flex={1} justifyContent="center" overflow="hidden">
            <Text 
              fontSize={16} 
              fontWeight="600" 
              color="#1a1b1f"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user.name || 'Unnamed User'}
            </Text>
            <Text 
              fontSize={13} 
              color="#717786" 
              marginTop={2}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user.email || user.walletAddress}
            </Text>
          </YStack>

          <YStack alignItems="flex-end" justifyContent="center" space="$2">
            <Button unstyled padding="$1" borderRadius={100} pressStyle={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
              <MoreVertical color="#717786" size={20} />
            </Button>
          </YStack>
        </XStack>
      </Card>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <YStack paddingVertical="$4" alignItems="center">
        <Spinner size="small" color="#6a1bf5" />
      </YStack>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <YStack paddingVertical="$10" alignItems="center" justifyContent="center">
          <Spinner size="large" color="#6a1bf5" />
        </YStack>
      );
    }
    if (isError) {
      return (
        <YStack paddingVertical="$10" alignItems="center" justifyContent="center">
          <Text color="#ef4444" textAlign="center">Error loading users.</Text>
          <Text color="#ef4444" fontSize={12} textAlign="center" marginTop="$2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </Text>
        </YStack>
      );
    }
    return (
      <YStack paddingVertical="$10" alignItems="center" justifyContent="center">
        <Text color="#717786">No users found.</Text>
      </YStack>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Theme name="light">
        <YStack flex={1} backgroundColor="#f8f9fc">
          
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader()}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            onEndReached={() => {
              if (hasNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: Math.max(insets.top, 16) + 16,
              paddingBottom: 120,
            }}
          />

          <BottomNavigation />
        </YStack>
      </Theme>
    </View>
  );
}

export default Users;
