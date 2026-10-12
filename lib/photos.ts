"use client";

// Photos des visites : compression dans le navigateur, envoi dans le
// stockage Supabase privé « visit-photos », liens d'affichage temporaires.

import { supabase } from "./supabaseClient";

const BUCKET = "visit-photos";
const MAX_SIDE = 1600; // px — largement suffisant pour un téléphone
const QUALITY = 0.82;

/** Réduit la photo (≈ 200–400 Ko au lieu de 3–5 Mo). Si le navigateur n'y arrive pas, garde l'originale. */
async function compress(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
    return blob ?? file;
  } catch {
    return file;
  }
}

/** Envoie une photo et renvoie son chemin (« <id utilisateur>/<id>.jpg »). */
export async function uploadVisitPhoto(userId: string, file: File) {
  const blob = await compress(file);
  const ext = blob.type === "image/jpeg" ? "jpg" : (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || file.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function deletePhotos(paths: (string | null | undefined)[]) {
  const list = paths.filter((p): p is string => Boolean(p));
  if (!list.length) return;
  const { error } = await supabase.storage.from(BUCKET).remove(list);
  if (error) console.error("Suppression photo :", error.message);
}

/** Liens d'affichage valables 1 h pour une liste de photos. */
export async function signedPhotoUrls(paths: string[]): Promise<Record<string, string>> {
  if (!paths.length) return {};
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
  if (error) {
    console.error("Photos :", error.message);
    return {};
  }
  const out: Record<string, string> = {};
  for (const d of data ?? []) if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
  return out;
}