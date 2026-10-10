"use client";

import { Minus, Plus } from "lucide-react";
import { TAG_GROUPS, tagLabel } from "@/lib/tags";

/** Compteur − valeur + (note /20, couverts…). */
export function Stepper({
  value,
  onChange,
  min,
  max,
  suffix,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix?: string;
  label: string;
}) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button type="button" className="fk-icon-btn" onClick={() => set(value - 1)} disabled={value <= min} aria-label={`${label} : moins`}>
        <Minus size={18} strokeWidth={2.75} />
      </button>
      <div className="flex min-w-[5.5rem] flex-1 items-baseline justify-center gap-1 rounded-2xl border-2 border-choco bg-paper px-3 py-1.5">
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) set(Math.round(n));
          }}
          className="w-12 bg-transparent text-center text-2xl font-extrabold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          aria-label={label}
        />
        {suffix && <span className="text-sm font-bold text-muted">{suffix}</span>}
      </div>
      <button type="button" className="fk-icon-btn" onClick={() => set(value + 1)} disabled={value >= max} aria-label={`${label} : plus`}>
        <Plus size={18} strokeWidth={2.75} />
      </button>
    </div>
  );
}

/** Sélecteur de tags groupés (Cuisine, Concept…). */
export function TagPicker({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const toggle = (tag: string) => onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);
  return (
    <div className="space-y-3">
      {TAG_GROUPS.map((g) => (
        <div key={g.title}>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">{g.title}</p>
          <div className="flex flex-wrap gap-2">
            {g.tags.map((tag) => (
              <button key={tag} type="button" className="fk-chip" aria-pressed={value.includes(tag)} onClick={() => toggle(tag)}>
                {tagLabel(tag)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Interrupteur on/off. */
export function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 border-choco transition-colors disabled:opacity-60 ${
        checked ? "bg-paprika" : "bg-sand"
      }`}
    >
      <span
        className={`absolute h-5 w-5 rounded-full border-2 border-choco bg-paper transition-transform ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/** Ligne de chips pour filtrer par année. */
export function YearChips({
  years,
  value,
  onChange,
}: {
  years: number[];
  value: number | "all";
  onChange: (v: number | "all") => void;
}) {
  return (
    <div className="-mx-1 fk-scroll-x">
      <button type="button" className="fk-chip" aria-pressed={value === "all"} onClick={() => onChange("all")}>
        Tout
      </button>
      {years.map((y) => (
        <button key={y} type="button" className="fk-chip" aria-pressed={value === y} onClick={() => onChange(y)}>
          {y}
        </button>
      ))}
    </div>
  );
}
