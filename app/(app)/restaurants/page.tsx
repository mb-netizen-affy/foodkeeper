"use client";

import { Plus, Search, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import RestaurantCard, { RestaurantCardSkeleton } from "@/components/restaurant/RestaurantCard";
import RestaurantSheet from "@/components/restaurant/RestaurantSheet";
import { EmptyState, PageHeader } from "@/components/ui/Blocks";
import { useAuth } from "@/lib/auth";
import { useNotebook } from "@/lib/data";
import { norm, plural } from "@/lib/format";
import { withVisitStats } from "@/lib/stats";
import { tagLabel } from "@/lib/tags";

type SortMode = "recent" | "best" | "spent";

const SORTS: { value: SortMode; label: string }[] = [
  { value: "recent", label: "Récents" },
  { value: "best", label: "Mieux notés" },
  { value: "spent", label: "Plus dépensé" },
];

export default function RestaurantsPage() {
  const { user } = useAuth();
  const { restaurants, visits, loading, error, reload } = useNotebook(user.id);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("recent");
  const [openId, setOpenId] = useState<string | null>(null);

  const enriched = useMemo(() => withVisitStats(restaurants, visits), [restaurants, visits]);

  const visible = useMemo(() => {
    const terms = norm(search).split(/\s+/).filter(Boolean);
    const list = enriched.filter((r) => {
      if (!terms.length) return true;
      const hay = norm([r.name, r.city, r.country, ...(r.tags ?? []).map(tagLabel)].join(" "));
      return terms.every((t) => hay.includes(t));
    });

    return [...list].sort((a, b) => {
      if (sort === "best") return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (sort === "spent") return b.totalSpent - a.totalSpent;
      // Récents : dernière visite, sinon date d'ajout
      const ka = a.lastVisitAt ?? a.created_at ?? "";
      const kb = b.lastVisitAt ?? b.created_at ?? "";
      return ka < kb ? 1 : ka > kb ? -1 : 0;
    });
  }, [enriched, search, sort]);

  const opened = enriched.find((r) => r.id === openId) ?? null;

  return (
    <>
      <PageHeader
        title="Mes restos"
        subtitle={loading ? "Chargement…" : `${plural(restaurants.length, "adresse", "adresses")} · ${plural(visits.length, "visite", "visites")}`}
        action={
          <Link href="/search" className="fk-btn fk-btn-accent !min-h-11 !px-4" aria-label="Ajouter un restaurant">
            <Plus size={20} strokeWidth={2.75} />
            <span className="hidden sm:inline">Ajouter</span>
          </Link>
        }
      />

      {restaurants.length > 0 && (
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Nom, ville, tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="fk-input !pl-11 !pr-12"
              aria-label="Rechercher dans mes restos"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-2" aria-label="Effacer">
                <X size={18} />
              </button>
            )}
          </div>
          <div className="-mx-1 fk-scroll-x" role="group" aria-label="Trier">
            {SORTS.map((s) => (
              <button key={s.value} type="button" className="fk-chip" aria-pressed={sort === s.value} onClick={() => setSort(s.value)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mb-4 rounded-2xl border-2 border-danger bg-paper p-3 text-sm font-bold text-danger">{error}</p>}

      {loading ? (
        <ul className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </ul>
      ) : restaurants.length === 0 ? (
        <EmptyState emoji="🍝" title="Ton carnet est vide" text="Ajoute ton premier restaurant : il suffit de taper son nom.">
          <Link href="/search" className="fk-btn fk-btn-accent">
            <Plus size={18} strokeWidth={2.75} /> Ajouter un resto
          </Link>
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState emoji="🔎" title="Aucun résultat" text={<>Rien ne correspond à « {search.trim()} ».</>}>
          <button type="button" className="fk-btn fk-btn-ghost" onClick={() => setSearch("")}>
            Effacer la recherche
          </button>
        </EmptyState>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence initial={false}>
            {visible.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} onOpen={() => setOpenId(r.id)} />
            ))}
          </AnimatePresence>
        </ul>
      )}

      <RestaurantSheet userId={user.id} restaurant={opened} visits={visits} onClose={() => setOpenId(null)} onChanged={reload} />
    </>
  );
}
