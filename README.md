# FoodKeeper 🍴

Ton carnet de restaurants : notes sur 20, tags, visites (addition, couverts), statistiques et profil public partageable.
Même ADN visuel que HomeKeeper (« néo-brutalisme doux », Bricolage Grotesque), en crème / chocolat / paprika.

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvre http://localhost:3000

## Variables d'environnement (`.env.local`, jamais sur GitHub)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GOOGLE_PLACES_API_KEY=...
```

## Organisation du code

```
app/
  (auth)/login        Connexion / inscription
  (app)/restaurants   Mes restos (liste + fiche d'un resto)
  (app)/search        Ajouter un resto ou une visite (Google Places)
  (app)/stats         Mes statistiques
  (app)/community     Recherche de carnets publics
  (app)/profile       Mon compte
  p/[id]              Profil public partageable
  api/places          Appels Google Places (côté serveur, clé cachée)
components/
  ui/                 Briques réutilisables (Sheet, Toast, Stepper, cartes…)
  restaurant/         Carte resto, fiche, formulaires
  stats/              Blocs de stats (partagés Stats + profil public)
lib/
  auth.tsx            Connexion vérifiée une seule fois pour toute l'app
  data.ts             Lecture / écriture Supabase
  stats.ts            Calcul des statistiques
  badge.ts            Badge « gourmet » (une seule règle)
  format.ts, tags.ts, places.ts, types.ts
```

## Couleurs (app/globals.css)

| Rôle       | Couleur   | Classe Tailwind |
|------------|-----------|-----------------|
| Fond       | `#F3ECE1` | `bg-cream`      |
| Cartes     | `#FFFBF5` | `bg-paper`      |
| Surfaces   | `#E6D9C6` | `bg-sand`       |
| Principal  | `#4A2C1A` | `text-choco`    |
| Accent     | `#E2651F` | `bg-paprika`    |
