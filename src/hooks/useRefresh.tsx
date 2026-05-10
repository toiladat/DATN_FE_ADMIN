import React, { useState, useCallback } from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';

interface UseRefreshProps {
  refetch: () => Promise<any> | void;
  color?: string;
}

export function useRefresh({ refetch, color = '#6a1bf5' }: UseRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[color]}
      tintColor={color}
    />
  );

  return {
    refreshing,
    onRefresh,
    refreshControl,
  };
}
