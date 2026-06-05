export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: string;
  totpEnabled: boolean;
  totpSecret: string | null;
  totpPendingSecret: string | null;
  totpAccountName: string | null;
  totpPendingAccountName: string | null;
  totpSetupPromptDismissed: boolean;
}

export interface UsersDataFile {
  users: StoredUser[];
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  totpEnabled: boolean;
  totpAccountName: string | null;
  showTotpSetupPrompt: boolean;
}
