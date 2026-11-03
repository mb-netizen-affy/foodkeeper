# 08 — Conventions de code et de projet

> 📌 **Document commun à toutes les apps.**

## 1. Emplacement des projets

- Tous les projets dans `C:\Dev\<nom-app>` (**jamais dans OneDrive**, la synchronisation perturbe Next.js).
- Nom de dossier et de dépôt GitHub en minuscules avec tirets : `foodkeeper`, `homekeeper`, `markadas-gala`.

## 2. Structure standard d'une app

```
app/(auth)/        pages publiques de connexion
app/(app)/         pages protégées (connexion obligatoire)
app/api/           routes serveur (pour cacher les clés secrètes)
components/ui/     briques réutilisables, identiques d'une app à l'autre
components/<sujet>/ composants propres à l'app
lib/               logique : données, calculs, formats, thème, auth
supabase/          scripts SQL numérotés 01_, 02_…
Docs/              documentation
public/            logo et images
```

## 3. Nommage

| Élément | Règle | Exemple |
|---|---|---|
| Composant React | PascalCase, un fichier par composant principal | `RestaurantCard.tsx` |
| Fonction, variable | camelCase, en anglais | `loadVisits`, `totalSpent` |
| Fichier utilitaire | camelCase | `supabaseClient.ts` |
| Table / colonne SQL | snake_case, en anglais | `restaurant_visits.visited_at` |
| Classe CSS maison | préfixe de l'app + tiret | `fk-card`, `hk-btn` |
| Textes de l'interface | en français, tutoiement | « Ajouter une visite » |
| Commentaires | en français, courts | `// Calcule le total de l'année` |

## 4. Règles de code

- **TypeScript partout**, types partagés dans `lib/types.ts`.
- Pas de couleur écrite en dur : uniquement les couleurs du thème (`bg-paper`, `text-choco`…).
- Tous les appels Supabase passent par `lib/data.ts` (ou équivalent) : les pages n'écrivent pas de requête elles-mêmes, sauf cas simple.
- Toujours filtrer par l'utilisateur (`.eq("user_id", userId)`), **en plus** de la protection RLS.
- Toujours prévoir les 3 états d'un écran : **chargement** (squelette), **vide** (`EmptyState`), **erreur** (`toast`).
- Accessibilité : chaque bouton icône a un `aria-label` ; les champs ont un `<label>`.

## 5. Git

- Un commit = un changement compréhensible. Message en français, au présent :
  `Ajoute la carte des restos`, `Corrige le thème sombre sur la page stats`.
- On ne pousse que du code qui passe `npm run build`.
- Pour un gros essai : créer une branche (`git checkout -b essai-xxx`) puis revenir sur `main` si ça ne plaît pas.

## 6. Ce qui ne va JAMAIS sur GitHub

- `.env`, `.env.local`, toute clé ou mot de passe
- `node_modules/`, `.next/`
- Exports de données réelles d'utilisateurs (CSV, sauvegardes)

(Tout est déjà couvert par le `.gitignore` standard de Next.js, qui contient `.env*`.)
