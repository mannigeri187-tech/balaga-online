import React, { createContext, useContext, useState, useEffect } from "react";
import { Account } from "@platform/shared-types";
import { supabase } from "../lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  account: Account | null;
  user: User | null;
  session: Session | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_DEV_ACCOUNT: Account = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "aarav.dev@platform.local",
  is18PlusVerified: true,
  ageVerifiedAt: new Date().toISOString(),
  subscriptionTier: "premium",
  isSuspended: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function mapUserToAccount(user: User): Account {
  return {
    id: user.id,
    email: user.email || "",
    phone: user.phone || null,
    is18PlusVerified: user.user_metadata?.is18PlusVerified ?? true,
    ageVerifiedAt: user.user_metadata?.ageVerifiedAt || new Date().toISOString(),
    subscriptionTier: user.user_metadata?.subscriptionTier || "premium",
    isSuspended: false,
    createdAt: user.created_at,
    updatedAt: user.updated_at || new Date().toISOString(),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(() => {
    return import.meta.env.DEV ? DEFAULT_DEV_ACCOUNT : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user) {
        setUser(initialSession.user);
        setAccount(mapUserToAccount(initialSession.user));
      } else {
        // Fallback to default dev account only in local development
        setAccount(import.meta.env.DEV ? DEFAULT_DEV_ACCOUNT : null);
      }
      setIsLoading(false);
    }).catch(() => {
      setAccount(import.meta.env.DEV ? DEFAULT_DEV_ACCOUNT : null);
      setIsLoading(false);
    });

    // 2. Real-time auth state subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        setUser(currentSession.user);
        setAccount(mapUserToAccount(currentSession.user));
      } else {
        setUser(null);
        setAccount(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    const result = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    return { error: result.error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    const result = await supabase.auth.signUp({ email, password });
    setIsLoading(false);
    return { error: result.error };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Continue cleanup even if network fails
    }
    setSession(null);
    setUser(null);
    setAccount(null);
  };

  return (
    <AuthContext.Provider
      value={{
        account,
        user,
        session,
        accessToken: session?.access_token || null,
        isAuthenticated: !!account,
        isLoading,
        logout,
        loginWithEmail,
        signUpWithEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
