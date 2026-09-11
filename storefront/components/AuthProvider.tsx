"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type AuthContextValue = {
  user: User | null;
  /** True until the initial session check resolves — avoids briefly
   *  flashing "signed out" UI while that's still loading. */
  loading: boolean;
  signInWithGoogle: (redirectPath?: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Sends a 6-digit email OTP — used for both new-account signup and
   *  proving ownership of an email before letting someone set a password. */
  sendEmailOtp: (email: string) => Promise<void>;
  /** Verifies the OTP and, on success, signs the user in (updates `user`). */
  verifyEmailOtp: (email: string, token: string) => Promise<void>;
  /** Sets/changes the password for the *currently signed-in* user. */
  setPassword: (password: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  /** Sends a password-reset email with a link back to /reset-password. */
  sendPasswordReset: (email: string) => Promise<void>;
  /** Updates the signed-in user's display name (stored in user_metadata). */
  updateProfile: (fullName: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let supabase: ReturnType<typeof getSupabaseBrowserClient>;
    try {
      supabase = getSupabaseBrowserClient();
    } catch (error) {
      console.error("AuthProvider: Supabase not configured", error);
      // Deferred so this doesn't set state synchronously within the effect
      // body (avoids a cascading-render lint warning); still effectively
      // immediate.
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInWithGoogle(redirectPath = "/") {
    const supabase = getSupabaseBrowserClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", redirectPath);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
    if (error) {
      console.error("Google sign-in failed to start", error.message);
      throw error;
    }
    // On success, Supabase redirects the browser to Google — this function
    // never actually returns in that case.
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  async function sendEmailOtp(email: string) {
    const supabase = getSupabaseBrowserClient();
    // shouldCreateUser: true so this doubles as signup — an existing user
    // just gets a sign-in code instead of an error.
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) {
      console.error("Failed to send email OTP", error.message);
      throw error;
    }
  }

  async function verifyEmailOtp(email: string, token: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (error) {
      console.error("Failed to verify email OTP", error.message);
      throw error;
    }
    setUser(data.user);
  }

  async function setPassword(password: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error("Failed to set password", error.message);
      throw error;
    }
    setUser(data.user);
  }

  async function signInWithPassword(email: string, password: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Password sign-in failed", error.message);
      throw error;
    }
    setUser(data.user);
  }

  async function sendPasswordReset(email: string) {
    const supabase = getSupabaseBrowserClient();
    const redirectTo = new URL("/reset-password", window.location.origin).toString();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      console.error("Failed to send password reset email", error.message);
      throw error;
    }
  }

  async function updateProfile(fullName: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    if (error) {
      console.error("Failed to update profile", error.message);
      throw error;
    }
    setUser(data.user);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOut,
        sendEmailOtp,
        verifyEmailOtp,
        setPassword,
        signInWithPassword,
        sendPasswordReset,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
