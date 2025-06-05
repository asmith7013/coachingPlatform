'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthenticatedUser } from '@/hooks/auth/useAuthenticatedUser';
import { AuthenticatedUser } from '@core-types/auth';
import { useUserStaff } from '@/hooks/domain/staff/useUserStaff';

type AuthContextType = AuthenticatedUser & {
  staff: ReturnType<typeof useUserStaff>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authData = useAuthenticatedUser();
  const staff = useUserStaff();
  
  return (
    <AuthContext.Provider value={{ ...authData, staff }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}