'use client';

import { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/api/services/auth';
import type { MeResponse } from '@/api/interfaces/Auth';
import type { PermissionKey } from './permissions';

interface AuthContextValue {
  me: MeResponse | null;
  isLoading: boolean;
  /** True if the signed-in user holds the given permission. */
  hasPermission: (key: PermissionKey) => boolean;
  /** True if the user holds at least one of the given permissions. */
  hasAnyPermission: (keys: PermissionKey[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Loads the current user once (GET /auth/me) and exposes permission checks to
 * the whole authenticated tree. Kept separate from the login flow so any page
 * under the app shell can read the user and gate UI.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    select: (res) => res.data,
    staleTime: Infinity,
    retry: false,
  });

  const value = useMemo<AuthContextValue>(() => {
    const permissions = new Set(data?.permissions ?? []);
    return {
      me: data ?? null,
      isLoading,
      hasPermission: (key) => permissions.has(key),
      hasAnyPermission: (keys) => keys.some((k) => permissions.has(k)),
    };
  }, [data, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
