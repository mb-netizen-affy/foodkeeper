"use client";

import { ChevronRight, Loader, Search, X } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar, PageHeader } from "@/components/ui/Blocks";
import { useAuth } from "@/lib/auth";
import { gourmetBadge, topTags, type Badge } from "@/lib/badge";
import { fullName, initials, plural } from "@/lib/format";
import { supabase } from "@/lib/supabaseClient";

type Result = {
  id: string;
  name: string | null;
  last_name: string | null;
  restaurantCount: number;
  badge: Badge;
};

/** Retire les caractères qui cassent le filtre Supabase (.or) : virgules, parenthèses, %… */
function safeQuery(q: string) {
  return q.replace(/[,()%*\\:"']/g, " ").replace(/\s+/g, " ").trim();
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const reqId = useRef(0);

  const q = safeQuery(search);

  useEffect(() => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const t = window.setTimeout(async () => {
      const req = ++reqId.current;
      setSearching(true);
      try {
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id,name,last_name")
          .eq("is_public", true)
          .neq("id", user.id)
          .or(`name.ilike.%${q}%,last_name.ilike.%${q}%`)
          .order("updated_at", { ascending: false })
          .limit(25);
        if (req !== reqId.current) return;
        if (error || !profiles?.length) {
          setResults([]);
          return;
        }

        // Nombre de restos + badge de chaque profil trouvé
        const { data: restos } = await supabase
          .from("restaurants")
          .select("user_id,tags")
          .in("user_id", profiles.map((p) => p.id));
        if (req !== reqId.current) return;

        setResults(
          profiles.map((p) => {
            const mine = (restos ?? []).filter((r) => r.user_id === p.id) as { tags: string[] | null }[];
            return {
              ...p,
              restaurantCount: mine.length,
              badge: gourmetBadge(topTags(mine).map((t) => t.tag)),
            };
          })
        );
      } finally {
        if (req === reqId.current) setSearching(false);
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [q, user.id]);

  return (
    <>
      <PageHeader title="Communauté" subtitle="Découvre les carnets publics des autres gourmands." />

      <div className="relative mb-5">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Prénom ou nom…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="fk-input !pl-11 !pr-12"
          aria-label="Rechercher un utilisateur"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {searching ? (
            <Loader size={18} className="animate-spin text-muted" />
          ) : search ? (
            <button type="button" onClick={() => setSearch("")} className="p-1" aria-label="Effacer">
              <X size={18} />
            </button>
          ) : null}
        </div>
      </div>

      {q.length < 2 ? (
        <div className="fk-card-flat border-dashed px-6 py-10 text-center">
          <div className="mb-3 text-5xl" aria-hidden>
            👥
          </div>
          <p className="mx-auto max-w-xs text-sm text-muted">
            Tape au moins deux lettres. Seuls les comptes en mode <b className="text-choco">public</b> apparaissent ici.
          </p>
        </div>
      ) : !searching && results.length === 0 ? (
        <p className="text-center text-sm text-muted">Aucun carnet public pour « {q} ».</p>
      ) : (
        <ul className="space-y-3">
          {results.map((p, i) => {
            const name = fullName(p.name, p.last_name) || "Gourmand anonyme";
            return (
              <motion.li key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/p/${p.id}`} className="fk-card flex items-center gap-3 p-3 active:translate-x-[2px] active:translate-y-[2px] active:!shadow-brut-sm">
                  <Avatar text={initials(p.name, p.last_name)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold">{name}</p>
                    <p className="truncate text-sm text-muted">
                      {plural(p.restaurantCount, "resto", "restos")} · {p.badge.emoji} {p.badge.label}
                    </p>
                  </div>
                  <ChevronRight size={20} className="shrink-0" />
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}
    </>
  );
}
