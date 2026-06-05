import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '../../features/auth/api/auth-api';
import type { PublicUser } from '../../features/auth/types/auth.types';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '../api/client';

interface AuthContextValue {
  user: PublicUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{
    requiresTotp: boolean;
    tempToken?: string;
  }>;
  verifyTotp: (tempToken: string, code: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (user: PublicUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }

    const result = await authApi.fetchCurrentUser();
    setUser(result.user);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshUser();
      } catch {
        clearAccessToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);

    if (result.requiresTotp) {
      return {
        requiresTotp: true,
        tempToken: result.tempToken,
      };
    }

    if (result.accessToken && result.user) {
      setAccessToken(result.accessToken);
      setUser(result.user);
    }

    return { requiresTotp: false };
  }, []);

  const verifyTotp = useCallback(async (tempToken: string, code: string) => {
    const result = await authApi.verifyTotp(tempToken, code);
    setAccessToken(result.accessToken);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  const updateUser = useCallback((nextUser: PublicUser) => {
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      verifyTotp,
      logout,
      refreshUser,
      updateUser,
    }),
    [user, isLoading, login, verifyTotp, logout, refreshUser, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
