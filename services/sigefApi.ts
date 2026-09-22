import axios from 'axios';
import { SIGEF_BASE_URL } from '@/constants/oidc';
import * as sigefAuth from '@/services/sigefAuth';

// Registered by AuthContext on mount so the interceptor can trigger logout
// without creating a circular import
export let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

const sigefApi = axios.create({
  baseURL: SIGEF_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

sigefApi.interceptors.request.use(async (config) => {
  const token = await sigefAuth.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh tokens are single-use — share one in-flight refresh across
// concurrent 401s instead of letting each request trigger its own.
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const storedRefreshToken = await sigefAuth.getRefreshToken();
  if (!storedRefreshToken) return null;
  try {
    const tokens = await sigefAuth.refreshTokens(storedRefreshToken);
    await sigefAuth.saveTokens(tokens);
    return tokens.accessToken;
  } catch {
    return null;
  }
}

sigefApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (error.response?.status === 401 && config && !config._retried) {
      config._retried = true;
      refreshPromise ??= doRefresh();
      const newToken = await refreshPromise;
      refreshPromise = null;

      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        return sigefApi(config);
      }

      await sigefAuth.clearTokens();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export default sigefApi;
