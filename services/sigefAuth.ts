import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { SIGEF_CLIENT_ID, SIGEF_DISCOVERY } from '@/constants/oidc';
import { SigefTokens } from '@/types/api';

const ACCESS_TOKEN_KEY = 'sigef_access_token';
const REFRESH_TOKEN_KEY = 'sigef_refresh_token';

export async function exchangeCode(
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<SigefTokens> {
  const result = await AuthSession.exchangeCodeAsync(
    {
      clientId: SIGEF_CLIENT_ID,
      code,
      redirectUri,
      extraParams: { code_verifier: codeVerifier },
    },
    SIGEF_DISCOVERY,
  );
  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken ?? null,
    idToken: result.idToken,
    expiresIn: result.expiresIn,
  };
}

export async function refreshTokens(refreshToken: string): Promise<SigefTokens> {
  const result = await AuthSession.refreshAsync(
    { clientId: SIGEF_CLIENT_ID, refreshToken },
    SIGEF_DISCOVERY,
  );
  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken ?? refreshToken,
    idToken: result.idToken,
    expiresIn: result.expiresIn,
  };
}

export async function saveTokens(tokens: SigefTokens): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
