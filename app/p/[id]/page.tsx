"use client";

// Profil public partageable : /p/<id>

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Logo, Wordmark } from "@/components/AppChrome";
import { KeyFigures, ProfileHero, TagsAndCountries, TopThree } from "@/components/stats/StatsBlocks";
import { EmptyState } from "@/components/ui/Blocks";
import { YearChips } from "@/components/ui/Inputs";
import { fullName, initials, plural } from "@/lib/format";
import { availableYears, computeStats, type YearFilter } from "@/lib/stats";
import { supabase } from "@/lib/supabaseClient";
import type { Restaurant, Visit } from "@/lib/types";

type PublicProfile = { id: string; name: string | null; last_name: string | null };

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();

  const [state, setState] = useState<"loading" | "notfound" | "ready">("loading");
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [year, setYear] = useState<YearFilter>("all");

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("id,name,last_name,is_public").eq("id", id).maybeSingle();
      if (!alive) return;
      if (!p?.is_public) {
        setState("notfound");
        return;
      }
      const [r, v] = await Promise.all([
        supabase.from("restaurants").select("id,name,city,country,rating,tags,created_at").eq("user_id", id),
        supabase.from("restaurant_visits").select("id,restaurant_id,price_eur,visited_at,covers").eq("user_id", id),
      ]);
      if (!alive) return;
      setProfile(p as PublicProfile);
      setRestaurants((r.data ?? []) as Restaurant[]);
      setVisits((v.data ?? []) as Visit[]);
      setState("ready");
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const years = useMemo(() => availableYears(visits), [visits]);
  const stats = useMemo(() => computeStats(restaurants, visits, year), [restaurants, visits, year]);

  return (
    <div className="min-h-dvh">
      <header className="border-b-2 border-choco bg-cream">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/community" className="fk-btn fk-btn-ghost !min-h-10 !px-3 !py-1.5 text-sm">
            <ArrowLeft size={16} strokeWidth={2.5} /> Communauté
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Logo size={34} />
            <span className="hidden sm:inline">
              <Wordmark />
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {state === "loading" && (
          <div className="space-y-4">
            <div className="fk-skeleton h-44 rounded-[1.25rem]" />
            <div className="grid grid-cols-2 gap-3">
              <div className="fk-skeleton h-24 rounded-[1.25rem]" />
              <div className="fk-skeleton h-24 rounded-[1.25rem]" />
            </div>
          </div>
        )}

        {state === "notfound" && (
          <EmptyState emoji="🔒" title="Profil indisponible" text="Ce carnet est privé ou le lien n'est plus valide." />
        )}

        {state === "ready" && profile && (
          <>
            <ProfileHero
              initialsText={initials(profile.name, profile.last_name)}
              name={fullName(profile.name, profile.last_name) || "Carnet public"}
              subtitle={`Carnet public · ${plural(stats.restaurantCount, "resto", "restos")}`}
              stats={stats}
            />

            {visits.length === 0 ? (
              <EmptyState emoji="🍽️" title="Pas encore de visites" text="Les stats apparaîtront dès les premières visites." />
            ) : (
              <>
                <div className="mb-4">
                  <YearChips years={years} value={year} onChange={setYear} />
                </div>
                <KeyFigures stats={stats} />
                <TopThree stats={stats} />
                <TagsAndCountries stats={stats} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
