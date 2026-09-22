import Constants from 'expo-constants';

export const SIGEF_DISCOVERY = {
  authorizationEndpoint: 'https://sigef.funvaltech.cloud/oauth/authorize',
  tokenEndpoint: 'https://sigef.funvaltech.cloud/oauth/token',
};

export const SIGEF_BASE_URL = 'https://sigef.funvaltech.cloud';
export const SIGEF_SCOPES = ['openid', 'profile', 'email'];

const oauthExtra = Constants.expoConfig?.extra?.oauth as
  | { issuer?: string; clientId?: string; redirectUri?: string }
  | undefined;

export const SIGEF_CLIENT_ID = oauthExtra?.clientId ?? '';
export const SIGEF_REDIRECT_URI = oauthExtra?.redirectUri ?? '';

if (!SIGEF_CLIENT_ID || !SIGEF_REDIRECT_URI) {
  console.warn(
    '[oidc] Missing SIGEF OAuth config — check EXPO_OAUTH_CLIENT_ID / EXPO_OAUTH_REDIRECT_URI in .env',
  );
}
