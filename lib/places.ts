// Extraction ville / pays depuis l'adresse formatée de Google Places.
// Ex. "12 Rue X, 75011 Paris, France" → ville "Paris", pays "France".

export function cityFromAddress(address: string) {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  const candidate = parts.length >= 2 ? parts[parts.length - 2] : "";
  return candidate.replace(/^\d{4,5}\s+/, "").trim();
}

export function countryFromAddress(address: string) {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
}

export function mapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
