"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SplashScreen } from "@/components/AppChrome";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => router.replace(data.user ? "/restaurants" : "/login"));
  }, [router]);

  return <SplashScreen />;
}
