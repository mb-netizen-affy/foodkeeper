"use client";

// « Mon compte » : identité, visibilité publique, partage, sécurité.

import { KeyRound, LogOut, Mail, Pencil, Share2 } from "lucide-react";
import { useState } from "react";
import { Avatar, PageHeader, SectionTitle } from "@/components/ui/Blocks";
import { Switch } from "@/components/ui/Inputs";
import Sheet from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { signOut, useAuth } from "@/lib/auth";
import { fullName, initials } from "@/lib/format";
import { useTheme, type ThemeChoice } from "@/lib/theme";
import { supabase } from "@/lib/supabaseClient";
import type { Locale } from "@/lib/types";

const LOCALES: { value: Locale; label: string }[] = [
  { value: "fr", label: "🇫🇷 Français" },
  { value: "en", label: "🇬🇧 English" },
  { value: "es", label: "🇪🇸 Español" },
  { value: "it", label: "🇮🇹 Italiano" },
  { value: "de", label: "🇩🇪 Deutsch" },
];

type Panel = null | "identity" | "email" | "password";

export default function ProfilePage() {
  const { user, profile, setProfile } = useAuth();
  const toast = useToast();
  // Arrivée depuis l'e-mail « mot de passe oublié » → on ouvre directement le changement
  const [panel, setPanel] = useState<Panel>(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("reset") ? "password" : null
  );
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  const togglePublic = async () => {
    const next = !profile.is_public;
    setProfile({ ...profile, is_public: next }); // affichage immédiat
    setSavingPrivacy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ is_public: next, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setSavingPrivacy(false);
    if (error) {
      setProfile({ ...profile, is_public: !next });
      toast("Erreur lors du changement de visibilité", "error");
      return;
    }
    toast(next ? "Ton carnet est maintenant public" : "Ton carnet est maintenant privé");
  };

  const share = async () => {
    const url = `${window.location.origin}/p/${user.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Mon carnet FoodKeeper", text: "Viens voir mes restos et mes stats 🍴", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast("Lien copié !");
    } catch (e) {
      // L'utilisateur a fermé la fenêtre de partage : rien à signaler
      if (e instanceof Error && e.name === "AbortError") return;
      toast("Impossible de partager le lien", "error");
    }
  };

  const name = fullName(profile.name, profile.last_name);
  const localeLabel = LOCALES.find((l) => l.value === profile.locale)?.label ?? "🇫🇷 Français";
  const isOAuth = user.app_metadata?.provider && user.app_metadata.provider !== "email";

  return (
    <>
      <PageHeader title="Mon compte" />

      <section className="fk-card mb-5 p-5">
        <div className="flex items-center gap-4">
          <Avatar text={initials(profile.name, profile.last_name, user.email)} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-extrabold">{name || "Sans nom"}</p>
            <p className="truncate text-sm text-muted">{user.email}</p>
            <p className="text-sm text-muted">{localeLabel}</p>
          </div>
          <button type="button" className="fk-icon-btn" aria-label="Modifier mon profil" onClick={() => setPanel("identity")}>
            <Pencil size={16} />
          </button>
        </div>
      </section>

      <SectionTitle>Partage</SectionTitle>
      <section className="fk-card mb-5 divide-y-2 divide-choco/15">
        <div className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="font-extrabold">Carnet public</p>
            <p className="text-sm text-muted">
              {profile.is_public ? "Visible dans la Communauté et via ton lien." : "Toi seul peux voir ton carnet."}
            </p>
          </div>
          <Switch checked={profile.is_public} onChange={togglePublic} disabled={savingPrivacy} label="Carnet public" />
        </div>
        <div className="p-4">
          <button type="button" className="fk-btn fk-btn-accent w-full" onClick={share} disabled={!profile.is_public}>
            <Share2 size={18} strokeWidth={2.5} /> Partager mon carnet
          </button>
          {!profile.is_public && <p className="mt-2 text-center text-xs text-muted">Passe ton carnet en public pour le partager.</p>}
        </div>
      </section>

      <SectionTitle>Apparence</SectionTitle>
      <ThemePicker />

      <SectionTitle>Sécurité</SectionTitle>
      <section className="fk-card mb-5 divide-y-2 divide-choco/15 overflow-hidden">
        <MenuRow icon={Mail} label="Changer d'e-mail" onClick={() => setPanel("email")} disabled={Boolean(isOAuth)} />
        <MenuRow icon={KeyRound} label="Changer de mot de passe" onClick={() => setPanel("password")} disabled={Boolean(isOAuth)} />
      </section>
      {isOAuth && <p className="-mt-3 mb-5 text-xs text-muted">Tu es connecté avec Google : e-mail et mot de passe se gèrent depuis ton compte Google.</p>}

      <button type="button" className="fk-btn fk-btn-ghost w-full" onClick={signOut}>
        <LogOut size={18} /> Se déconnecter
      </button>

      <Sheet open={panel === "identity"} onClose={() => setPanel(null)} title="Mon profil">
        {panel === "identity" && <IdentityForm onDone={() => setPanel(null)} />}
      </Sheet>
      <Sheet open={panel === "email"} onClose={() => setPanel(null)} title="Changer d'e-mail">
        {panel === "email" && <EmailForm onDone={() => setPanel(null)} />}
      </Sheet>
      <Sheet open={panel === "password"} onClose={() => setPanel(null)} title="Nouveau mot de passe">
        {panel === "password" && <PasswordForm onDone={() => setPanel(null)} />}
      </Sheet>
    </>
  );
}

function ThemePicker() {
  const { choice, setChoice } = useTheme();
  const options: { value: ThemeChoice; label: string }[] = [
    { value: "light", label: "Clair" },
    { value: "dark", label: "Sombre" },
    { value: "system", label: "Auto" },
  ];
  return (
    <section className="fk-card mb-5 p-4">
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Thème">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={choice === o.value}
            className="fk-chip justify-center !py-2.5"
            onClick={() => setChoice(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">« Auto » suit le réglage de ton téléphone. Mémorisé sur cet appareil.</p>
    </section>
  );
}

function MenuRow({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Mail;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left font-bold hover:bg-sand/60 disabled:opacity-50 disabled:hover:bg-transparent"
    >
      <Icon size={18} /> {label}
    </button>
  );
}

function IdentityForm({ onDone }: { onDone: () => void }) {
  const { user, profile, setProfile } = useAuth();
  const toast = useToast();
  const [first, setFirst] = useState(profile.name ?? "");
  const [last, setLast] = useState(profile.last_name ?? "");
  const [locale, setLocale] = useState<Locale>(profile.locale);
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        const next = { ...profile, name: first.trim().slice(0, 40), last_name: last.trim().slice(0, 40), locale };
        const { error } = await supabase.from("profiles").upsert(
          { id: user.id, name: next.name, last_name: next.last_name, locale, is_public: profile.is_public, updated_at: new Date().toISOString() },
          { onConflict: "id" }
        );
        setSaving(false);
        if (error) {
          toast("Erreur lors de l'enregistrement", "error");
          return;
        }
        setProfile(next);
        toast("Profil mis à jour");
        onDone();
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="fk-label" htmlFor="first">Prénom</label>
          <input id="first" className="fk-input" value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" />
        </div>
        <div>
          <label className="fk-label" htmlFor="last">Nom</label>
          <input id="last" className="fk-input" value={last} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" />
        </div>
      </div>
      <div>
        <label className="fk-label" htmlFor="locale">Langue préférée</label>
        <select id="locale" className="fk-input" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
          {LOCALES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="fk-btn fk-btn-primary w-full" disabled={saving}>
        {saving ? "…" : "Enregistrer"}
      </button>
    </form>
  );
}

function EmailForm({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        const { error } = await supabase.auth.updateUser({ email: email.trim().toLowerCase() });
        setSaving(false);
        if (error) {
          toast(error.message, "error");
          return;
        }
        toast("Vérifie ta boîte mail pour confirmer");
        onDone();
      }}
    >
      <div>
        <label className="fk-label" htmlFor="new-email">Nouvel e-mail</label>
        <input id="new-email" type="email" required className="fk-input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </div>
      <p className="text-sm text-muted">Un lien de confirmation sera envoyé à la nouvelle adresse.</p>
      <button type="submit" className="fk-btn fk-btn-primary w-full" disabled={saving || !email.includes("@")}>
        {saving ? "…" : "Changer d'e-mail"}
      </button>
    </form>
  );
}

function PasswordForm({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [saving, setSaving] = useState(false);
  const valid = pwd.length >= 8 && pwd === pwd2;
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valid) return;
        setSaving(true);
        const { error } = await supabase.auth.updateUser({ password: pwd });
        setSaving(false);
        if (error) {
          toast(error.message, "error");
          return;
        }
        toast("Mot de passe modifié");
        onDone();
      }}
    >
      <div>
        <label className="fk-label" htmlFor="pwd">Nouveau mot de passe</label>
        <input id="pwd" type="password" className="fk-input" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="new-password" />
        <p className="mt-1 text-xs text-muted">8 caractères minimum.</p>
      </div>
      <div>
        <label className="fk-label" htmlFor="pwd2">Confirmer</label>
        <input id="pwd2" type="password" className="fk-input" value={pwd2} onChange={(e) => setPwd2(e.target.value)} autoComplete="new-password" />
        {pwd2 && pwd !== pwd2 && <p className="mt-1 text-xs font-bold text-danger">Les mots de passe ne correspondent pas.</p>}
      </div>
      <button type="submit" className="fk-btn fk-btn-primary w-full" disabled={!valid || saving}>
        {saving ? "…" : "Enregistrer"}
      </button>
    </form>
  );
}