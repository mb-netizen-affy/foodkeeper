import { NextResponse } from "next/server";

// Autocomplétion Google Places (API « New »), appelée côté serveur pour cacher la clé.

type Suggestion = { placePrediction?: { placeId?: string; text?: { text?: string } } };

export async function POST(req: Request) {
  try {
    const { input } = (await req.json()) as { input?: unknown };
    if (typeof input !== "string" || !input.trim()) {
      return NextResponse.json({ predictions: [] });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY manquante" }, { status: 500 });

    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey },
      body: JSON.stringify({
        input: input.slice(0, 120),
        includedPrimaryTypes: ["restaurant"], // uniquement des restaurants
        languageCode: "fr",
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Erreur Google Places", details: await res.text() }, { status: 502 });
    }

    const data = (await res.json()) as { suggestions?: Suggestion[] };
    const predictions = (data.suggestions ?? [])
      .map((s) => ({ placeId: s.placePrediction?.placeId, text: s.placePrediction?.text?.text }))
      .filter((p) => p.placeId && p.text);

    return NextResponse.json({ predictions });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur", details: String(e) }, { status: 500 });
  }
}
