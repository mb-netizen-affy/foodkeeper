// Blocs d'affichage réutilisables (titres, stats, états vides…).

import type { LucideIcon } from "lucide-react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-5 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-3xl font-extrabold leading-none tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <h2 className="text-sm font-extrabold uppercase tracking-wider">{children}</h2>
      {right}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`fk-card p-4 ${accent ? "!bg-paprika text-deep" : ""}`}>
      <p className={`text-xs font-bold uppercase tracking-wider ${accent ? "text-deep/80" : "text-muted"}`}>{label}</p>
      <p className="mt-1 truncate text-2xl font-extrabold leading-tight tabular-nums">{value}</p>
      {sub && <p className={`mt-1 text-xs ${accent ? "text-deep/80" : "text-muted"}`}>{sub}</p>}
    </div>
  );
}

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-right text-sm font-bold">{value}</span>
    </div>
  );
}

export function InsightCard({
  icon: Icon,
  title,
  main,
  sub,
}: {
  icon: LucideIcon;
  title: string;
  main: string;
  sub: string;
}) {
  return (
    <div className="fk-card flex items-start gap-3 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-choco bg-sand">
        <Icon size={20} strokeWidth={2.25} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{title}</p>
        <p className="truncate text-base font-extrabold">{main}</p>
        <p className="text-sm text-muted">{sub}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  emoji,
  title,
  text,
  children,
}: {
  emoji: string;
  title: string;
  text?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="fk-card-flat border-dashed px-6 py-10 text-center">
      <div className="mb-3 text-5xl" aria-hidden>
        {emoji}
      </div>
      <h3 className="text-lg font-extrabold">{title}</h3>
      {text && <p className="mx-auto mt-1 max-w-xs text-sm text-muted">{text}</p>}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

export function Avatar({ text, size = "md" }: { text: string; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "h-16 w-16 text-xl" : size === "sm" ? "h-10 w-10 text-sm" : "h-12 w-12 text-base";
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-2xl border-2 border-choco bg-paprika font-extrabold text-deep ${cls}`}>
      {text}
    </span>
  );
}

export function DeltaPill({ value }: { value: number | null }) {
  if (value == null) return <span className="fk-tag">—</span>;
  const arrow = value > 0 ? "↗" : value < 0 ? "↘" : "→";
  return (
    <span className={`fk-tag ${value > 0 ? "fk-tag-accent" : ""}`}>
      {arrow} {Math.abs(value)} %
    </span>
  );
}
