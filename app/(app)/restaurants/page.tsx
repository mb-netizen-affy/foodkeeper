"use client";

import { Map as MapIcon, Plus, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import RestaurantCard, { RestaurantCardSkeleton } from "@/components/restaurant/RestaurantCard";
import RestaurantSheet from "@/components/restaurant/RestaurantSheet";
import WishCard from "@/components/restaurant/WishCard";
import { EmptyState, PageHeader } from "@/components/ui/Blocks";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth";
import { deleteWish, useNotebook, useWishlist } from "@/lib/data";
import { norm, plural } from "@/lib/format";
import { withVisitStats } from "@/lib/stats";
import { tagLabel } from "@/lib/tags";

type Tab = "carnet" | "wish";
type SortMode = "recent" | "best" | "spent";

const SORTS: { value: SortMode; label: string }[] = [
  { value: "recent", label: "Récents" },
  { value: "best", label: "Mieux notés" },
  { value: "spent", label: "Plus dépensé" },
];

export default function RestaurantsPage() {
  return (
    <Suspense>
      <RestaurantsContent />
    </Suspense>
  );
}

function RestaurantsContent() {
  const { user } = useAuth();
  const params = useSearchParams();
  const toast = useToast();
  const { restaurants, visits, loading, error, reload } = useNotebook(user.id);
  const wishlist = useWishlist(user.id);

  // Onglet ouvert : /restaurants?tab=wish ouvre directement « À tester »
  const [tab, setTab] = useState<Tab>(params.get("tab") === "wish" ? "wish" : "carnet");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("recent");
  const [openId, setOpenId] = useState<string | null>(null);

  const enriched = useMemo(() => withVisitStats(restaurants, visits), [restaurants, visits]);

  const terms = useMemo(() => norm(search).split(/\s+/).filter(Boolean), [search]);
  const matches = (parts: (string | null | undefined)[]) => {
    if (!terms.length) return true;
    const hay = norm(parts.join(" "));
    return terms.every((t) => hay.includes(t));
  };

  const visible = useMemo(() => {
    const list = enriched.filter((r) => matches([r.name, r.city, r.country, ...(r.tags ?? []).map(tagLabel)]));
    return [...list].sort((a, b) => {
      if (sort === "best") return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (sort === "spent") return b.totalSpent - a.totalSpent;
      // Récents : dernière visite, sinon date d'ajout
      const ka = a.lastVisitAt ?? a.created_at ?? "";
      const kb = b.lastVisitAt ?? b.created_at ?? "";
      return ka < kb ? 1 : ka > kb ? -1 : 0;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enriched, terms, sort]);

  const visibleWishes = useMemo(
    () => wishlist.items.filter((w) => matches([w.name, w.city, w.country, w.note])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wishlist.items, terms]
  );

  const opened = enriched.find((r) => r.id === openId) ?? null;

  const removeWish = async (id: string, name: string) => {
    const { error: err } = await deleteWish(user.id, id);
    if (err) {
      toast("Erreur lors de la suppression", "error");
      return;
    }
    await wishlist.reload();
    toast(`${name} retiré de la liste`);
  };

  const hasContent = tab === "carnet" ? restaurants.length > 0 : wishlist.items.length > 0;

  return (
    <>
      <PageHeader
        title="Mes restos"
        subtitle={
          loading
            ? "Chargement…"
            : `${plural(restaurants.length, "adresse", "adresses")} · ${plural(visits.length, "visite", "visites")}`
        }
        action={
          <Link href="/map" className="fk-btn fk-btn-ghost !min-h-11 !px-4">
            <MapIcon size={20} strokeWidth={2.5} /> Carte
          </Link>
        }
      />

      {/* Onglets Mon carnet / À tester */}
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl border-2 border-choco bg-sand p-1" role="tablist" aria-label="Affichage">
        {(
          [
            { value: "carnet", label: "Mon carnet", count: restaurants.length },
            { value: "wish", label: "À tester", count: wishlist.items.length },
          ] as const
        ).map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className="relative flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold"
          >
            {tab === t.value && (
              <motion.span layoutId="restos-tab" className="absolute inset-0 rounded-xl border-2 border-choco bg-paper" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
            )}
            <span className="relative">{t.label}</span>
            {t.count > 0 && (
              <span className={`relative rounded-full px-2 text-xs ${tab === t.value ? "bg-paprika text-deep" : "bg-cream text-muted"}`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {hasContent && (
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder={tab === "carnet" ? "Nom, ville, tag…" : "Nom, ville, note…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="fk-input !pl-11 !pr-12"
              aria-label="Rechercher"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-2" aria-label="Effacer">
                <X size={18} />
              </button>
            )}
          </div>
          {tab === "carnet" && (
            <div className="-mx-1 fk-scroll-x" role="group" aria-label="Trier">
              {SORTS.map((s) => (
                <button key={s.value} type="button" className="fk-chip" aria-pressed={sort === s.value} onClick={() => setSort(s.value)}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="mb-4 rounded-2xl border-2 border-danger bg-paper p-3 text-sm font-bold text-danger">{error}</p>}

      {tab === "carnet" ? (
        loading ? (
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
          <NoResult search={search} onClear={() => setSearch("")} />
        ) : (
          <ul className="space-y-4">
            <AnimatePresence initial={false}>
              {visible.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} onOpen={() => setOpenId(r.id)} />
              ))}
            </AnimatePresence>
          </ul>
        )
      ) : wishlist.loading ? (
        <ul className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </ul>
      ) : wishlist.items.length === 0 ? (
        <EmptyState
          emoji="📌"
          title="Rien à tester pour l'instant"
          text="Un resto conseillé par un ami, repéré en balade ? Cherche-le dans « Ajouter » puis choisis « À tester plus tard »."
        >
          <Link href="/search" className="fk-btn fk-btn-accent">
            <Plus size={18} strokeWidth={2.75} /> Repérer un resto
          </Link>
        </EmptyState>
      ) : visibleWishes.length === 0 ? (
        <NoResult search={search} onClear={() => setSearch("")} />
      ) : (
        <ul className="space-y-4">
          <AnimatePresence initial={false}>
            {visibleWishes.map((w) => (
              <WishCard key={w.id} item={w} onDelete={() => removeWish(w.id, w.name)} />
            ))}
          </AnimatePresence>
        </ul>
      )}

      <RestaurantSheet userId={user.id} restaurant={opened} visits={visits} onClose={() => setOpenId(null)} onChanged={reload} />
    </>
  );
}

function NoResult({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <EmptyState emoji="🔎" title="Aucun résultat" text={<>Rien ne correspond à « {search.trim()} ».</>}>
      <button type="button" className="fk-btn fk-btn-ghost" onClick={onClear}>
        Effacer la recherche
      </button>
    </EmptyState>
  );
}