"use client";

// Fiche d'un restaurant : infos, historique des visites, modifications.

import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import Sheet from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { addVisit, deleteRestaurant, deleteVisit, updateRestaurant, updateVisit } from "@/lib/data";
import { formatDateFR, formatEUR, plural, round1 } from "@/lib/format";
import { mapsUrl } from "@/lib/places";
import { tagLabel } from "@/lib/tags";
import type { RestaurantWithStats, Visit } from "@/lib/types";
import { RatingTagsForm, VisitForm } from "./Forms";
import { RatingBadge } from "./RestaurantCard";

type Mode =
  | { kind: "detail" }
  | { kind: "edit" }
  | { kind: "addVisit" }
  | { kind: "editVisit"; visit: Visit }
  | { kind: "deleteVisit"; visit: Visit }
  | { kind: "deleteRestaurant" };

export default function RestaurantSheet({
  userId,
  restaurant,
  visits,
  onClose,
  onChanged,
}: {
  userId: string;
  restaurant: RestaurantWithStats | null;
  visits: Visit[];
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const toast = useToast();
  const [mode, setMode] = useState<Mode>({ kind: "detail" });
  const [lastId, setLastId] = useState<string | null>(null);

  // Revient sur la fiche quand on ouvre un autre restaurant
  if ((restaurant?.id ?? null) !== lastId) {
    setLastId(restaurant?.id ?? null);
    setMode({ kind: "detail" });
  }

  const back = () => setMode({ kind: "detail" });

  const run = async (action: () => PromiseLike<{ error: unknown }>, ok: string, ko: string, then?: () => void) => {
    const { error } = await action();
    if (error) {
      console.error(error);
      toast(ko, "error");
      return;
    }
    await onChanged();
    toast(ok);
    (then ?? back)();
  };

  const myVisits = restaurant
    ? visits.filter((v) => v.restaurant_id === restaurant.id).sort((a, b) => (a.visited_at < b.visited_at ? 1 : -1))
    : [];

  const titles: Record<Mode["kind"], string> = {
    detail: restaurant?.name ?? "",
    edit: "Note & tags",
    addVisit: "Nouvelle visite",
    editVisit: "Modifier la visite",
    deleteVisit: "Supprimer la visite ?",
    deleteRestaurant: "Supprimer ce resto ?",
  };

  return (
    <Sheet open={Boolean(restaurant)} onClose={onClose} title={titles[mode.kind]}>
      {restaurant && mode.kind === "detail" && (
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <RatingBadge rating={restaurant.rating} size="lg" />
            <div className="min-w-0 flex-1 space-y-2">
              {restaurant.address && <p className="text-sm text-muted">{restaurant.address}</p>}
              {restaurant.lat != null && restaurant.lng != null && (
                <a
                  href={mapsUrl(restaurant.lat, restaurant.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-bold underline decoration-paprika decoration-2 underline-offset-4"
                >
                  Ouvrir dans Maps <ExternalLink size={14} />
                </a>
              )}
              {(restaurant.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(restaurant.tags ?? []).map((t) => (
                    <span key={t} className="fk-tag">
                      {tagLabel(t)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <MiniStat label="Visites" value={String(restaurant.visitCount)} />
            <MiniStat label="Dépensé" value={formatEUR(restaurant.totalSpent)} />
            <MiniStat
              label="€ / visite"
              value={restaurant.visitCount ? formatEUR(round1(restaurant.totalSpent / restaurant.visitCount)) : "—"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="fk-btn fk-btn-accent" onClick={() => setMode({ kind: "addVisit" })}>
              <Plus size={18} strokeWidth={2.75} /> Visite
            </button>
            <button type="button" className="fk-btn fk-btn-ghost" onClick={() => setMode({ kind: "edit" })}>
              <Pencil size={16} strokeWidth={2.5} /> Note & tags
            </button>
          </div>

          <div>
            <p className="mb-2 text-sm font-extrabold uppercase tracking-wider">Historique</p>
            {myVisits.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed border-choco/40 p-4 text-center text-sm text-muted">
                Aucune visite enregistrée.
              </p>
            ) : (
              <ul className="divide-y-2 divide-dashed divide-choco/20 rounded-2xl border-2 border-choco bg-cream/50">
                {myVisits.map((v) => (
                  <li key={v.id} className="flex items-center gap-2 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{formatDateFR(v.visited_at)}</p>
                      <p className="text-sm text-muted">
                        {formatEUR(v.price_eur)} · {plural(v.covers ?? 1, "couvert", "couverts")}
                      </p>
                    </div>
                    <button type="button" className="fk-icon-btn" aria-label="Modifier la visite" onClick={() => setMode({ kind: "editVisit", visit: v })}>
                      <Pencil size={16} />
                    </button>
                    <button type="button" className="fk-icon-btn" aria-label="Supprimer la visite" onClick={() => setMode({ kind: "deleteVisit", visit: v })}>
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            className="mx-auto flex items-center gap-2 text-sm font-bold text-danger underline underline-offset-4"
            onClick={() => setMode({ kind: "deleteRestaurant" })}
          >
            <Trash2 size={15} /> Supprimer ce restaurant
          </button>
        </div>
      )}

      {restaurant && mode.kind === "edit" && (
        <RatingTagsForm
          initialRating={Number(restaurant.rating ?? 0)}
          initialTags={restaurant.tags ?? []}
          onCancel={back}
          onSubmit={(rating, tags) =>
            run(() => updateRestaurant(userId, restaurant.id, { rating, tags }), "Modifications enregistrées", "Erreur lors de l'enregistrement")
          }
        />
      )}

      {restaurant && mode.kind === "addVisit" && (
        <VisitForm
          submitLabel="Ajouter"
          onCancel={back}
          onSubmit={(v) => run(() => addVisit(userId, restaurant.id, v), "Visite ajoutée 🍴", "Erreur lors de l'ajout")}
        />
      )}

      {mode.kind === "editVisit" && (
        <VisitForm
          initial={mode.visit}
          submitLabel="Enregistrer"
          onCancel={back}
          onSubmit={(v) => run(() => updateVisit(userId, mode.visit.id, v), "Visite modifiée", "Erreur lors de l'enregistrement")}
        />
      )}

      {mode.kind === "deleteVisit" && (
        <Confirm
          text={
            <>
              La visite du <b className="text-choco">{formatDateFR(mode.visit.visited_at)}</b> ({formatEUR(mode.visit.price_eur)}) sera
              définitivement supprimée.
            </>
          }
          onCancel={back}
          onConfirm={() => run(() => deleteVisit(userId, mode.visit.id), "Visite supprimée", "Erreur lors de la suppression")}
        />
      )}

      {restaurant && mode.kind === "deleteRestaurant" && (
        <Confirm
          text={
            <>
              <b className="text-choco">{restaurant.name}</b> et ses {plural(restaurant.visitCount, "visite", "visites")} seront
              définitivement supprimés.
            </>
          }
          onCancel={back}
          onConfirm={() =>
            run(() => deleteRestaurant(userId, restaurant.id), "Restaurant supprimé", "Erreur lors de la suppression", onClose)
          }
        />
      )}
    </Sheet>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-choco bg-sand px-2 py-2.5">
      <p className="truncate text-lg font-extrabold tabular-nums">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}

function Confirm({ text, onCancel, onConfirm }: { text: React.ReactNode; onCancel: () => void; onConfirm: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-5">
      <p className="text-muted">{text}</p>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="fk-btn fk-btn-ghost" onClick={onCancel}>
          Annuler
        </button>
        <button
          type="button"
          className="fk-btn fk-btn-danger"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
            } finally {
              setBusy(false);
            }
          }}
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
