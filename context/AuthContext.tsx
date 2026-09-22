import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import sigefApi, { setUnauthorizedHandler } from '@/services/sigefApi';
import * as sigefAuth from '@/services/sigefAuth';
import { AuthUser, SigefStudentProfile } from '@/types/api';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  completeLogin: (code: string, codeVerifier: string, redirectUri: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapProfileToUser(profile: SigefStudentProfile): AuthUser {
  const [firstName, ...rest] = profile.name.trim().split(/\s+/);
  return {
    sub: profile.sub,
    email: profile.email,
    full_name: profile.name,
    first_name: firstName ?? '',
    last_name: rest.join(' ') || (firstName ?? ''),
    role: profile.enrollment?.status?.name ?? 'Estudiante',
    photo_url: profile.photo_url,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await sigefAuth.clearTokens();
    setUser(null);
  }, []);

  // Register 401 handler so the sigefApi interceptor can trigger logout
  // once a refresh attempt has failed
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(() => {});
  }, [logout]);

  // Bootstrap: restore session from SecureStore on app start
  useEffect(() => {
    (async () => {
      try {
        const accessToken = await sigefAuth.getAccessToken();
        if (accessToken) {
          const { data } = await sigefApi.get<SigefStudentProfile>('/api/students/me');
          setUser(mapProfileToUser(data));
        }
      } catch {
        await sigefAuth.clearTokens();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const completeLogin = useCallback(
    async (code: string, codeVerifier: string, redirectUri: string) => {
      const tokens = await sigefAuth.exchangeCode(code, codeVerifier, redirectUri);
      await sigefAuth.saveTokens(tokens);
      const { data } = await sigefApi.get<SigefStudentProfile>('/api/students/me');
      setUser(mapProfileToUser(data));
    },
    [],
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, completeLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
