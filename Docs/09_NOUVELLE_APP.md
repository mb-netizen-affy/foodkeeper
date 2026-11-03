# 09 — Démarrer une nouvelle app de la famille « Keeper »

> 📌 **Document commun à toutes les apps.** Suis cette check-list dans l'ordre.

## Étape 1 — Créer le projet
- [ ] `cd C:\Dev` puis `npx create-next-app@latest <nom-app>` (TypeScript ✅, Tailwind ✅, App Router ✅, ESLint ✅)
- [ ] `npm install @supabase/supabase-js motion lucide-react`
- [ ] Créer un **nouveau projet Supabase** (une base par app), en région Europe
- [ ] Créer `.env.local` et `.env.example`

## Étape 2 — Reprendre le socle commun (copier depuis FoodKeeper)
- [ ] `app/globals.css` → changer **la palette** et le **préfixe** des classes (`fk-` → `xx-`)
- [ ] `app/layout.tsx` (police Bricolage Grotesque, script du thème, toasts)
- [ ] `components/ui/` : `Sheet`, `Toast`, `Blocks`, `Inputs`
- [ ] `components/AppChrome.tsx` : en-tête, barre du bas, menu latéral, bulle compte → changer les onglets
- [ ] `lib/` : `supabaseClient.ts`, `auth.tsx`, `theme.ts`, `themeScript.ts` (changer la clé `fk-theme`), `format.ts`
- [ ] `app/(auth)/login/` : page de connexion
- [ ] `app/(app)/layout.tsx` : structure responsive
- [ ] `app/(app)/profile/` : page **Mon compte** (voir `06_PAGE_COMPTE.md`)
- [ ] `Docs/` : copier les documents **communs** (04, 05, 06, 08, 09), écrire les spécifiques (00, 01, 02, 03, 07, CHANGELOG)

## Étape 3 — Base de données
- [ ] Script `supabase/01_…sql` : tables + `profiles` + **RLS activé** sur chaque table
- [ ] Toujours une colonne `user_id` + des règles « je ne vois que les miennes »

## Étape 4 — Identité visuelle
- [ ] Palette remplie dans `04_DIRECTION_ARTISTIQUE.md`
- [ ] Logo dans `public/logo.png` (carré, 512px minimum)
- [ ] `app/icon.png` + `app/favicon.ico`
- [ ] `themeColor` dans `app/layout.tsx` = couleur de fond de l'app

## Étape 5 — Avant la mise en ligne
- [ ] Tests responsive : 390 / 820 / 1440px, en clair et en sombre (`05_RESPONSIVE.md`)
- [ ] Check-list sécurité (`03_SECURITE.md`)
- [ ] Dépôt GitHub **privé**, déploiement Vercel, URL ajoutée dans Supabase (`07_DEPLOIEMENT.md`)
- [ ] Avant d'ouvrir au public : mentions légales, confidentialité, export et suppression de compte

## Navigation type

| Position | Mobile (barre du bas, 4 onglets max) | Ordinateur (menu latéral) |
|---|---|---|
| 1 | Accueil / liste principale | idem |
| 2 | Ajouter | idem |
| 3 | Vue n°2 (stats, carte…) | idem + vues secondaires |
| 4 | Vue n°3 | idem |
| Compte | bulle d'initiales en haut à droite | carte en bas du menu |
