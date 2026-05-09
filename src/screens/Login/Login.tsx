import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { instance } from '@/services/instance';
import { YStack, XStack, Text, Input, Button, Theme, Card } from 'tamagui';
import { ShieldCheck, Mail, Lock } from 'lucide-react-native';

function Login() {
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
        setErrorMsg('Invalid response from server.');
      }
    },
    onError: (error: any) => {
      setErrorMsg(error.response?.status === 401 ? 'Invalid email or password' : 'Login failed. Please try again.');
    }
  });

  const handleLogin = () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
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
            borderRadius={32}
            shadowColor="rgba(0,0,0,0.05)"
            shadowOffset={{ width: 0, height: 12 }}
            shadowOpacity={1}
            shadowRadius={32}
            paddingVertical="$8"
            paddingHorizontal="$6"
          >
            <YStack space="$5">
              <YStack alignItems="center" mb="$2">
                <View style={{ width: 64, height: 64, backgroundColor: '#f4effe', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                  <ShieldCheck color="#6a1bf5" size={32} strokeWidth={2.5} />
                </View>
                <Text fontSize={28} fontWeight="800" color="#1e2246" letterSpacing={-0.5}>
                  FundHive
                </Text>
              </YStack>

              {errorMsg ? (
                <YStack backgroundColor="rgba(244, 67, 54, 0.1)" padding="$3" borderRadius={12}>
                  <Text color="#f44336" textAlign="center" fontWeight="600" fontSize={13}>
                    {errorMsg}
                  </Text>
                </YStack>
              ) : null}

              <XStack 
                alignItems="center" 
                backgroundColor="#f8f9fc" 
                borderRadius={16} 
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
                borderRadius={16} 
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
                height={56}
                backgroundColor="#6a1bf5"
                borderRadius={16}
                onPress={handleLogin}
                disabled={loginMutation.isPending}
                animation="bouncy"
                pressStyle={{ scale: 0.98, backgroundColor: "#5811d6", opacity: 0.9 }}
                icon={loginMutation.isPending ? () => <ActivityIndicator color="white" /> : undefined}
                shadowColor="rgba(106, 27, 245, 0.3)"
                shadowOffset={{ width: 0, height: 8 }}
                shadowOpacity={1}
                shadowRadius={16}
              >
                <Text fontWeight="700" fontSize={16} color="white">
                  {loginMutation.isPending ? 'Authenticating...' : 'Sign In'}
                </Text>
              </Button>
            </YStack>
          </Card>
        </YStack>
      </KeyboardAvoidingView>
    </Theme>
  );
}

export default Login;
