import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setUnauthorizedHandler } from '@/services/api';
import { TOKEN_STORAGE_KEY } from '@/constants/config';
import { LoginRequest, TokenResponse, UserResponse } from '@/types/api';

interface AuthContextValue {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore errors — we clear the session regardless
    }
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Register 401 handler so axios interceptor can trigger logout
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(() => {});
  }, [logout]);

  // Bootstrap: restore session from storage on app start
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        if (stored) {
          setToken(stored);
          const { data } = await api.get<UserResponse>('/profile/me');
          setUser(data);
        }
      } catch {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const body: LoginRequest = { email, password };
    const { data } = await api.post<TokenResponse>('/auth/login', body);
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
    setToken(data.access_token);
    const profile = await api.get<UserResponse>('/profile/me');
    setUser(profile.data);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
