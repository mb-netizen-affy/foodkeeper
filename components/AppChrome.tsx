"use client";

// En-tête, navigation flottante et bulle « Mon compte ».

import { ChartColumn, LogOut, Map as MapIcon, Search, Settings, Users, Utensils } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut, useAuth } from "@/lib/auth";
import { initials } from "@/lib/format";

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <span
      className="block shrink-0 overflow-hidden rounded-xl border-2 border-choco shadow-brut-sm"
      style={{ width: size, height: size }}
    >
      <Image src="/logo.png" alt="" width={size} height={size} className="h-full w-full object-cover" priority />
    </span>
  );
}

export function Wordmark({ className = "text-xl" }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-tight ${className}`}>
      Food<span className="text-paprika">Keeper</span>
    </span>
  );
}

export function SplashScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <motion.div animate={{ rotate: [0, -6, 6, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
        <Logo size={72} />
      </motion.div>
      <Wordmark />
    </div>
  );
}

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-choco bg-cream/90 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/restaurants" className="flex items-center gap-2.5">
          <Logo />
          <Wordmark />
        </Link>
        <AccountBubble />
      </div>
    </header>
  );
}

function AccountBubble() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fk-icon-btn !h-11 !w-11 !bg-paprika font-extrabold text-deep"
        aria-label="Mon compte"
        aria-expanded={open}
      >
        {initials(profile.name, profile.last_name, user.email)}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="fk-card absolute right-0 mt-3 w-64 origin-top-right overflow-hidden !shadow-brut-lg"
          >
            <div className="border-b-2 border-choco bg-sand px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Connecté</p>
              <p className="truncate text-sm font-bold">{user.email}</p>
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 font-semibold hover:bg-sand/60"
            >
              <Settings size={18} /> Mon compte
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-3 border-t-2 border-choco px-4 py-3 text-left font-semibold hover:bg-sand/60"
            >
              <LogOut size={18} /> Se déconnecter
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const TABS = [
  { href: "/restaurants", label: "Mes restos", icon: Utensils, also: ["/map"] },
  { href: "/search", label: "Ajouter", icon: Search, also: [] },
  { href: "/stats", label: "Stats", icon: ChartColumn, also: [] },
  { href: "/community", label: "Communauté", icon: Users, also: [] },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[1.5rem] border-2 border-choco bg-paper p-1.5 shadow-brut-lg">
        {TABS.map(({ href, label, icon: Icon, also }) => {
          const active = [href, ...also].some((h) => pathname === h || pathname.startsWith(`${h}/`));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 rounded-2xl py-2 text-[11px] font-bold transition-colors ${
                active ? "text-deep" : "text-muted hover:text-choco"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-2xl border-2 border-choco bg-paprika"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <Icon size={22} strokeWidth={active ? 2.5 : 2} className="relative" />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ---------- Ordinateur : menu latéral (remplace l'en-tête et la barre du bas) ----------

const SIDE_LINKS = [
  { href: "/restaurants", label: "Mes restos", icon: Utensils },
  { href: "/map", label: "Carte", icon: MapIcon },
  { href: "/search", label: "Ajouter", icon: Search },
  { href: "/stats", label: "Stats", icon: ChartColumn },
  { href: "/community", label: "Communauté", icon: Users },
];

export function SideNav() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const name = `${profile.name ?? ""} ${profile.last_name ?? ""}`.trim();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r-2 border-choco bg-cream px-5 py-6 lg:flex">
      <Link href="/restaurants" className="mb-8 flex items-center gap-2.5">
        <Logo />
        <Wordmark />
      </Link>

      <nav aria-label="Navigation principale" className="flex flex-col gap-1.5">
        {SIDE_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition-colors ${
                active ? "text-deep" : "text-muted hover:bg-sand/60 hover:text-choco"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="side-active"
                  className="absolute inset-0 rounded-2xl border-2 border-choco bg-paprika shadow-brut-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <Icon size={20} strokeWidth={active ? 2.5 : 2} className="relative" />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto fk-card overflow-hidden">
        <Link href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-sand/60">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-choco bg-paprika text-sm font-extrabold text-deep">
            {initials(profile.name, profile.last_name, user.email)}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-extrabold">{name || "Mon compte"}</span>
            <span className="block truncate text-xs text-muted">{user.email}</span>
          </span>
        </Link>
        <Link
          href="/profile"
          className={`flex items-center gap-3 border-t-2 border-choco px-4 py-2.5 text-sm font-semibold hover:bg-sand/60 ${
            pathname === "/profile" ? "bg-sand" : ""
          }`}
        >
          <Settings size={16} /> Mon compte
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 border-t-2 border-choco px-4 py-2.5 text-left text-sm font-semibold hover:bg-sand/60"
        >
          <LogOut size={16} /> Se déconnecter
        </button>
      </div>
    </aside>
  );
}