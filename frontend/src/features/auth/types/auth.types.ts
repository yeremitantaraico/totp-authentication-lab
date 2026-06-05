export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  totpEnabled: boolean;
  totpAccountName: string | null;
  showTotpSetupPrompt: boolean;
}

export interface LoginResult {
  requiresTotp: boolean;
  accessToken?: string;
  tempToken?: string;
  user?: PublicUser;
}

export interface TotpSetupResult {
  qrDataUrl: string;
  manualEntryKey: string;
  accountName: string;
  issuer: string;
}
