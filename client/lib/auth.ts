let cachedToken: string | null = null;
let tokenExpiry = 0;
let inflightRequest: Promise<string | null> | null = null;

const EXPIRY_BUFFER_MS = 60_000;

function decodeTokenExpiry(token: string): number | null {
  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    const decoded = JSON.parse(atob(payload));
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

  inflightRequest = fetch('/api/auth/token')
    .then(async (response) => {
      if (!response.ok) {
        cachedToken = null;
        tokenExpiry = 0;
        return null;
      }

      const data = (await response.json()) as { accessToken?: string };
      if (!data.accessToken) {
        cachedToken = null;
        tokenExpiry = 0;
        return null;
      }

      cachedToken = data.accessToken;
      tokenExpiry = decodeTokenExpiry(data.accessToken) ?? Date.now();
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
