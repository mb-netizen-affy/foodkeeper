// Calcul des statistiques — partagé entre la page Stats et le profil public.

import { gourmetBadge, topTags } from "./badge";
import { clampRating, round1, yearOf } from "./format";
import type { Restaurant, RestaurantWithStats, Visit } from "./types";

export type YearFilter = number | "all";

/** Ajoute à chaque restaurant : nombre de visites, total dépensé, dernière visite. */
export function withVisitStats(restaurants: Restaurant[], visits: Visit[]): RestaurantWithStats[] {
  const map = new Map<string, { count: number; sum: number; last: string | null }>();
  for (const v of visits) {
    const cur = map.get(v.restaurant_id) ?? { count: 0, sum: 0, last: null };
    cur.count += 1;
    cur.sum += Number(v.price_eur) || 0;
    if (!cur.last || v.visited_at > cur.last) cur.last = v.visited_at;
    map.set(v.restaurant_id, cur);
  }
  return restaurants.map((r) => {
    const s = map.get(r.id);
    return {
      ...r,
      visitCount: s?.count ?? 0,
      totalSpent: round1(s?.sum ?? 0),
      lastVisitAt: s?.last ?? null,
    };
  });
}

export function availableYears(visits: Visit[]) {
  const set = new Set<number>();
  for (const v of visits) {
    const y = yearOf(v.visited_at);
    if (y) set.add(y);
  }
  return Array.from(set).sort((a, b) => b - a);
}

function topEntry(map: Map<string, number>) {
  let best: [string, number] | null = null;
  for (const e of map.entries()) if (!best || e[1] > best[1]) best = e;
  return best;
}

type VisitHighlight = { restaurantName: string; value: number; covers: number; visitedAt: string };

/**
 * Stats sur une période. Le filtre année porte sur les VISITES :
 * un restaurant compte dans l'année s'il y a été visité.
 */
export function computeStats(restaurants: Restaurant[], allVisits: Visit[], year: YearFilter) {
  const visits = year === "all" ? allVisits : allVisits.filter((v) => yearOf(v.visited_at) === year);

  const visitedIds = new Set(visits.map((v) => v.restaurant_id));
  const restos = year === "all" ? restaurants : restaurants.filter((r) => visitedIds.has(r.id));

  const nameById = new Map(restaurants.map((r) => [r.id, r.name]));
  const nameOf = (id: string) => nameById.get(id) ?? "—";

  // Notes
  const ratings = restos
    .map((r) => (r.rating == null ? null : Number(r.rating)))
    .filter((n): n is number => n != null && Number.isFinite(n))
    .map(clampRating);
  const avgRating = ratings.length ? round1(ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;

  // Villes / pays
  const cityCount = new Map<string, number>();
  const countryCount = new Map<string, number>();
  for (const r of restos) {
    const c = (r.city ?? "").trim();
    const p = (r.country ?? "").trim();
    if (c) cityCount.set(c, (cityCount.get(c) ?? 0) + 1);
    if (p) countryCount.set(p, (countryCount.get(p) ?? 0) + 1);
  }
  const countries = Array.from(countryCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Visites
  let totalSpent = 0;
  let totalCovers = 0;
  let priciest: VisitHighlight | null = null;
  let cheapestPerCover: VisitHighlight | null = null;
  let dearestPerCover: VisitHighlight | null = null;
  const visitsByResto = new Map<string, number>();
  const visitsByMonth = new Map<string, number>();

  for (const v of visits) {
    const price = v.price_eur == null ? null : Number(v.price_eur);
    const covers = Number(v.covers ?? 0);
    const okCovers = Number.isFinite(covers) && covers > 0;
    if (okCovers) totalCovers += covers;

    if (price != null && Number.isFinite(price)) {
      totalSpent += price;
      const name = nameOf(v.restaurant_id);
      if (!priciest || price > priciest.value)
        priciest = { restaurantName: name, value: price, covers, visitedAt: v.visited_at };
      if (okCovers) {
        const unit = price / covers;
        if (!cheapestPerCover || unit < cheapestPerCover.value)
          cheapestPerCover = { restaurantName: name, value: unit, covers, visitedAt: v.visited_at };
        if (!dearestPerCover || unit > dearestPerCover.value)
          dearestPerCover = { restaurantName: name, value: unit, covers, visitedAt: v.visited_at };
      }
    }

    visitsByResto.set(v.restaurant_id, (visitsByResto.get(v.restaurant_id) ?? 0) + 1);
    const d = new Date(v.visited_at);
    const monthLabel = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    visitsByMonth.set(monthLabel, (visitsByMonth.get(monthLabel) ?? 0) + 1);
  }

  const mostVisitedEntry = topEntry(visitsByResto);
  const busiestMonthEntry = topEntry(visitsByMonth);

  const visitCount = visits.length;
  const avgPerCover = totalCovers > 0 ? round1(totalSpent / totalCovers) : null;
  const tags = topTags(restos);

  // Top 3 par note (égalité → plus de visites)
  const top3 = restos
    .filter((r) => r.rating != null)
    .sort((a, b) => {
      const d = clampRating(Number(b.rating)) - clampRating(Number(a.rating));
      if (d !== 0) return d;
      const dv = (visitsByResto.get(b.id) ?? 0) - (visitsByResto.get(a.id) ?? 0);
      if (dv !== 0) return dv;
      return a.name.localeCompare(b.name, "fr");
    })
    .slice(0, 3)
    .map((r) => ({ ...r, visitCount: visitsByResto.get(r.id) ?? 0 }));

  return {
    visits,
    restaurantCount: restos.length,
    visitCount,
    totalCovers,
    totalSpent: round1(totalSpent),
    avgPerVisit: visitCount ? round1(totalSpent / visitCount) : null,
    avgPerCover,
    avgRating,
    bestRating: ratings.length ? Math.max(...ratings) : null,
    worstRating: ratings.length ? Math.min(...ratings) : null,
    topCity: topEntry(cityCount)?.[0] ?? null,
    topCountry: countries[0]?.[0] ?? null,
    countries,
    topTags: tags,
    priciest,
    cheapestPerCover,
    dearestPerCover,
    mostVisited: mostVisitedEntry ? { restaurantName: nameOf(mostVisitedEntry[0]), count: mostVisitedEntry[1] } : null,
    busiestMonth: busiestMonthEntry ? { label: busiestMonthEntry[0], count: busiestMonthEntry[1] } : null,
    top3,
    badge: gourmetBadge(
      tags.map((t) => t.tag),
      { visitCount, avgRating, avgPerCover }
    ),
  };
}

export type Stats = ReturnType<typeof computeStats>;

/** Évolution en % par rapport à l'année précédente (null si pas de base). */
export function yearDelta(allVisits: Visit[], year: YearFilter, current: { spent: number; visits: number }) {
  if (year === "all") return null;
  const prev = allVisits.filter((v) => yearOf(v.visited_at) === year - 1);
  if (!prev.length) return { prevYear: year - 1, spent: null, visits: null };
  const prevSpent = prev.reduce((s, v) => s + (Number(v.price_eur) || 0), 0);
  const pct = (cur: number, before: number) => (before > 0 ? Math.round(((cur - before) / before) * 100) : null);
  return {
    prevYear: year - 1,
    spent: pct(current.spent, prevSpent),
    visits: pct(current.visits, prev.length),
  };
}
