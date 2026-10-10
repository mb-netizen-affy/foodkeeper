"use client";

import { Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo, SplashScreen, Wordmark } from "@/components/AppChrome";
import { ensureProfile } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

type Mode = "login" | "signup";
type Msg = { type: "success" | "error"; text: string } | null;

/** Traduit les erreurs Supabase les plus courantes. */
function frError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou mot de passe incorrect.";
  if (m.includes("email not confirmed")) return "Confirme d'abord ton e-mail (regarde ta boîte mail).";
  if (m.includes("already registered")) return "Un compte existe déjà avec cet e-mail.";
  if (m.includes("rate limit")) return "Trop de tentatives, réessaie dans quelques minutes.";
  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        await ensureProfile(data.user);
        router.replace("/restaurants");
      } else setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") router.replace("/profile?reset=1");
      else if (event === "SIGNED_IN" && session?.user) {
        await ensureProfile(session.user);
        router.replace("/restaurants");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  if (!ready) return <SplashScreen />;

  const origin = window.location.origin;
  const cleanEmail = email.trim().toLowerCase();

  const switchMode = (m: Mode) => {
    setMode(m);
    setMsg(null);
    setPassword("");
    setPassword2("");
  };

  const onGoogle = async () => {
    setMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/restaurants` },
    });
    if (error) setMsg({ type: "error", text: frError(error.message) });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!cleanEmail.includes("@")) return setMsg({ type: "error", text: "Entre un e-mail valide." });

    if (mode === "signup") {
      if (!first.trim() || !last.trim()) return setMsg({ type: "error", text: "Prénom et nom requis." });
      if (password.length < 8) return setMsg({ type: "error", text: "Mot de passe trop court (8 caractères minimum)." });
      if (password !== password2) return setMsg({ type: "error", text: "Les mots de passe ne correspondent pas." });
    } else if (!password) {
      return setMsg({ type: "error", text: "Entre ton mot de passe." });
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { first_name: first.trim().slice(0, 40), last_name: last.trim().slice(0, 40) },
            emailRedirectTo: `${origin}/restaurants`,
          },
        });
        if (error) return setMsg({ type: "error", text: frError(error.message) });
        if (data.session) return; // connexion immédiate (confirmation e-mail désactivée)
        setMsg({ type: "success", text: "Compte créé ! Clique sur le lien reçu par e-mail pour l'activer." });
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) setMsg({ type: "error", text: frError(error.message) });
    } finally {
      setBusy(false);
    }
  };

  const onForgot = async () => {
    setMsg(null);
    if (!cleanEmail.includes("@")) return setMsg({ type: "error", text: "Entre d'abord ton e-mail ci-dessus." });
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo: `${origin}/profile?reset=1` });
    setBusy(false);
    setMsg(error ? { type: "error", text: frError(error.message) } : { type: "success", text: "E-mail envoyé ! Suis le lien pour choisir un nouveau mot de passe." });
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col items-center gap-3 text-center">
        <Logo size={76} />
        <h1>
          <Wordmark className="text-4xl" />
        </h1>
        <p className="text-muted">{mode === "login" ? "Ravi de te revoir ! Ton carnet t'attend." : "Note tes adresses, suis tes visites, découvre tes stats."}</p>
      </motion.header>

      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="fk-card space-y-4 p-5 !shadow-brut-lg">
        <div className="grid grid-cols-2 gap-1 rounded-2xl border-2 border-choco bg-sand p-1" role="tablist">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className="relative rounded-xl py-2 text-sm font-bold"
            >
              {mode === m && <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-xl border-2 border-choco bg-paper" />}
              <span className="relative">{m === "login" ? "Connexion" : "Inscription"}</span>
            </button>
          ))}
        </div>

        <button type="button" onClick={onGoogle} disabled={busy} className="fk-btn fk-btn-ghost w-full">
          <GoogleIcon /> Continuer avec Google
        </button>

        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-muted">
          <span className="h-0.5 flex-1 bg-choco/20" /> ou <span className="h-0.5 flex-1 bg-choco/20" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="fk-label" htmlFor="first">Prénom</label>
                <input id="first" className="fk-input" value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" disabled={busy} />
              </div>
              <div>
                <label className="fk-label" htmlFor="last">Nom</label>
                <input id="last" className="fk-input" value={last} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" disabled={busy} />
              </div>
            </div>
          )}

          <div>
            <label className="fk-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              inputMode="email"
              placeholder="toi@email.com"
              className="fk-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={busy}
            />
          </div>

          <div>
            <label className="fk-label" htmlFor="password">Mot de passe</label>
            <div className="relative">
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                className="fk-input !pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-choco"
                aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {mode === "signup" && <p className="mt-1 text-xs text-muted">8 caractères minimum.</p>}
          </div>

          {mode === "signup" && (
            <div>
              <label className="fk-label" htmlFor="password2">Confirmer le mot de passe</label>
              <input
                id="password2"
                type={showPwd ? "text" : "password"}
                className="fk-input"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                autoComplete="new-password"
                disabled={busy}
              />
              {password2 && password !== password2 && <p className="mt-1 text-xs font-bold text-danger">Les mots de passe ne correspondent pas.</p>}
            </div>
          )}

          <button type="submit" disabled={busy} className="fk-btn fk-btn-primary w-full">
            {busy ? "…" : mode === "signup" ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>

        {mode === "login" && (
          <button type="button" onClick={onForgot} disabled={busy} className="mx-auto block text-sm font-bold underline decoration-paprika decoration-2 underline-offset-4">
            Mot de passe oublié ?
          </button>
        )}

        {msg && (
          <p
            role="status"
            className={`rounded-2xl border-2 p-3 text-sm font-semibold ${
              msg.type === "error" ? "border-danger bg-paper text-danger" : "border-choco bg-sand"
            }`}
          >
            {msg.text}
          </p>
        )}
      </motion.section>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.651 32.656 29.176 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.049 6.053 29.279 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.651-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.049 6.053 29.279 4 24 4 16.318 4 9.656 8.338 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.077 0 9.748-1.946 13.256-5.107l-6.118-5.174C29.078 35.091 26.654 36 24 36c-5.154 0-9.614-3.319-11.29-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.798 2.267-2.23 4.193-4.047 5.446l.003-.002 6.118 5.174C36.945 39.021 44 34 44 24c0-1.341-.138-2.651-.389-3.917z" />
    </svg>
  );
}
