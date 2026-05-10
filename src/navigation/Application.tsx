import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Paths } from '@/navigation/paths';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';

import { Home, Startup, Login, Users, UserWallet, UserInvestments } from '@/screens';
import UserDetail from '@/screens/UserDetail/UserDetail';
import { useAuth } from '@/contexts/AuthContext';

const Stack = createStackNavigator<RootStackParamList>();

function ApplicationNavigator() {
  const { navigationTheme, variant } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator key={variant} screenOptions={{ headerShown: false, animation: 'none' }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen component={Home} name={Paths.Home} />
              <Stack.Screen component={Users} name={Paths.Users} />
              <Stack.Screen component={UserDetail} name={Paths.UserDetail} />
              <Stack.Screen component={UserWallet} name={Paths.UserWallet} />
              <Stack.Screen component={UserInvestments} name={Paths.UserInvestments} />
            </>
          ) : (
            <>
              <Stack.Screen component={Startup} name={Paths.Startup} />
              <Stack.Screen component={Login} name={Paths.Login} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default ApplicationNavigator;
