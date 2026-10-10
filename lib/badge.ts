// Badge « gourmet » — UNE seule règle pour toute l'app
// (avant : 3 versions différentes selon la page).
// On prend le tag le plus fréquent qui a un badge ; sinon on regarde
// le comportement (nombre de visites, notes, budget).

import { norm } from "./format";

export type Badge = { emoji: string; label: string; sub: string };

const BY_TAG: Record<string, Badge> = {
  // Cuisines
  francais: { emoji: "🥖", label: "Terroir & tradition", sub: "Cuisine favorite" },
  italien: { emoji: "🍕", label: "Italien dans l'âme", sub: "Cuisine favorite" },
  asiatique: { emoji: "🍜", label: "Addict d'Asie", sub: "Cuisine favorite" },
  indien: { emoji: "🌶️", label: "Épicé & curieux", sub: "Cuisine favorite" },
  oriental: { emoji: "🥙", label: "Saveurs d'Orient", sub: "Cuisine favorite" },
  mexicain: { emoji: "🌮", label: "Team tacos", sub: "Cuisine favorite" },
  americain: { emoji: "🍔", label: "American diner", sub: "Cuisine favorite" },
  mediterraneen: { emoji: "🫒", label: "Soleil en bouche", sub: "Cuisine favorite" },
  // Concepts
  gastronomique: { emoji: "💎", label: "Fine dining", sub: "Plutôt gastro" },
  bistrot: { emoji: "🍷", label: "Esprit bistrot", sub: "Confort food" },
  brunch: { emoji: "🥐", label: "Brunch addict", sub: "Le dimanche, c'est sacré" },
  "tapas / partage": { emoji: "🍢", label: "Team partage", sub: "Tapas & convivialité" },
  "street food": { emoji: "🛵", label: "Street-food lover", sub: "Rapide & bon" },
  "fast-food": { emoji: "🍟", label: "Fast & fun", sub: "Rapide & bon" },
  volonte: { emoji: "😋", label: "Champion de l'à volonté", sub: "Jamais rassasié" },
  // Régime / ambiance
  vegan: { emoji: "🥗", label: "Vegan mood", sub: "Green vibes" },
  romantique: { emoji: "💘", label: "Date night", sub: "Ambiance favorite" },
  familial: { emoji: "👨‍👩‍👧", label: "Family friendly", sub: "Ambiance favorite" },
};

export const DEFAULT_BADGE: Badge = { emoji: "🍽️", label: "Gourmand curieux", sub: "Toujours en exploration" };

export function gourmetBadge(
  tagsByFrequency: string[],
  behaviour?: { visitCount: number; avgRating: number; avgPerCover: number | null }
): Badge {
  for (const tag of tagsByFrequency) {
    const b = BY_TAG[norm(tag)];
    if (b) return b;
  }
  if (behaviour) {
    if (behaviour.visitCount >= 30) return { emoji: "🔥", label: "Gros mangeur", sub: "Beaucoup de visites" };
    if (behaviour.avgRating >= 16) return { emoji: "⭐", label: "Exigeant", sub: "Notes élevées" };
    if (behaviour.avgPerCover != null && behaviour.avgPerCover >= 30)
      return { emoji: "💸", label: "Grand seigneur", sub: "Budget par couvert élevé" };
  }
  return DEFAULT_BADGE;
}

/** Compte les tags d'une liste de restaurants, du plus au moins fréquent. */
export function topTags(restaurants: { tags: string[] | null }[], limit = 3) {
  const count = new Map<string, number>();
  for (const r of restaurants) {
    for (const t of r.tags ?? []) {
      const key = String(t ?? "").trim();
      if (key) count.set(key, (count.get(key) ?? 0) + 1);
    }
  }
  return Array.from(count.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, n]) => ({ tag, n }));
}
