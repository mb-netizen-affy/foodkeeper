"use client";

// Carte de tous mes restos (carnet + liste « À tester »).

import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import RestaurantSheet from "@/components/restaurant/RestaurantSheet";
import { PageHeader } from "@/components/ui/Blocks";
import { useAuth } from "@/lib/auth";
import { useNotebook, useWishlist } from "@/lib/data";
import { plural } from "@/lib/format";
import { withVisitStats } from "@/lib/stats";

// Leaflet a besoin du navigateur : on ne le charge jamais côté serveur
const RestoMap = dynamic(() => import("@/components/map/RestoMap"), {
  ssr: false,
  loading: () => <div className="fk-skeleton h-full w-full !rounded-none" />,
});

type Filter = "all" | "carnet" | "wish";

const hasCoords = (x: { lat?: number | null; lng?: number | null }) => x.lat != null && x.lng != null;

export default function MapPage() {
  const { user } = useAuth();
  const { restaurants, visits, reload } = useNotebook(user.id);
  const wishlist = useWishlist(user.id);
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const enriched = useMemo(() => withVisitStats(restaurants, visits), [restaurants, visits]);
  const mappedRestos = enriched.filter(hasCoords);
  const mappedWishes = wishlist.items.filter(hasCoords);
  const missing = enriched.length - mappedRestos.length + (wishlist.items.length - mappedWishes.length);

  const shownRestos = filter === "wish" ? [] : mappedRestos;
  const shownWishes = filter === "carnet" ? [] : mappedWishes;

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: `Tout · ${mappedRestos.length + mappedWishes.length}` },
    { value: "carnet", label: `Mon carnet · ${mappedRestos.length}` },
    { value: "wish", label: `À tester · ${mappedWishes.length}` },
  ];

  return (
    <>
      <PageHeader
        title="La carte"
        subtitle="Tous tes restos, et ceux qui t'attendent."
        action={
          <Link href="/restaurants" className="fk-btn fk-btn-ghost !min-h-11 !px-4" aria-label="Retour à la liste">
            <ArrowLeft size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">Liste</span>
          </Link>
        }
      />

      <div className="-mx-1 mb-3 fk-scroll-x" role="group" aria-label="Filtrer la carte">
        {filters.map((f) => (
          <button key={f.value} type="button" className="fk-chip" aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="fk-card relative h-[calc(100dvh-22rem)] min-h-[340px] overflow-hidden !p-0">
        <RestoMap restaurants={shownRestos} wishes={shownWishes} onOpenRestaurant={setOpenId} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-choco bg-paprika" /> coup de cœur (16+)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-choco bg-sand" /> mon carnet
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-dashed border-choco bg-paper" /> à tester
        </span>
        {missing > 0 && <span>· {plural(missing, "adresse sans position", "adresses sans position")}</span>}
      </div>

      <RestaurantSheet
        userId={user.id}
        restaurant={enriched.find((r) => r.id === openId) ?? null}
        visits={visits}
        onClose={() => setOpenId(null)}
        onChanged={reload}
      />
    </>
  );
}