import { useState, useRef } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Image, Animated } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { instance } from '@/services/instance';
import { YStack, XStack, Text, Input, Button, Theme, Card } from 'tamagui';
import { Mail, Lock } from 'lucide-react-native';

function Login() {
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (msg: string) => {
    setErrorMsg(msg);
    toastOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const loginMutation = useMutation({
    mutationFn: async () => {
      return instance.post('admin-auth/login', {
        json: { email, password }
      }).json<any>();
    },
    onSuccess: (res) => {
      const accessToken = res?.data?.accessToken || res?.accessToken;
      const refreshToken = res?.data?.refreshToken || res?.refreshToken;
      if (accessToken && refreshToken) {
        login(accessToken, refreshToken);
      } else {
        showToast('Invalid response from server.');
      }
    },
    onError: (error: any) => {
      showToast(error.response?.status === 401 ? 'Invalid email or password' : 'Login failed. Please try again.');
    }
  });

  const handleLogin = () => {
    if (!email || !password) {
      showToast('Please enter email and password');
      return;
    }
    loginMutation.mutate();
  };

  return (
    <Theme name="light">
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <YStack 
          flex={1} 
          justifyContent="center" 
          alignItems="center" 
          backgroundColor="#f8f9fc"
          padding="$5"
        >
          <Card 
            width="100%" 
            maxWidth={400}
            backgroundColor="white"
            borderRadius={16}
            paddingVertical="$8"
            paddingHorizontal="$6"
            borderWidth={1}
            borderColor="#f0f0f0"
          >
            <YStack space="$5">
              <YStack alignItems="center" mb="$2">
                <Image 
                  source={require('@/theme/assets/images/logo.png')} 
                  style={{ width: 180, height: 180, marginBottom: -25, marginTop: -20 }}
                  resizeMode="contain"
                />
                <Text fontSize={34} fontWeight="800" color="#1e2246" letterSpacing={-0.5}>
                  FundHive
                </Text>
              </YStack>

              <XStack 
                alignItems="center" 
                backgroundColor="#f8f9fc" 
                borderRadius={12} 
                paddingHorizontal="$4"
                height={56}
                marginBottom="$4"
              >
                <Mail color="#a3a6bc" size={20} strokeWidth={2.5} />
                <Input
                  flex={1}
                  unstyled
                  height="100%"
                  paddingHorizontal="$3"
                  color="#1e2246"
                  fontSize={15}
                  placeholder="admin@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </XStack>

              <XStack 
                alignItems="center" 
                backgroundColor="#f8f9fc" 
                borderRadius={12} 
                paddingHorizontal="$4"
                height={56}
                marginBottom="$4"
              >
                <Lock color="#a3a6bc" size={20} strokeWidth={2.5} />
                <Input
                  flex={1}
                  unstyled
                  height="100%"
                  paddingHorizontal="$3"
                  color="#1e2246"
                  fontSize={15}
                  placeholder="••••••••"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </XStack>

              <Button
                mt="$4"
                height={52}
                backgroundColor="#1e2246"
                borderRadius={12}
                onPress={handleLogin}
                disabled={loginMutation.isPending}
                animation="bouncy"
                pressStyle={{ scale: 0.98, backgroundColor: "#11142d", opacity: 0.9 }}
                icon={loginMutation.isPending ? () => <ActivityIndicator color="white" /> : undefined}
              >
                <Text fontWeight="700" fontSize={16} color="white">
                  {loginMutation.isPending ? 'Authenticating...' : 'Sign In'}
                </Text>
              </Button>
            </YStack>
          </Card>
        </YStack>

        {/* Toast */}
        <Animated.View
          style={{
            position: 'absolute', top: 60, alignSelf: 'center', zIndex: 999,
            opacity: toastOpacity,
            backgroundColor: '#1a1b1f', borderRadius: 12,
            paddingHorizontal: 18, paddingVertical: 12,
            shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
          }}
          pointerEvents="none"
        >
          <Text color="white" fontSize={14} fontWeight="600">{errorMsg}</Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </Theme>
  );
}

export default Login;
