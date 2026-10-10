"use client";

// Une seule vérification de connexion pour toute la partie « app ».
// Avant, chaque page refaisait son propre supabase.auth.getUser() + redirection.

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { Locale, Profile } from "./types";

const LOCALES: Locale[] = ["fr", "en", "es", "it", "de"];

type AuthState = {
  user: User;
  profile: Profile;
  setProfile: (p: Profile) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export const EMPTY_PROFILE: Profile = { name: null, last_name: null, locale: "fr", is_public: false };

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("name,last_name,locale,is_public")
    .eq("id", userId)
    .maybeSingle();
  if (error) console.error("Erreur profil :", error.message);
  const locale = String(data?.locale ?? "fr").toLowerCase() as Locale;
  return {
    name: data?.name ?? null,
    last_name: data?.last_name ?? null,
    locale: LOCALES.includes(locale) ? locale : "fr",
    is_public: Boolean(data?.is_public),
  };
}

/** Crée la ligne `profiles` au premier login si elle n'existe pas. */
export async function ensureProfile(user: User) {
  const { data: existing, error } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (error || existing?.id) return;
  const meta = user.user_metadata ?? {};
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      name: String(meta.first_name ?? meta.given_name ?? meta.name ?? "").trim().slice(0, 40),
      last_name: String(meta.last_name ?? meta.family_name ?? "").trim().slice(0, 40),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
}

export function AuthProvider({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfileState] = useState<Profile>(EMPTY_PROFILE);

  useEffect(() => {
    let alive = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!alive) return;
      if (!data.user) {
        router.replace("/login");
        return;
      }
      const p = await fetchProfile(data.user.id);
      if (!alive) return;
      setProfileState(p);
      setUser(data.user);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) router.replace("/login");
      else if (event === "USER_UPDATED") setUser(session.user);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const setProfile = useCallback((p: Profile) => setProfileState(p), []);

  if (!user) return <>{fallback}</>;

  return <AuthContext.Provider value={{ user, profile, setProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/login";
}
