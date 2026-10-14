"use client";

import { CalendarDays, Crown, Gem, PiggyBank, Receipt } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { KeyFigures, ProfileHero, TagsAndCountries, TopThree } from "@/components/stats/StatsBlocks";
import { DeltaPill, EmptyState, InsightCard, SectionTitle } from "@/components/ui/Blocks";
import { YearChips } from "@/components/ui/Inputs";
import { useAuth } from "@/lib/auth";
import { useNotebook } from "@/lib/data";
import { formatDateFR, formatEUR, fullName, initials, plural } from "@/lib/format";
import { availableYears, computeStats, yearDelta, type YearFilter } from "@/lib/stats";

export default function StatsPage() {
  const { user, profile } = useAuth();
  const { restaurants, visits, loading } = useNotebook(user.id);
  const [year, setYear] = useState<YearFilter>("all");

  const years = useMemo(() => availableYears(visits), [visits]);
  const activeYear: YearFilter = year !== "all" && !years.includes(year) ? "all" : year;
  const stats = useMemo(() => computeStats(restaurants, visits, activeYear), [restaurants, visits, activeYear]);
  const delta = yearDelta(visits, activeYear, { spent: stats.totalSpent, visits: stats.visitCount });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="fk-skeleton h-44 rounded-[1.25rem]" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="fk-skeleton h-24 rounded-[1.25rem]" />
          ))}
        </div>
      </div>
    );
  }

  const name = fullName(profile.name, profile.last_name) || "Mon carnet";

  return (
    <>
      <ProfileHero
        initialsText={initials(profile.name, profile.last_name, user.email)}
        name={name}
        subtitle={`${plural(stats.restaurantCount, "resto", "restos")} · ${plural(stats.visitCount, "visite", "visites")}`}
        stats={stats}
      />

      {visits.length === 0 ? (
        <EmptyState emoji="📊" title="Pas encore de stats" text="Ajoute une visite avec son addition pour débloquer tes statistiques.">
          <Link href="/search" className="fk-btn fk-btn-accent">
            Ajouter une visite
          </Link>
        </EmptyState>
      ) : (
        <>
          <div className="mb-4">
            <YearChips years={years} value={activeYear} onChange={setYear} />
            {delta && (
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="text-muted">vs {delta.prevYear}</span>
                {delta.spent == null && delta.visits == null ? (
                  <span className="text-muted">pas de données</span>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 font-bold">
                      Dépenses <DeltaPill value={delta.spent} />
                    </span>
                    <span className="flex items-center gap-1.5 font-bold">
                      Visites <DeltaPill value={delta.visits} />
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <KeyFigures stats={stats} detailed />

          <section className="mb-5">
            <SectionTitle>Les faits marquants</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <InsightCard
                icon={Crown}
                title="Ta cantine"
                main={stats.mostVisited?.restaurantName ?? "—"}
                sub={stats.mostVisited ? plural(stats.mostVisited.count, "visite", "visites") : "Aucune visite"}
              />
              <InsightCard
                icon={CalendarDays}
                title="Mois le plus gourmand"
                main={stats.busiestMonth?.label ?? "—"}
                sub={stats.busiestMonth ? plural(stats.busiestMonth.count, "visite", "visites") : "—"}
              />
              <InsightCard
                icon={Receipt}
                title="Plus grosse addition"
                main={stats.priciest?.restaurantName ?? "—"}
                sub={stats.priciest ? `${formatEUR(stats.priciest.value)} · ${formatDateFR(stats.priciest.visitedAt)}` : "Aucune addition"}
              />
              <InsightCard
                icon={PiggyBank}
                title="Meilleur rapport €/couvert"
                main={stats.cheapestPerCover?.restaurantName ?? "—"}
                sub={stats.cheapestPerCover ? `${formatEUR(stats.cheapestPerCover.value)} / couvert` : "—"}
              />
              <InsightCard
                icon={Gem}
                title="Le plus cher par couvert"
                main={stats.dearestPerCover?.restaurantName ?? "—"}
                sub={stats.dearestPerCover ? `${formatEUR(stats.dearestPerCover.value)} / couvert` : "—"}
              />
            </div>
          </section>

          <TopThree stats={stats} />
          <TagsAndCountries stats={stats} />
        </>
      )}
    </>
  );
}