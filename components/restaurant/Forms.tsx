"use client";

import { useState } from "react";
import { Stepper, TagPicker } from "@/components/ui/Inputs";
import { dateInputToISO, toDateInput, todayInput } from "@/lib/format";
import type { VisitInput } from "@/lib/data";
import type { Visit } from "@/lib/types";

/** Champs d'une visite : date, montant, couverts. Utilisé pour ajouter ET modifier. */
export function VisitFields({
  date,
  setDate,
  price,
  setPrice,
  covers,
  setCovers,
}: {
  date: string;
  setDate: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  covers: number;
  setCovers: (v: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="fk-label" htmlFor="visit-date">Date</label>
          <input id="visit-date" type="date" className="fk-input" value={date} max={todayInput()} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="fk-label" htmlFor="visit-price">Addition (€)</label>
          <input
            id="visit-price"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            placeholder="ex. 48"
            className="fk-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>
      <div>
        <span className="fk-label">Couverts</span>
        <Stepper label="Couverts" value={covers} onChange={setCovers} min={1} max={30} />
      </div>
    </div>
  );
}

export function useVisitState(initial?: Visit | null) {
  const [date, setDate] = useState(initial ? toDateInput(initial.visited_at) : todayInput());
  const [price, setPrice] = useState(initial?.price_eur != null ? String(initial.price_eur) : "");
  const [covers, setCovers] = useState(initial?.covers ?? 2);

  const parsed = Number(price.replace(",", "."));
  const valid = price.trim() !== "" && Number.isFinite(parsed) && parsed >= 0 && covers >= 1 && date !== "";

  const toInput = (): VisitInput => ({
    price_eur: parsed,
    covers,
    visited_at: dateInputToISO(date),
  });

  return { fields: { date, setDate, price, setPrice, covers, setCovers }, valid, toInput };
}

/** Formulaire visite complet avec bouton d'envoi. */
export function VisitForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Visit | null;
  submitLabel: string;
  onSubmit: (v: VisitInput) => Promise<void>;
  onCancel: () => void;
}) {
  const { fields, valid, toInput } = useVisitState(initial);
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valid) return;
        setSaving(true);
        try {
          await onSubmit(toInput());
        } finally {
          setSaving(false);
        }
      }}
    >
      <VisitFields {...fields} />
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="fk-btn fk-btn-ghost" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="fk-btn fk-btn-primary" disabled={!valid || saving}>
          {saving ? "…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

/** Note /20 + tags d'un restaurant. */
export function RatingTagsForm({
  initialRating,
  initialTags,
  onSubmit,
  onCancel,
}: {
  initialRating: number;
  initialTags: string[];
  onSubmit: (rating: number, tags: string[]) => Promise<void>;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(initialRating);
  const [tags, setTags] = useState(initialTags);
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <span className="fk-label">Ta note</span>
        <Stepper label="Note" value={rating} onChange={setRating} min={0} max={20} suffix="/20" />
      </div>
      <div>
        <span className="fk-label">Tags</span>
        <TagPicker value={tags} onChange={setTags} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="fk-btn fk-btn-ghost" onClick={onCancel}>
          Annuler
        </button>
        <button
          type="button"
          className="fk-btn fk-btn-primary"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSubmit(rating, tags);
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
