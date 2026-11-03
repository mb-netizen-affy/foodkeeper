# 📚 Documentation — FoodKeeper

Ce dossier `Docs/` contient la documentation du projet. Ce sont uniquement des fichiers texte (Markdown), donc **ils peuvent être poussés sur GitHub sans risque** : ils ne contiennent aucune clé ni aucun mot de passe.

> **Règle d'or :** n'écris **jamais** une vraie clé, un mot de passe ou une adresse privée dans ce dossier.
> Les vraies valeurs vont uniquement dans `.env.local` (ignoré par git) et dans les réglages de Vercel.

---

## Sommaire

| Fichier | Contenu | Spécifique à l'app ou commun ? |
|---|---|---|
| `00_LISEZMOI.md` | Ce sommaire | Spécifique |
| `01_ARCHITECTURE.md` | Technologies, dossiers, circulation des données | Spécifique |
| `02_BASE_DE_DONNEES.md` | Tables Supabase, scripts SQL et ordre de lancement | Spécifique |
| `03_SECURITE.md` | Protection des données, secrets, check-list sécurité | Spécifique (règles générales communes) |
| `04_DIRECTION_ARTISTIQUE.md` | Style commun à toutes les apps, couleurs, typo, composants | **Commun** |
| `05_RESPONSIVE.md` | Règles mobile / tablette / ordinateur | **Commun** |
| `06_PAGE_COMPTE.md` | Le modèle de page « Mon compte », identique dans chaque app | **Commun** |
| `07_DEPLOIEMENT.md` | GitHub, Vercel, variables d'environnement, mise en ligne | Spécifique |
| `08_CONVENTIONS.md` | Façon d'écrire le code, de nommer, de faire les commits | **Commun** |
| `09_NOUVELLE_APP.md` | Check-list pour démarrer une nouvelle app « Keeper » | **Commun** |
| `CHANGELOG.md` | Historique des versions | Spécifique |

**Commun** = le même fichier se copie tel quel dans le dossier `Docs/` de chaque app (HomeKeeper, FoodKeeper, MediKeeper…).
Si tu modifies une règle commune, recopie le fichier dans les autres apps.

---

## L'app en une phrase

**FoodKeeper** est un carnet de restaurants : on note ses restos, ses visites (addition, couverts, plats, photo), on garde une liste « À tester », on voit tout sur une carte, on consulte ses statistiques, et on peut rendre son carnet public pour le partager.

## Liens utiles (à compléter, sans rien de secret)

- Dépôt GitHub : `github.com/<ton-compte>/foodkeeper` (privé)
- App en ligne : `https://<ton-projet>.vercel.app`
- Tableau de bord Supabase : `https://supabase.com/dashboard/project/<id-du-projet>`

> L'identifiant du projet Supabase n'est pas un secret, mais inutile de l'écrire si le dépôt devient public un jour.
