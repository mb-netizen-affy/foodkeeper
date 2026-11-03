# 01 — Architecture

## 1. Technologies

| Rôle | Outil | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.1 |
| Interface | React | 19.2 |
| Langage | TypeScript | 5 |
| Style | Tailwind CSS (thème dans `app/globals.css`) | 4 |
| Animations | Motion (`motion/react`) | 12 |
| Icônes | lucide-react | 1.50 |
| Carte | Leaflet + react-leaflet, tuiles OpenStreetMap | 1.9 / 5.0 |
| Base de données, connexion, photos | Supabase (Postgres + Auth + Storage) | supabase-js 2 |
| Recherche de restaurants | Google Places API (New), appelée côté serveur | — |
| Hébergement | Vercel | — |
| Police | Bricolage Grotesque (via `next/font/google`) | — |

## 2. Schéma général

```
 Téléphone / ordinateur (navigateur)
        │
        ├──► Supabase (directement depuis le navigateur, avec la clé publique « anon »)
        │       • Auth : connexion e-mail / mot de passe, Google
        │       • Postgres : profils, restos, visites, liste « À tester »
        │       • Storage : photos des visites (privées)
        │       → protégé par les règles RLS (voir 03_SECURITE.md)
        │
        └──► Serveur Vercel (routes /api/places/*)
                └──► Google Places (la clé Google reste sur le serveur)
```

- Toutes les pages de l'app sont des **composants client** (`"use client"`) : elles parlent directement à Supabase.
- Seules les routes `/api/places/autocomplete` et `/api/places/details` tournent sur le serveur, pour **cacher la clé Google**.

## 3. Arborescence

```
foodkeeper/
├── app/
│   ├── layout.tsx              ← squelette HTML, police, thème, notifications (toasts)
│   ├── globals.css             ← couleurs, thème sombre, classes fk-*
│   ├── page.tsx                ← redirige vers /restaurants ou /login
│   ├── favicon.ico, icon.png   ← icônes de l'onglet
│   ├── (auth)/login/           ← connexion / inscription / mot de passe oublié
│   ├── (app)/                  ← toutes les pages protégées (il faut être connecté)
│   │   ├── layout.tsx          ← en-tête mobile, menu latéral ordinateur, barre du bas
│   │   ├── restaurants/        ← « Mes restos » : carnet + « À tester »
│   │   ├── map/                ← la carte
│   │   ├── search/             ← ajouter un resto / une visite
│   │   ├── stats/              ← statistiques
│   │   ├── community/          ← carnets publics des autres
│   │   └── profile/            ← « Mon compte »
│   ├── p/[id]/                 ← carnet public partagé par lien (sans connexion)
│   └── api/places/             ← routes serveur Google Places
├── components/
│   ├── AppChrome.tsx           ← logo, en-tête, BottomNav, SideNav, bulle compte
│   ├── ui/                     ← briques réutilisables : Sheet, Blocks, Inputs, Toast
│   ├── restaurant/             ← cartes, fiche, formulaires
│   ├── map/RestoMap.tsx        ← carte Leaflet
│   └── stats/StatsBlocks.tsx   ← blocs de la page stats
├── lib/
│   ├── supabaseClient.ts       ← connexion à Supabase
│   ├── auth.tsx                ← utilisateur connecté + profil (useAuth)
│   ├── data.ts                 ← lecture / écriture des données (useNotebook, useWishlist…)
│   ├── photos.ts               ← compression + envoi + liens temporaires des photos
│   ├── stats.ts, badge.ts      ← calculs des statistiques
│   ├── theme.ts, themeScript.ts← clair / sombre / auto
│   ├── format.ts, places.ts, tags.ts, types.ts
├── supabase/                   ← scripts SQL numérotés (voir 02_BASE_DE_DONNEES.md)
├── public/logo.png             ← logo d'origine
├── Docs/                       ← cette documentation
└── .env.local                  ← secrets locaux (JAMAIS sur git)
```

## 4. Pages et navigation

| Adresse | Page | Mobile | Ordinateur |
|---|---|---|---|
| `/login` | Connexion | plein écran | carte centrée |
| `/restaurants` | Mes restos (onglets Mon carnet / À tester) | barre du bas | menu latéral |
| `/map` | Carte | via le bouton « Carte » | entrée du menu latéral |
| `/search` | Ajouter | barre du bas | menu latéral |
| `/stats` | Stats | barre du bas | menu latéral |
| `/community` | Communauté | barre du bas | menu latéral |
| `/profile` | Mon compte | bulle d'initiales en haut à droite | bas du menu latéral |
| `/p/<id>` | Carnet public | — | — |

## 5. Circulation des données

1. `AuthProvider` (`lib/auth.tsx`) récupère la session Supabase. Sans session, on renvoie vers `/login`.
2. Au premier passage, `ensureProfile` crée la ligne `profiles` de l'utilisateur.
3. Les pages utilisent des « hooks » (`useNotebook`, `useWishlist`) qui chargent les données **de l'utilisateur connecté**.
4. Les statistiques sont **calculées dans le navigateur** (`lib/stats.ts`). Rien n'est stocké en plus.
5. Les photos sont compressées en JPEG dans le navigateur, puis envoyées dans `visit-photos/<id utilisateur>/…`. Pour les afficher, on demande des **liens temporaires signés**.

## 6. Choix techniques (et pourquoi)

| Choix | Raison |
|---|---|
| Supabase appelé directement depuis le navigateur | Simple, pas de serveur à maintenir. La sécurité repose sur les règles RLS. |
| Clé Google cachée derrière `/api/places` | La clé est payante et ne doit pas être visible. |
| Leaflet + OpenStreetMap | Gratuit, sans clé API. |
| Thème stocké dans le navigateur (`localStorage`) | Pas besoin de base de données pour une préférence d'affichage. |
| Stats calculées côté client | Petits volumes de données, aucune table de stats à maintenir. |
