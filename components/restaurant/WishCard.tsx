"use client";

// Carte d'un resto de la liste « À tester ».

import { Check, ExternalLink, MapPin, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { formatDateFR } from "@/lib/format";
import { mapsUrl } from "@/lib/places";
import type { WishItem } from "@/lib/types";

export default function WishCard({ item, onDelete }: { item: WishItem; onDelete: () => void }) {
  const place = [item.city, item.country].filter(Boolean).join(" · ");

  return (
    <motion.li layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
      <article className="fk-card border-dashed p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-extrabold leading-tight">{item.name}</p>
            {place && (
              <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted">
                <MapPin size={14} className="shrink-0" /> {place}
              </p>
            )}
          </div>
          <button type="button" className="fk-icon-btn" onClick={onDelete} aria-label={`Retirer ${item.name} de la liste`}>
            <Trash2 size={16} />
          </button>
        </div>

        {item.note && <p className="mt-2 rounded-xl bg-sand px-3 py-2 text-sm italic">« {item.note} »</p>}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link href={`/search?place=${encodeURIComponent(item.place_id)}`} className="fk-btn fk-btn-accent !min-h-10 !px-4 !py-2 text-sm">
            <Check size={16} strokeWidth={3} /> J&apos;y suis allé
          </Link>
          {item.lat != null && item.lng != null && (
            <a
              href={mapsUrl(item.lat, item.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="fk-btn fk-btn-ghost !min-h-10 !px-4 !py-2 text-sm"
            >
              Maps <ExternalLink size={14} />
            </a>
          )}
          <span className="ml-auto text-xs text-muted">repéré le {formatDateFR(item.created_at)}</span>
        </div>
      </article>
    </motion.li>
  );
}