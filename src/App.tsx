import 'react-native-gesture-handler';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createMMKV } from 'react-native-mmkv';

import ApplicationNavigator from '@/navigation/Application';
import { ThemeProvider } from '@/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { TamaguiProvider } from 'tamagui';
import { PortalProvider } from '@tamagui/portal';
import tamaguiConfig from '../tamagui.config';
import '@/translations';

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      retry: false,
    },
  },
});

export const storage = createMMKV();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PortalProvider shouldAddRootHost>
        <QueryClientProvider client={queryClient}>
          <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
            <AuthProvider>
              <ThemeProvider storage={storage}>
                <ApplicationNavigator />
              </ThemeProvider>
            </AuthProvider>
          </TamaguiProvider>
        </QueryClientProvider>
      </PortalProvider>
    </GestureHandlerRootView>
  );
}

export default App;
