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
  isEmailVerified: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ error: any; user?: User | null; unverified?: boolean }>;
  signUpWithEmail: (email: string, password: string, realm?: "socializing" | "founders") => Promise<{ error: any; user?: User | null; needsVerification?: boolean }>;
  signInWithGoogle: (realm?: "socializing" | "founders") => Promise<{ data?: any; error: any }>;
  resendVerificationEmail: (email: string) => Promise<{ error: any }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: any }>;
  updateUserPassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isVerifiedUser(u?: User | null): boolean {
  if (!u) return false;
  // Trust authoritative Supabase confirmation or trusted Google OAuth provider
  return Boolean(u.email_confirmed_at || u.confirmed_at || u.app_metadata?.provider === "google");
}

function mapUserToAccount(user: User): Account {
  const isGoogle = user.app_metadata?.provider === "google";
  return {
    id: user.id,
    email: user.email || "",
    phone: user.phone || null,
    is18PlusVerified: user.user_metadata?.is18PlusVerified ?? true,
    ageVerifiedAt: user.user_metadata?.ageVerifiedAt || new Date().toISOString(),
    emailVerifiedAt: user.email_confirmed_at || (isGoogle ? user.created_at : null),
    subscriptionTier: user.user_metadata?.subscriptionTier || "premium",
    isSuspended: false,
    createdAt: user.created_at,
    updatedAt: user.updated_at || new Date().toISOString(),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Clear legacy demo keys on mount
  useEffect(() => {
    try {
      localStorage.removeItem("balaga_demo_account");
    } catch {
      // storage unavailable
    }
  }, []);

  useEffect(() => {
    // 1. Initial authoritative session check from Supabase Auth
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (initialSession?.user && isVerifiedUser(initialSession.user)) {
        setSession(initialSession);
        setUser(initialSession.user);
        setAccount(mapUserToAccount(initialSession.user));
      } else {
        // Unverified or absent session -> enforce strict unauthenticated state
        setSession(null);
        setUser(initialSession?.user || null);
        setAccount(null);
      }
      setIsLoading(false);
    }).catch(() => {
      setSession(null);
      setUser(null);
      setAccount(null);
      setIsLoading(false);
    });

    // 2. Real-time auth state subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (currentSession?.user && isVerifiedUser(currentSession.user)) {
        setSession(currentSession);
        setUser(currentSession.user);
        setAccount(mapUserToAccount(currentSession.user));
      } else {
        setSession(null);
        setUser(currentSession?.user || null);
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        const errorMsg = error.message?.toLowerCase() || "";
        const isUnverified = errorMsg.includes("email not confirmed") ||
                             errorMsg.includes("not verified") ||
                             errorMsg.includes("confirmation");
        if (isUnverified) {
          return {
            error: { message: "Your email address has not been confirmed yet. Please verify your inbox." },
            unverified: true,
          };
        }
        return { error };
      }

      // Check authoritative verified status (email_confirmed_at or Google OAuth)
      if (!isVerifiedUser(data.user)) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setAccount(null);
        return {
          error: { message: "Email not verified. A confirmation link was sent to your email." },
          user: data.user,
          unverified: true,
        };
      }

      setSession(data.session);
      setUser(data.user);
      setAccount(mapUserToAccount(data.user));
      return { error: null, user: data.user };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    realm: "socializing" | "founders" = "socializing"
  ) => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/` : undefined;

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            initial_realm: realm,
            is18PlusVerified: true,
            ageVerifiedAt: new Date().toISOString(),
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return { error };
      }

      // Authoritative check: unconfirmed accounts MUST require email confirmation
      const isConfirmed = isVerifiedUser(data.user);
      if (!isConfirmed) {
        setSession(null);
        setUser(data.user);
        setAccount(null);
        return { error: null, user: data.user, needsVerification: true };
      }

      setSession(data.session);
      setUser(data.user);
      setAccount(data.user ? mapUserToAccount(data.user) : null);
      return { error: null, user: data.user, needsVerification: false };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (realm: "socializing" | "founders" = "socializing") => {
    setIsLoading(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("balaga_oauth_realm", realm);
      }
      const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/` : undefined;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      return { data, error };
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/` : undefined;

    return await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
  };

  const resetPasswordForEmail = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/?auth_flow=reset_password` : undefined;

    return await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: redirectUrl,
    });
  };

  const updateUserPassword = async (newPassword: string) => {
    return await supabase.auth.updateUser({ password: newPassword });
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Continue cleanup
    }
    try {
      localStorage.removeItem("balaga_demo_account");
      localStorage.removeItem("balaga_active_world");
      sessionStorage.removeItem("balaga_oauth_realm");
    } catch {
      // ignore storage errors
    }
    setSession(null);
    setUser(null);
    setAccount(null);
  };

  const isEmailVerified = isVerifiedUser(user);
  const isAuthenticated = Boolean(session && user && isEmailVerified);

  return (
    <AuthContext.Provider
      value={{
        account,
        user,
        session,
        accessToken: session?.access_token || null,
        isAuthenticated,
        isEmailVerified,
        isLoading,
        logout,
        loginWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        resendVerificationEmail,
        resetPasswordForEmail,
        updateUserPassword,
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
