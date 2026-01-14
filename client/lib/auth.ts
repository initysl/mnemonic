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

  inflightRequest = fetch('/auth/access-token')
    .then(async (response) => {
      if (!response.ok) {
        cachedToken = null;
        tokenExpiry = 0;
        return null;
      }

      const data = (await response.json()) as { token?: string };
      if (!data.token) {
        cachedToken = null;
        tokenExpiry = 0;
        return null;
      }

      cachedToken = data.token;
      tokenExpiry = decodeTokenExpiry(data.token) ?? Date.now();
      return cachedToken;
    })
    .finally(() => {
      inflightRequest = null;
    });

  return inflightRequest;
}

export function clearAuthTokenCache() {
  cachedToken = null;
  tokenExpiry = 0;
}
