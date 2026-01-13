'use client';

export const SESSION_KEY = 'mnemonic_session_id';

export const hasSession = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(SESSION_KEY);
};

export const getSession = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
};

export const createSession = (sessionId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, sessionId);
};

export const clearSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
};
