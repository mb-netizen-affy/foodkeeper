import { NextResponse } from "next/server";

// Détails d'un lieu Google Places (API « New »), appelés côté serveur.

type GooglePlace = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  primaryType?: string;
  photos?: { name?: string }[];
};

const FIELDS = ["id", "displayName", "formattedAddress", "location", "rating", "userRatingCount", "primaryType", "photos"].join(",");

export async function POST(req: Request) {
  try {
    const { placeId } = (await req.json()) as { placeId?: unknown };
    if (typeof placeId !== "string" || !/^[\w-]+$/.test(placeId)) {
      return NextResponse.json({ error: "placeId invalide" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY manquante" }, { status: 500 });

    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=fr`, {
      headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": FIELDS },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Erreur Google Places", details: await res.text() }, { status: 502 });
    }

    const p = (await res.json()) as GooglePlace;
    return NextResponse.json({
      placeId: p.id,
      name: p.displayName?.text ?? "",
      address: p.formattedAddress ?? "",
      ratingGoogle: p.rating ?? null,
      userRatingCount: p.userRatingCount ?? null,
      primaryType: p.primaryType ?? null,
      lat: p.location?.latitude ?? null,
      lng: p.location?.longitude ?? null,
      photoName: p.photos?.[0]?.name ?? null,
    });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur", details: String(e) }, { status: 500 });
  }
}
