"use client";

// Blocs partagés entre « Stats » (mon carnet) et le profil public.

import { Globe, MapPin } from "lucide-react";
import { RatingBadge } from "@/components/restaurant/RestaurantCard";
import { Avatar, SectionTitle, StatCard } from "@/components/ui/Blocks";
import { formatEUR, formatNum, plural } from "@/lib/format";
import type { Stats } from "@/lib/stats";
import { tagLabel } from "@/lib/tags";

export function ProfileHero({
  initialsText,
  name,
  subtitle,
  stats,
  right,
}: {
  initialsText: string;
  name: string;
  subtitle: string;
  stats: Stats;
  right?: React.ReactNode;
}) {
  return (
    <section className="fk-card mb-5 overflow-hidden">
      <div className="flex items-start gap-4 p-5">
        <Avatar text={initialsText} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-extrabold leading-tight tracking-tight">{name}</h1>
          <p className="text-sm text-muted">{subtitle}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stats.topCity && (
              <span className="fk-tag">
                <MapPin size={12} /> {stats.topCity}
              </span>
            )}
            {stats.topCountry && (
              <span className="fk-tag">
                <Globe size={12} /> {stats.topCountry}
              </span>
            )}
          </div>
        </div>
        {right}
      </div>
      <div className="flex items-center gap-3 border-t-2 border-choco bg-choco px-5 py-3 text-cream">
        <span className="text-2xl" aria-hidden>
          {stats.badge.emoji}
        </span>
        <div className="min-w-0">
          <p className="truncate font-extrabold">{stats.badge.label}</p>
          <p className="text-xs text-cream/75">{stats.badge.sub}</p>
        </div>
      </div>
    </section>
  );
}

export function KeyFigures({ stats, detailed }: { stats: Stats; detailed?: boolean }) {
  return (
    <section className="mb-5 grid grid-cols-2 gap-3">
      <StatCard label="Total dépensé" value={formatEUR(stats.totalSpent)} sub={stats.avgPerVisit != null ? `~ ${formatEUR(stats.avgPerVisit)} / visite` : undefined} accent />
      <StatCard label="€ / couvert" value={formatEUR(stats.avgPerCover)} sub={plural(stats.totalCovers, "couvert", "couverts")} />
      <StatCard label="Restaurants" value={String(stats.restaurantCount)} />
      <StatCard label="Visites" value={String(stats.visitCount)} />
      {detailed && (
        <div className="col-span-2">
          <StatCard label="Note moyenne" value={stats.avgRating ? `${formatNum(stats.avgRating)}/20` : "—"} />
        </div>
      )}
    </section>
  );
}

export function TopThree({ stats }: { stats: Stats }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <section className="mb-5">
      <SectionTitle>Top 3</SectionTitle>
      {stats.top3.length === 0 ? (
        <p className="fk-card-flat border-dashed p-4 text-sm text-muted">Aucun restaurant noté sur cette période.</p>
      ) : (
        <ul className="space-y-3">
          {stats.top3.map((r, i) => (
            <li key={r.id} className="fk-card flex items-center gap-3 p-3">
              <span className="text-2xl" aria-hidden>
                {medals[i]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-extrabold">{r.name}</p>
                <p className="truncate text-sm text-muted">
                  {[r.city, r.country].filter(Boolean).join(" · ") || "—"} · {plural(r.visitCount, "visite", "visites")}
                </p>
              </div>
              <RatingBadge rating={r.rating} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function TagsAndCountries({ stats }: { stats: Stats }) {
  return (
    <section className="mb-5 grid gap-3 sm:grid-cols-2">
      <div className="fk-card p-4">
        <SectionTitle>Tags favoris</SectionTitle>
        {stats.topTags.length === 0 ? (
          <p className="text-sm text-muted">Ajoute des tags à tes restos pour voir tes tendances.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {stats.topTags.map((t) => (
              <span key={t.tag} className="fk-tag">
                {tagLabel(t.tag)} <span className="text-muted">· {t.n}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="fk-card p-4">
        <SectionTitle>Pays</SectionTitle>
        {stats.countries.length === 0 ? (
          <p className="text-sm text-muted">Les pays se remplissent automatiquement via Google.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {stats.countries.map(([country, n]) => (
              <span key={country} className="fk-tag">
                {country} <span className="text-muted">· {n}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}