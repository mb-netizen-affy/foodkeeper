// Petites fonctions de formatage réutilisées partout.

export function clampRating(v: number) {
  return Math.min(20, Math.max(0, v));
}

export function round1(v: number) {
  return Math.round(v * 10) / 10;
}

export function formatEUR(v: number | null | undefined) {
  if (v == null || !Number.isFinite(v)) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: Number.isInteger(round1(v)) ? 0 : 1,
  }).format(round1(v));
}

/** 15.8 → "15,8" */
export function formatNum(v: number) {
  return v.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
}

export function formatDateFR(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

/** "2026-10-10" pour un <input type="date"> (heure locale). */
export function toDateInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return todayInput();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayInput(): string {
  return toDateInput(new Date().toISOString());
}

/** Date choisie dans un <input type="date"> → ISO à midi (évite les décalages de fuseau). */
export function dateInputToISO(value: string) {
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function yearOf(iso: string) {
  const y = new Date(iso).getFullYear();
  return Number.isFinite(y) ? y : null;
}

/** Minuscule + sans accents, pour comparer/rechercher. */
export function norm(s: string | null | undefined) {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function initials(first?: string | null, last?: string | null, fallback?: string | null) {
  const a = (first ?? "").trim()[0] ?? "";
  const b = (last ?? "").trim()[0] ?? "";
  const res = (a + b).toUpperCase();
  if (res) return res;
  return (fallback?.trim()[0] ?? "?").toUpperCase();
}

export function fullName(first?: string | null, last?: string | null) {
  return `${first ?? ""} ${last ?? ""}`.trim();
}

export function plural(n: number, one: string, many: string) {
  return `${n} ${n > 1 ? many : one}`;
}
