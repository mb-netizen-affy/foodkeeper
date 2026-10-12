"use client";

// Carte des restos (Leaflet + fond de carte OpenStreetMap, gratuit, sans clé).
// Chargée uniquement dans le navigateur (voir app/(app)/map/page.tsx).

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Check, LocateFixed } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { formatEUR, plural } from "@/lib/format";
import { tagLabel } from "@/lib/tags";
import type { RestaurantWithStats, WishItem } from "@/lib/types";

const FRANCE: [number, number] = [46.6, 2.4];

const BOOKMARK_SVG =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>';

function restoIcon(rating: number | null) {
  const fav = rating != null && rating >= 16;
  return L.divIcon({
    className: "fk-pin-wrap",
    html: `<div class="fk-pin ${fav ? "fk-pin-fav" : "fk-pin-resto"}">${rating ?? "•"}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

const wishIcon = L.divIcon({
  className: "fk-pin-wrap",
  html: `<div class="fk-pin fk-pin-wish">${BOOKMARK_SVG}</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

/** Cadre la carte sur tous les points affichés. */
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    if (!points.length) {
      map.setView(FRANCE, 5);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

/** Bouton « Autour de moi » (géolocalisation du navigateur). */
function LocateButton({ onFound }: { onFound: (pos: [number, number]) => void }) {
  const map = useMap();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="fk-btn fk-btn-ghost absolute bottom-4 right-4 z-[500] !min-h-11 !px-4 !py-2 text-sm"
      disabled={busy}
      onClick={() => {
        if (!navigator.geolocation) return;
        setBusy(true);
        navigator.geolocation.getCurrentPosition(
          (p) => {
            const pos: [number, number] = [p.coords.latitude, p.coords.longitude];
            onFound(pos);
            map.flyTo(pos, 15, { duration: 0.8 });
            setBusy(false);
          },
          () => setBusy(false),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }}
    >
      <LocateFixed size={16} /> {busy ? "…" : "Autour de moi"}
    </button>
  );
}

export default function RestoMap({
  restaurants,
  wishes,
  onOpenRestaurant,
}: {
  restaurants: RestaurantWithStats[];
  wishes: WishItem[];
  onOpenRestaurant: (id: string) => void;
}) {
  const [me, setMe] = useState<[number, number] | null>(null);

  const points = useMemo(
    () => [
      ...restaurants.map((r) => [r.lat as number, r.lng as number] as [number, number]),
      ...wishes.map((w) => [w.lat as number, w.lng as number] as [number, number]),
    ],
    [restaurants, wishes]
  );

  return (
    <MapContainer center={FRANCE} zoom={5} scrollWheelZoom className="fk-map h-full w-full" attributionControl>
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      <FitBounds points={points} />

      {wishes.map((w) => (
        <Marker key={`w-${w.id}`} position={[w.lat as number, w.lng as number]} icon={wishIcon}>
          <Popup>
            <div className="min-w-[180px] space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">À tester</p>
              <p className="text-base font-extrabold leading-tight">{w.name}</p>
              {w.city && <p className="text-sm text-muted">{w.city}</p>}
              {w.note && <p className="text-sm italic">« {w.note} »</p>}
              <Link
                href={`/search?place=${encodeURIComponent(w.place_id)}`}
                className="fk-btn fk-btn-accent mt-1 !min-h-9 w-full !px-3 !py-1.5 text-sm"
              >
                <Check size={15} strokeWidth={3} /> J&apos;y suis allé
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}

      {restaurants.map((r) => (
        <Marker key={`r-${r.id}`} position={[r.lat as number, r.lng as number]} icon={restoIcon(r.rating)}>
          <Popup>
            <div className="min-w-[180px] space-y-1.5">
              <p className="text-base font-extrabold leading-tight">{r.name}</p>
              <p className="text-sm text-muted">
                {r.rating != null ? `${r.rating}/20 · ` : ""}
                {r.visitCount ? `${plural(r.visitCount, "visite", "visites")} · ${formatEUR(r.totalSpent)}` : "pas encore de visite"}
              </p>
              {(r.tags ?? []).length > 0 && (
                <p className="text-xs text-muted">{(r.tags ?? []).slice(0, 3).map(tagLabel).join(" · ")}</p>
              )}
              <button
                type="button"
                onClick={() => onOpenRestaurant(r.id)}
                className="fk-btn fk-btn-primary mt-1 !min-h-9 w-full !px-3 !py-1.5 text-sm"
              >
                Voir la fiche
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {me && (
        <CircleMarker
          center={me}
          radius={9}
          pathOptions={{ className: "fk-me", weight: 3, fillOpacity: 1 }}
        />
      )}
      <LocateButton onFound={setMe} />
    </MapContainer>
  );
}