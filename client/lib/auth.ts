import { getAccessToken } from '@auth0/nextjs-auth0/client';

let cachedToken: string | null = null;
let tokenExpiry = 0;
let inflightRequest: Promise<string | null> | null = null;

const EXPIRY_BUFFER_MS = 60_000;

function decodeTokenExpiry(token: string): number | null {
  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      Math.ceil(normalized.length / 4) * 4,
      '='
    );
    const decoded = JSON.parse(atob(padded));
    if (typeof decoded.exp === 'number') {
      return decoded.exp * 1000;
    }
  } catch (error) {
    console.warn('Failed to parse Auth0 token expiry', error);
  }

  return null;
}

export async function getAuthToken(): Promise<string | null> {
  if (cachedToken && tokenExpiry - EXPIRY_BUFFER_MS > Date.now()) {
    return cachedToken;
  }

  if (inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = (async () => {
    try {
      const token = await getAccessToken();
      cachedToken = token;
      tokenExpiry = decodeTokenExpiry(token) ?? Date.now();
      return cachedToken;
    } catch (error) {
      cachedToken = null;
      tokenExpiry = 0;
      return null;
    } finally {
      inflightRequest = null;
    }
  })();

  return inflightRequest;
}

export function clearAuthTokenCache() {
  cachedToken = null;
  tokenExpiry = 0;
}
