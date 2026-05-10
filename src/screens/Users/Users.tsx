import React, { useState, useMemo } from 'react';
import { View, FlatList, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { YStack, XStack, Text, Input, Button, Theme, Card, Spinner, Avatar } from 'tamagui';
import { Search, MoreVertical, X, User as UserIcon, Folder } from 'lucide-react-native';
import { Paths } from '@/navigation/paths';

import { BottomNavigation } from '@/components/dashboard/BottomNavigation';
import { useUsers, User, UserStatus } from './useUsers';
import { useDebounce } from '@/hooks/useDebounce';
import { useRefresh } from '@/hooks/useRefresh';

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchValue, 500);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const status = getStatusFromTab(activeTab);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useUsers({
    limit: 10,
    keyword: debouncedSearch || undefined,
    status,
  });

  const { refreshControl } = useRefresh({ refetch });

  const handleToggleMenu = React.useCallback((userId: string) => {
    setOpenMenuId(current => current === userId ? null : userId);
  }, []);

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
        borderRadius={20}
        borderWidth={1}
        borderColor="rgba(0,0,0,0.03)"
        padding="$4"
        marginBottom="$3"
        overflow="visible"
        zIndex={openMenuId === user.id ? 10 : 1}
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

          <YStack alignItems="flex-end" justifyContent="center" space="$2" zIndex={10}>
            <Button 
              unstyled 
              padding="$2" 
              borderRadius={100} 
              pressStyle={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              onPress={() => handleToggleMenu(user.id)}
            >
              <MoreVertical color="#717786" size={20} />
            </Button>

            {openMenuId === user.id && (
              <YStack
                position="absolute"
                top={35}
                right={0}
                backgroundColor="white"
                padding="$1.5"
                borderRadius={14}
                borderWidth={1}
                borderColor="rgba(0,0,0,0.04)"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 10 }}
                shadowOpacity={0.08}
                shadowRadius={24}
                elevation={10}
                minWidth={160}
                zIndex={100}
                animation="bouncy"
                enterStyle={{ opacity: 0, scale: 0.95, y: -5 }}
              >
                <Button 
                  unstyled 
                  paddingVertical="$2.5" 
                  paddingHorizontal="$3" 
                  flexDirection="row" 
                  alignItems="center" 
                  justifyContent="flex-start"
                  borderRadius={10}
                  pressStyle={{ backgroundColor: '#f4f3f8' }}
                  onPress={() => {
                    setOpenMenuId(null);
                    navigation.navigate(Paths.UserDetail, { id: user.id });
                  }}
                >
                  <UserIcon color="#717786" size={16} strokeWidth={2.5} />
                  <Text fontSize={14} fontWeight="600" color="#1a1b1f" marginLeft="$3">View Details</Text>
                </Button>
                
                <YStack height={1} backgroundColor="rgba(0,0,0,0.04)" marginVertical="$1" marginHorizontal="$2" />

                <Button 
                  unstyled 
                  paddingVertical="$2.5" 
                  paddingHorizontal="$3" 
                  flexDirection="row" 
                  alignItems="center" 
                  justifyContent="flex-start"
                  borderRadius={10}
                  pressStyle={{ backgroundColor: '#f4f3f8' }}
                  onPress={() => {
                    console.log('Projects', user.id);
                    setOpenMenuId(null);
                  }}
                >
                  <Folder color="#717786" size={16} strokeWidth={2.5} />
                  <Text fontSize={14} fontWeight="600" color="#1a1b1f" marginLeft="$3">User Projects</Text>
                </Button>
              </YStack>
            )}
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
    <TouchableWithoutFeedback onPress={() => setOpenMenuId(null)}>
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
            refreshControl={refreshControl}
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
    </TouchableWithoutFeedback>
  );
}

export default Users;
