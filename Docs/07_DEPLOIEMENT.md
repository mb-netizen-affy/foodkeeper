# 07 — Déploiement

## 1. En local (sur ton PC)

```bash
npm install        # installe les dépendances (1re fois ou après un changement de package.json)
npm run dev        # lance l'app sur http://localhost:3000
npm run build      # vérifie que la version de production compile
npm run lint       # cherche les erreurs de code
```

Fichier `.env.local` à la racine (jamais sur git), à copier depuis `.env.example` :
```
NEXT_PUBLIC_SUPABASE_URL=https://<id-du-projet>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé anon>
GOOGLE_PLACES_API_KEY=<clé Google>
```
Après une modification de `.env.local`, il faut **arrêter** le serveur (`Ctrl + C`) et relancer `npm run dev`.

## 2. GitHub

- Dépôt **privé** `foodkeeper`.
- Branche principale : `main` → chaque push sur `main` met le site en ligne automatiquement.

```bash
git status                     # vérifier : aucun .env dans la liste !
git add -A
git commit -m "Ce que j'ai changé"
git push
```

## 3. Vercel

| Réglage | Valeur |
|---|---|
| Framework | Next.js (détecté automatiquement) |
| Commande de build | `next build` (par défaut) |
| Variables d'environnement | les 3 de `.env.local`, cochées pour *Production* et *Preview* |

Après un changement de variable dans Vercel : *Deployments* → `…` → **Redeploy**.

## 4. Supabase (une seule fois, ou en cas de nouvelle adresse)

- *Authentication* → *URL Configuration* :
  - **Site URL** : l'adresse Vercel (ou le domaine perso)
  - **Redirect URLs** : `http://localhost:3000/**` et `https://<adresse-en-ligne>/**`
- *Authentication* → *Providers* → **Google** : identifiants OAuth (créés dans Google Cloud), avec l'URL de retour donnée par Supabase.

## 5. Google Cloud

- **Places API (New)** activée.
- Clé restreinte à cette API, avec un quota journalier et une alerte de budget.

## 6. Check-list de mise en production

- [ ] `npm run build` passe en local
- [ ] Aucun fichier `.env` dans `git status`
- [ ] Les nouveaux scripts SQL ont été lancés sur Supabase
- [ ] Variables à jour dans Vercel
- [ ] Après le déploiement : tester connexion, ajout, carte, stats, compte — **sur téléphone et ordinateur**
- [ ] Ajouter une ligne dans `Docs/CHANGELOG.md`

## 7. En cas de problème

| Symptôme | Cause probable | Solution |
|---|---|---|
| « Failed to fetch » | Projet Supabase en pause | Supabase → *Restore project* |
| Page blanche en ligne, OK en local | Variable manquante dans Vercel | Ajouter la variable, puis *Redeploy* |
| La connexion Google renvoie sur localhost | Mauvaise *Site URL* dans Supabase | Corriger les URL (section 4) |
| `Module not found` | Dépendance pas installée | `npm install` |
| Erreurs bizarres après une mise à jour | Cache de build | supprimer le dossier `.next`, puis relancer |
