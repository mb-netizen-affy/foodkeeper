"use client";

import { ChevronRight, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { formatDateFR, formatEUR, plural } from "@/lib/format";
import { tagLabel } from "@/lib/tags";
import type { RestaurantWithStats } from "@/lib/types";

/** Note /20 — en paprika à partir de 16 (« coup de cœur »), sinon sobre. */
export function RatingBadge({ rating, size = "md" }: { rating: number | null; size?: "md" | "lg" }) {
  const favourite = rating != null && rating >= 16;
  return (
    <span
      className={`flex shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-choco leading-none shadow-brut-sm ${
        favourite ? "bg-paprika text-deep" : "bg-sand text-choco"
      } ${
        size === "lg" ? "h-20 w-20" : "h-14 w-14"
      }`}
      aria-label={`Note ${rating ?? "—"} sur 20`}
    >
      <span className={`font-extrabold tabular-nums ${size === "lg" ? "text-3xl" : "text-xl"}`}>{rating ?? "—"}</span>
      <span className="text-[10px] font-bold">/20</span>
    </span>
  );
}

export default function RestaurantCard({ restaurant, onOpen }: { restaurant: RestaurantWithStats; onOpen: () => void }) {
  const place = [restaurant.city, restaurant.country].filter(Boolean).join(" · ");
  const tags = restaurant.tags ?? [];

  return (
    <motion.li layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
      <button
        type="button"
        onClick={onOpen}
        className="fk-card group block w-full p-4 text-left transition-transform active:translate-x-[2px] active:translate-y-[2px] active:!shadow-brut-sm"
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-extrabold leading-tight">{restaurant.name}</p>
            {place && (
              <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted">
                <MapPin size={14} className="shrink-0" /> {place}
              </p>
            )}
            {tags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {tags.slice(0, 4).map((t) => (
                  <span key={t} className="fk-tag">
                    {tagLabel(t)}
                  </span>
                ))}
                {tags.length > 4 && <span className="fk-tag">+{tags.length - 4}</span>}
              </div>
            )}
          </div>
          <RatingBadge rating={restaurant.rating} />
        </div>

        <div className="mt-3 flex items-center gap-3 border-t-2 border-dashed border-choco/25 pt-3 text-sm">
          <span className="font-bold">{restaurant.visitCount ? plural(restaurant.visitCount, "visite", "visites") : "Pas encore de visite"}</span>
          {restaurant.visitCount > 0 && (
            <>
              <span className="text-muted">{formatEUR(restaurant.totalSpent)}</span>
              <span className="truncate text-muted">· {formatDateFR(restaurant.lastVisitAt)}</span>
            </>
          )}
          <ChevronRight size={18} className="ml-auto shrink-0 transition-transform group-hover:translate-x-0.5" />
        </div>
      </button>
    </motion.li>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <li className="fk-card-flat p-4">
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <div className="fk-skeleton h-5 w-40" />
          <div className="fk-skeleton h-4 w-24" />
          <div className="flex gap-2 pt-1">
            <div className="fk-skeleton h-5 w-16 rounded-full" />
            <div className="fk-skeleton h-5 w-20 rounded-full" />
          </div>
        </div>
        <div className="fk-skeleton h-14 w-14 rounded-2xl" />
      </div>
    </li>
  );
}
