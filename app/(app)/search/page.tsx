"use client";

// Ajouter un restaurant (via Google Places) ou une visite à un resto déjà connu.

import { Loader, MapPin, Search, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useVisitState, VisitFields } from "@/components/restaurant/Forms";
import { PageHeader } from "@/components/ui/Blocks";
import { Stepper, TagPicker } from "@/components/ui/Inputs";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth";
import { addVisit } from "@/lib/data";
import { norm } from "@/lib/format";
import { cityFromAddress, countryFromAddress, mapsUrl } from "@/lib/places";
import { supabase } from "@/lib/supabaseClient";

type Prediction = { placeId: string; text: string };

type PlaceDetails = {
  placeId: string;
  name: string;
  address: string;
  ratingGoogle: number | null;
  userRatingCount: number | null;
  primaryType: string | null;
  lat: number | null;
  lng: number | null;
  photoName: string | null;
};

export default function SearchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PlaceDetails | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);

  const autoCache = useRef(new Map<string, Prediction[]>());
  const detailsCache = useRef(new Map<string, PlaceDetails>());
  const reqId = useRef(0);

  // Autocomplétion (avec délai pour ne pas appeler Google à chaque lettre)
  useEffect(() => {
    if (selected) return;
    const raw = query.trim();
    const key = norm(raw);
    if (key.length < 2) {
      setPredictions([]);
      return;
    }
    const cached = autoCache.current.get(key);
    if (cached) {
      setPredictions(cached);
      return;
    }
    const t = window.setTimeout(async () => {
      const req = ++reqId.current;
      setLoading(true);
      try {
        const res = await fetch("/api/places/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: raw }),
        });
        const data = await res.json();
        if (req !== reqId.current) return;
        const preds = ((data.predictions ?? []) as Prediction[]).filter((p) => p.placeId && p.text);
        autoCache.current.set(key, preds);
        setPredictions(preds);
      } catch {
        if (req === reqId.current) toast("Erreur réseau pendant la recherche", "error");
      } finally {
        if (req === reqId.current) setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [query, selected, toast]);

  const clear = () => {
    setQuery("");
    setPredictions([]);
    setSelected(null);
    setExistingId(null);
  };

  const selectPlace = async (p: Prediction) => {
    const req = ++reqId.current;
    setPredictions([]);
    setLoading(true);
    try {
      let details = detailsCache.current.get(p.placeId);
      if (!details) {
        const res = await fetch("/api/places/details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ placeId: p.placeId }),
        });
        if (!res.ok) throw new Error("details");
        details = (await res.json()) as PlaceDetails;
        detailsCache.current.set(p.placeId, details);
      }
      if (req !== reqId.current) return;

      const { data: existing } = await supabase
        .from("restaurants")
        .select("id")
        .eq("place_id", details.placeId)
        .eq("user_id", user.id)
        .maybeSingle();

      setExistingId(existing?.id ?? null);
      setSelected(details);
      setQuery(details.name);
    } catch {
      if (req === reqId.current) toast("Impossible de charger ce lieu", "error");
    } finally {
      if (req === reqId.current) setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Ajouter" subtitle="Cherche un restaurant pour l'ajouter ou noter une nouvelle visite." />

      <div className="relative mb-5">
        <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="fk-input !min-h-14 !pl-12 !pr-12 text-lg"
          placeholder="Nom du restaurant…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selected) {
              setSelected(null);
              setExistingId(null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && predictions[0]) {
              e.preventDefault();
              selectPlace(predictions[0]);
            }
            if (e.key === "Escape") setPredictions([]);
          }}
          inputMode="search"
          autoComplete="off"
          autoFocus
          aria-label="Nom du restaurant"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader size={20} className="animate-spin text-muted" />
          ) : query ? (
            <button type="button" onClick={clear} className="p-1" aria-label="Effacer">
              <X size={20} />
            </button>
          ) : null}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {predictions.length > 0 && !selected && (
          <motion.ul
            key="predictions"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fk-card divide-y-2 divide-choco/15 overflow-hidden"
          >
            {predictions.map((p) => {
              const [name, ...rest] = p.text.split(",");
              return (
                <li key={p.placeId}>
                  <button
                    type="button"
                    onClick={() => selectPlace(p)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-sand/60"
                  >
                    <MapPin size={18} className="shrink-0 text-paprika" />
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{name}</span>
                      {rest.length > 0 && <span className="block truncate text-sm text-muted">{rest.join(",").trim()}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}

        {selected && (
          <motion.div key={selected.placeId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AddForm
              place={selected}
              existingId={existingId}
              userId={user.id}
              onDone={(msg) => {
                toast(msg);
                router.push("/restaurants");
              }}
              onError={(msg) => toast(msg, "error")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!selected && predictions.length === 0 && query.trim().length < 2 && (
        <p className="mt-8 text-center text-sm text-muted">
          Astuce : tape le nom et la ville, par exemple <b className="text-choco">« Chez Janou Paris »</b>.
        </p>
      )}
    </>
  );
}

function AddForm({
  place,
  existingId,
  userId,
  onDone,
  onError,
}: {
  place: PlaceDetails;
  existingId: string | null;
  userId: string;
  onDone: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const visit = useVisitState();
  const [rating, setRating] = useState(14);
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!visit.valid) return;
    setSaving(true);
    try {
      let restaurantId = existingId;

      if (!restaurantId) {
        const { data, error } = await supabase
          .from("restaurants")
          .insert({
            user_id: userId,
            name: place.name,
            city: cityFromAddress(place.address),
            country: countryFromAddress(place.address),
            rating,
            tags,
            place_id: place.placeId,
            address: place.address,
            lat: place.lat,
            lng: place.lng,
            google_rating: place.ratingGoogle,
            google_user_ratings: place.userRatingCount,
            photo_name: place.photoName,
          })
          .select("id")
          .single();
        if (error || !data) {
          onError(error?.code === "23505" ? "Ce resto est déjà dans ton carnet" : "Erreur lors de l'ajout du restaurant");
          return;
        }
        restaurantId = data.id as string;
      }

      const { error } = await addVisit(userId, restaurantId, visit.toInput());
      if (error) {
        onError(existingId ? "Erreur lors de l'ajout de la visite" : "Resto ajouté, mais la visite n'a pas pu être enregistrée");
        return;
      }
      onDone(existingId ? "Visite ajoutée 🍴" : "Restaurant ajouté 🍴");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="fk-card overflow-hidden">
        {place.lat != null && place.lng != null && (
          <a href={mapsUrl(place.lat, place.lng)} target="_blank" rel="noopener noreferrer" className="block border-b-2 border-choco" title="Ouvrir dans Google Maps">
            <iframe
              title={`Carte : ${place.name}`}
              className="pointer-events-none h-36 w-full grayscale-[30%] sepia-[25%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${place.lat},${place.lng}&z=15&output=embed`}
            />
          </a>
        )}
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-extrabold leading-tight">{place.name}</h2>
            {existingId && <span className="fk-tag fk-tag-dark shrink-0">Déjà dans ton carnet</span>}
          </div>
          <p className="text-sm text-muted">{place.address}</p>
          {place.ratingGoogle != null && (
            <p className="flex items-center gap-1 text-sm font-bold">
              <Star size={15} className="fill-paprika text-paprika" /> {place.ratingGoogle}
              {place.userRatingCount ? <span className="font-normal text-muted">({place.userRatingCount} avis Google)</span> : null}
            </p>
          )}
        </div>
      </section>

      <section className="fk-card space-y-5 p-4">
        <h3 className="text-lg font-extrabold">{existingId ? "Nouvelle visite" : "Ta première visite"}</h3>
        <VisitFields {...visit.fields} />

        {!existingId && (
          <>
            <div>
              <span className="fk-label">Ta note</span>
              <Stepper label="Note" value={rating} onChange={setRating} min={0} max={20} suffix="/20" />
            </div>
            <div>
              <span className="fk-label">Tags</span>
              <TagPicker value={tags} onChange={setTags} />
            </div>
          </>
        )}

        <button type="button" className="fk-btn fk-btn-accent w-full" disabled={!visit.valid || saving} onClick={submit}>
          {saving ? "Ajout…" : existingId ? "Ajouter la visite" : "Ajouter à mon carnet"}
        </button>
        {!visit.valid && <p className="-mt-2 text-center text-xs text-muted">Indique le montant de l&apos;addition pour continuer.</p>}
      </section>
    </div>
  );
}
