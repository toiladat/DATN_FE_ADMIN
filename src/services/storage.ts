import { storage } from '@/App';

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
const REFRESH_TOKEN_KEY = 'REFRESH_TOKEN';

export const authStorage = {
  getAccessToken: () => storage.getString(ACCESS_TOKEN_KEY),
  getRefreshToken: () => storage.getString(REFRESH_TOKEN_KEY),
  
  setTokens: (accessToken: string, refreshToken: string) => {
    storage.set(ACCESS_TOKEN_KEY, accessToken);
    storage.set(REFRESH_TOKEN_KEY, refreshToken);
  },
  
  clearTokens: () => {
    storage.remove(ACCESS_TOKEN_KEY);
    storage.remove(REFRESH_TOKEN_KEY);
  },
};
