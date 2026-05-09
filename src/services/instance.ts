import ky from 'ky';

import { authStorage } from '@/services/storage';

const prefixUrl = `${process.env.API_URL ?? ''}/`;

export const instance = ky.extend({
  headers: {
    Accept: 'application/json',
  },
  prefixUrl,
  hooks: {
    beforeRequest: [
      request => {
        const token = authStorage.getAccessToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401 && !request.url.includes('/admin-auth/refresh-token')) {
          const refreshToken = authStorage.getRefreshToken();
          if (refreshToken) {
            try {
              // Attempt to refresh token
              const res = await ky.post(`${prefixUrl}admin-auth/refresh-token`, {
                json: { refreshToken },
              }).json<{ accessToken: string; refreshToken: string }>();
              
              authStorage.setTokens(res.accessToken, res.refreshToken);
              
              // Clone the original request and retry with new token
              const retryRequest = new Request(request, {
                headers: new Headers(request.headers),
              });
              retryRequest.headers.set('Authorization', `Bearer ${res.accessToken}`);
              
              return ky(retryRequest);
            } catch (error) {
              // Refresh failed, clear tokens
              authStorage.clearTokens();
              // Trigger a global event or let the auth context handle it
              // Since AuthContext reads from MMKV, it might need to subscribe to changes.
              // We'll handle state updates in AuthContext later.
            }
          } else {
            authStorage.clearTokens();
          }
        }
        return response;
      },
    ],
  },
});
