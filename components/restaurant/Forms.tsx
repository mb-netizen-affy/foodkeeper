"use client";

import { Camera, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Stepper, TagPicker } from "@/components/ui/Inputs";
import { useToast } from "@/components/ui/Toast";
import type { VisitInput } from "@/lib/data";
import { dateInputToISO, toDateInput, todayInput } from "@/lib/format";
import { deletePhotos, signedPhotoUrls, uploadVisitPhoto } from "@/lib/photos";
import type { Visit } from "@/lib/types";

/** Champs d'une visite : date, montant, couverts + souvenirs. Utilisé pour ajouter ET modifier. */
export function VisitFields({ visit }: { visit: VisitState }) {
  const { date, setDate, price, setPrice, covers, setCovers, dishes, setDishes, comment, setComment } = visit.fields;
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

      <div className="space-y-3 rounded-2xl border-2 border-dashed border-choco/40 p-3">
        <p className="text-sm font-extrabold">
          Souvenirs <span className="font-normal text-muted">(facultatif)</span>
        </p>
        <div>
          <label className="fk-label" htmlFor="visit-dishes">Ce que tu as mangé</label>
          <input
            id="visit-dishes"
            className="fk-input"
            placeholder="ex. tartare de bœuf, mousse au chocolat"
            maxLength={300}
            value={dishes}
            onChange={(e) => setDishes(e.target.value)}
          />
        </div>
        <div>
          <label className="fk-label" htmlFor="visit-comment">Commentaire</label>
          <textarea
            id="visit-comment"
            className="fk-input min-h-20 resize-y"
            placeholder="ex. service au top, terrasse à privilégier l'été"
            maxLength={1000}
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <PhotoPicker visit={visit} />
      </div>
    </div>
  );
}

function PhotoPicker({ visit }: { visit: VisitState }) {
  const { preview, setPhotoFile, removePhoto } = visit.photo;
  const input = (
    <input
      id="visit-photo"
      type="file"
      accept="image/*"
      className="sr-only"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) setPhotoFile(f);
        e.target.value = "";
      }}
    />
  );

  if (!preview) {
    return (
      <label
        htmlFor="visit-photo"
        className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-choco bg-paper px-4 py-3 font-bold"
      >
        <Camera size={18} /> Ajouter une photo
        {input}
      </label>
    );
  }

  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={preview} alt="Photo de la visite" className="h-44 w-full rounded-2xl border-2 border-choco object-cover" />
      <div className="grid grid-cols-2 gap-2">
        <label htmlFor="visit-photo" className="fk-btn fk-btn-ghost !min-h-10 !py-2 text-sm">
          <Camera size={16} /> Changer
          {input}
        </label>
        <button type="button" className="fk-btn fk-btn-ghost !min-h-10 !py-2 text-sm" onClick={removePhoto}>
          <Trash2 size={16} /> Retirer
        </button>
      </div>
    </div>
  );
}

export type VisitState = ReturnType<typeof useVisitState>;

export function useVisitState(initial?: Visit | null) {
  const [date, setDate] = useState(initial ? toDateInput(initial.visited_at) : todayInput());
  const [price, setPrice] = useState(initial?.price_eur != null ? String(initial.price_eur) : "");
  const [covers, setCovers] = useState(initial?.covers ?? 2);
  const [dishes, setDishes] = useState(initial?.dishes ?? "");
  const [comment, setComment] = useState(initial?.comment ?? "");

  // Photo : nouvelle photo choisie, ou suppression de l'ancienne
  const [photoFile, setPhotoFileState] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [existingUrl, setExistingUrl] = useState<string | null>(null);
  const existingPath = initial?.photo_path ?? null;

  useEffect(() => {
    if (!existingPath) return;
    let alive = true;
    signedPhotoUrls([existingPath]).then((urls) => alive && setExistingUrl(urls[existingPath] ?? null));
    return () => {
      alive = false;
    };
  }, [existingPath]);

  const fileUrl = useMemo(() => (photoFile ? URL.createObjectURL(photoFile) : null), [photoFile]);
  useEffect(() => () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

  const preview = fileUrl ?? (!photoRemoved ? existingUrl : null);

  const setPhotoFile = (f: File) => {
    setPhotoFileState(f);
    setPhotoRemoved(false);
  };
  const removePhoto = () => {
    setPhotoFileState(null);
    setPhotoRemoved(true);
  };

  const parsed = Number(price.replace(",", "."));
  const valid = price.trim() !== "" && Number.isFinite(parsed) && parsed >= 0 && covers >= 1 && date !== "";

  /**
   * Prépare l'enregistrement : envoie la nouvelle photo s'il y en a une.
   * `commit` supprime l'ancienne photo une fois la visite enregistrée,
   * `rollback` supprime la nouvelle si l'enregistrement échoue.
   */
  const prepare = async (userId: string) => {
    const newPath = photoFile ? await uploadVisitPhoto(userId, photoFile) : null;
    const photo_path = newPath ?? (photoRemoved ? null : existingPath);
    const input: VisitInput = {
      price_eur: parsed,
      covers,
      visited_at: dateInputToISO(date),
      dishes: dishes.trim() || null,
      comment: comment.trim() || null,
      photo_path,
    };
    return {
      input,
      commit: async () => {
        if (existingPath && existingPath !== photo_path) await deletePhotos([existingPath]);
      },
      rollback: async () => {
        if (newPath) await deletePhotos([newPath]);
      },
    };
  };

  return {
    fields: { date, setDate, price, setPrice, covers, setCovers, dishes, setDishes, comment, setComment },
    photo: { preview, setPhotoFile, removePhoto },
    valid,
    prepare,
  };
}

/** Formulaire visite complet avec bouton d'envoi. */
export function VisitForm({
  userId,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  userId: string;
  initial?: Visit | null;
  submitLabel: string;
  /** Renvoie true si l'enregistrement a réussi. */
  onSubmit: (v: VisitInput) => Promise<boolean>;
  onCancel: () => void;
}) {
  const visit = useVisitState(initial);
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!visit.valid) return;
        setSaving(true);
        try {
          const prepared = await visit.prepare(userId);
          const ok = await onSubmit(prepared.input);
          await (ok ? prepared.commit() : prepared.rollback());
        } catch (err) {
          console.error(err);
          toast("La photo n'a pas pu être envoyée", "error");
        } finally {
          setSaving(false);
        }
      }}
    >
      <VisitFields visit={visit} />
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="fk-btn fk-btn-ghost" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="fk-btn fk-btn-primary" disabled={!visit.valid || saving}>
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
  onSubmit: (rating: number, tags: string[]) => Promise<unknown>;
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