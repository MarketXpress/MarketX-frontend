"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export interface AuthUser {
  id: string;
  email: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  displayName: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  /** Access token, for callers that still need to pass a bearer header. */
  token: string | null;
  signUp: (input: SignUpInput) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

export interface SignUpInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: "BUYER" | "SELLER";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Builds the app's user from a Supabase session.
 *
 * The role comes from user metadata rather than the `profiles` table, so the
 * header can render the right navigation without waiting on a second query.
 * Metadata is client-writable, so it is a display convenience only —
 * authorization is enforced by RLS against `profiles.role`, never by this.
 */
function userFromSession(session: Session | null): AuthUser | null {
  if (!session?.user) return null;

  const metadata = session.user.user_metadata ?? {};
  const role = metadata.role;

  return {
    id: session.user.id,
    email: session.user.email ?? "",
    role: role === "SELLER" || role === "ADMIN" ? role : "BUYER",
    displayName: metadata.display_name ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);

  // Starts true: until the first session read resolves we genuinely do not
  // know whether anyone is signed in, and rendering a signed-out header in the
  // meantime makes an authenticated page flash its logged-out state.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setIsLoading(false);
    });

    // Keeps this tab in step with sign-ins, sign-outs and token refreshes,
    // including ones that happened in another tab.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signUp = useCallback(
    async ({ email, password, firstName, lastName, role }: SignUpInput) => {
      const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split("@")[0],
            first_name: firstName ?? null,
            last_name: lastName ?? null,
            role: role ?? "BUYER",
          },
        },
      });

      if (error) throw error;
    },
    [supabase],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, [supabase]);

  const value = useMemo<AuthContextType>(
    () => ({
      user: userFromSession(session),
      session,
      token: session?.access_token ?? null,
      signUp,
      signIn,
      signOut,
      isLoading,
    }),
    [session, signUp, signIn, signOut, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
