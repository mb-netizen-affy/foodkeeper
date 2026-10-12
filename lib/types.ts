// Types partagés — calqués sur les tables Supabase existantes
// (restaurants, restaurant_visits, profiles). Aucune migration nécessaire.

export type Restaurant = {
  id: string;
  user_id?: string;
  name: string;
  city: string | null;
  country: string | null;
  rating: number | null;
  tags: string[] | null;
  created_at: string;
  place_id?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type Visit = {
  id: string;
  restaurant_id: string;
  price_eur: number | null;
  visited_at: string;
  covers: number | null;
  // Souvenirs (facultatifs)
  dishes?: string | null;
  comment?: string | null;
  photo_path?: string | null;
};

/** Restaurant enrichi des stats de ses visites (calculées côté client). */
export type RestaurantWithStats = Restaurant & {
  visitCount: number;
  totalSpent: number;
  lastVisitAt: string | null;
};

/** Resto repéré, pas encore visité (table `wishlist`, privée). */
export type WishItem = {
  id: string;
  place_id: string;
  name: string;
  city: string | null;
  country: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  note: string | null;
  created_at: string;
};

export type Locale = "fr" | "en" | "es" | "it" | "de";

export type Profile = {
  name: string | null;
  last_name: string | null;
  locale: Locale;
  is_public: boolean;
};