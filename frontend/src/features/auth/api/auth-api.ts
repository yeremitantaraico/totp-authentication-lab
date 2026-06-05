import { apiRequest } from '../../../shared/api/client';
import type { LoginResult, PublicUser, TotpSetupResult } from '../types/auth.types';

export function login(email: string, password: string) {
  return apiRequest<LoginResult>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function verifyTotp(tempToken: string, code: string) {
  return apiRequest<{ accessToken: string; user: PublicUser }>(
    '/api/auth/verify-totp',
    {
      method: 'POST',
      body: JSON.stringify({ tempToken, code }),
    },
  );
}

export function fetchCurrentUser() {
  return apiRequest<{ user: PublicUser }>('/api/auth/me');
}

export function setupTotp(accountName: string) {
  return apiRequest<TotpSetupResult>('/api/auth/totp/setup', {
    method: 'POST',
    body: JSON.stringify({ accountName }),
  });
}

export function enableTotp(code: string) {
  return apiRequest<{ user: PublicUser }>('/api/auth/totp/enable', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export function disableTotp(password: string, code: string) {
  return apiRequest<{ user: PublicUser }>('/api/auth/totp/disable', {
    method: 'POST',
    body: JSON.stringify({ password, code }),
  });
}

export function dismissTotpPrompt() {
  return apiRequest<{ user: PublicUser }>('/api/auth/totp/dismiss-prompt', {
    method: 'POST',
  });
}
