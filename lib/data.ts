"use client";

// Accès aux données Supabase (restaurants + visites) regroupé ici,
// au lieu d'être recopié dans chaque page.

import { useCallback, useEffect, useState } from "react";
import { deletePhotos } from "./photos";
import { supabase } from "./supabaseClient";
import type { Restaurant, Visit, WishItem } from "./types";

const RESTO_FIELDS = "id,name,city,country,rating,tags,created_at,place_id,address,lat,lng";
const VISIT_FIELDS = "id,restaurant_id,price_eur,visited_at,covers,dishes,comment,photo_path";

export async function loadRestaurants(userId: string) {
  const { data, error } = await supabase
    .from("restaurants")
    .select(RESTO_FIELDS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Restaurant[];
}

export async function loadVisits(userId: string) {
  const { data, error } = await supabase.from("restaurant_visits").select(VISIT_FIELDS).eq("user_id", userId);
  if (error) throw error;
  return (data ?? []) as Visit[];
}

/** Restaurants + visites d'un utilisateur, avec rechargement. */
export function useNotebook(userId: string) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [r, v] = await Promise.all([loadRestaurants(userId), loadVisits(userId)]);
      setRestaurants(r);
      setVisits(v);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Impossible de charger tes données.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Chargement initial des données Supabase
    reload();
  }, [reload]);

  return { restaurants, visits, loading, error, reload };
}

// ---------- Liste « À tester » ----------

const WISH_FIELDS = "id,place_id,name,city,country,address,lat,lng,note,created_at";

/** Liste « À tester ». Si la table n'existe pas encore, renvoie une liste vide sans casser la page. */
export function useWishlist(userId: string) {
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select(WISH_FIELDS)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems((data ?? []) as WishItem[]);
    } catch (e) {
      console.error("Liste À tester :", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, loading, reload };
}

export type WishInput = Omit<WishItem, "id" | "created_at">;

export async function addToWishlist(userId: string, item: WishInput) {
  return supabase.from("wishlist").insert({ user_id: userId, ...item });
}

export async function deleteWish(userId: string, id: string) {
  return supabase.from("wishlist").delete().eq("id", id).eq("user_id", userId);
}

/** Retire un lieu de la liste (quand on y est allé). Silencieux si absent. */
export async function removeFromWishlistByPlace(userId: string, placeId: string) {
  return supabase.from("wishlist").delete().eq("place_id", placeId).eq("user_id", userId);
}

// ---------- Visites ----------

export type VisitInput = {
  price_eur: number;
  covers: number;
  visited_at: string;
  dishes: string | null;
  comment: string | null;
  photo_path: string | null;
};

export async function addVisit(userId: string, restaurantId: string, v: VisitInput) {
  return supabase.from("restaurant_visits").insert({ user_id: userId, restaurant_id: restaurantId, ...v });
}

export async function updateVisit(userId: string, visitId: string, v: VisitInput) {
  return supabase.from("restaurant_visits").update(v).eq("id", visitId).eq("user_id", userId);
}

export async function deleteVisit(userId: string, visit: Visit) {
  const res = await supabase.from("restaurant_visits").delete().eq("id", visit.id).eq("user_id", userId);
  if (!res.error) await deletePhotos([visit.photo_path]);
  return res;
}

export async function updateRestaurant(userId: string, id: string, patch: { rating: number; tags: string[] }) {
  return supabase.from("restaurants").update(patch).eq("id", id).eq("user_id", userId);
}

export async function deleteRestaurant(userId: string, id: string) {
  // On supprime d'abord ses visites (pas de visites orphelines, avec ou sans cascade en base)
  // et leurs photos
  const visits = await supabase
    .from("restaurant_visits")
    .delete()
    .eq("restaurant_id", id)
    .eq("user_id", userId)
    .select("photo_path");
  if (visits.error) return visits;
  await deletePhotos((visits.data ?? []).map((v) => v.photo_path as string | null));
  return supabase.from("restaurants").delete().eq("id", id).eq("user_id", userId);
}