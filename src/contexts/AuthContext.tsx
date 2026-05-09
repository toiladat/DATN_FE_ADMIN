import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authStorage } from '@/services/storage';
import { storage } from '@/App';

interface AuthContextData {
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!authStorage.getAccessToken());

  useEffect(() => {
    // Listen to changes in MMKV storage to sync state across tabs/refreshes
    // This is especially useful when instance.ts clears tokens due to 401
    const listener = storage.addOnValueChangedListener((key) => {
      if (key === 'ACCESS_TOKEN') {
        setIsAuthenticated(!!authStorage.getAccessToken());
      }
    });
    return () => {
      listener.remove();
    };
  }, []);

  const login = (accessToken: string, refreshToken: string) => {
    authStorage.setTokens(accessToken, refreshToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authStorage.clearTokens();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
