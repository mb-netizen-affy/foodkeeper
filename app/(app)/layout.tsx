"use client";

import { AppHeader, BottomNav, SplashScreen } from "@/components/AppChrome";
import { AuthProvider } from "@/lib/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider fallback={<SplashScreen />}>
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 pb-36 pt-6">{children}</main>
      <BottomNav />
    </AuthProvider>
  );
}
