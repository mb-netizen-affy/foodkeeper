"use client";

import { AppHeader, BottomNav, SideNav, SplashScreen } from "@/components/AppChrome";
import { AuthProvider } from "@/lib/auth";

// Mobile : en-tête + barre de navigation en bas.
// Ordinateur (≥ 1024 px) : menu latéral à gauche et contenu plus large.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider fallback={<SplashScreen />}>
      <AppHeader />
      <SideNav />
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-2xl px-4 pb-32 pt-4 sm:px-6 sm:pb-36 sm:pt-6 md:max-w-4xl lg:max-w-6xl lg:px-10 lg:pb-14 lg:pt-10">{children}</main>
      </div>
      <BottomNav />
    </AuthProvider>
  );
}