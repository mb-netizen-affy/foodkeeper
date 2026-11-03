# 03 — Sécurité

## 1. Les secrets : où ils vont, où ils ne vont jamais

| Variable | Secrète ? | Où la mettre | Sur GitHub ? |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Non (visible dans le navigateur) | `.env.local` + Vercel | ❌ (pas besoin) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Non, c'est la clé publique. La protection vient de RLS. | `.env.local` + Vercel | ❌ |
| `GOOGLE_PLACES_API_KEY` | **OUI** (payante) | `.env.local` + Vercel | ❌ **jamais** |
| Clé `service_role` de Supabase | **OUI, très sensible** (elle contourne toute la sécurité) | Nulle part dans l'app | ❌ **jamais** |

- Le fichier `.gitignore` contient `.env*` : les fichiers `.env.local` ne partent **jamais** sur GitHub.
- Le fichier `.env.example` (sans vraies valeurs) **peut** être poussé : il sert de modèle.
- Les variables qui commencent par `NEXT_PUBLIC_` sont **visibles par tout le monde** dans le navigateur. Ne mets jamais un secret derrière ce préfixe.

### Si une clé a fuité par erreur
1. Désactive ou régénère la clé tout de suite (console Google Cloud ou Supabase).
2. Mets la nouvelle valeur dans `.env.local` et dans Vercel, puis redéploie.
3. Supprimer le fichier de GitHub ne suffit pas, car il reste dans l'historique. **Il faut changer la clé.**

## 2. Protection des données (RLS Supabase)

RLS = « Row Level Security » : la base vérifie elle-même, ligne par ligne, qui a le droit de lire ou de modifier.

| Table | Lire | Ajouter / modifier / supprimer |
|---|---|---|
| `profiles` | le sien, ou les profils publics | uniquement le sien |
| `restaurants` | les siens, ou ceux des carnets publics | uniquement les siens |
| `restaurant_visits` | les siennes, ou celles des carnets publics | uniquement les siennes, sur ses propres restos |
| `wishlist` | **uniquement la sienne** (jamais publique) | uniquement la sienne |
| Stockage `visit-photos` | uniquement son dossier | uniquement son dossier |

- La fonction `is_public_profile()` dit si un carnet est public. Elle est en `security definer` avec un `search_path` fixé, ce qui est la bonne pratique.
- Le script `02_test_securite.sql` permet de vérifier ce qu'un visiteur non connecté voit.

## 3. Connexion

- Méthodes : e-mail + mot de passe, ou Google.
- Mot de passe : 8 caractères minimum.
- « Mot de passe oublié » envoie un e-mail. Le lien ramène sur `/profile?reset=1`, qui ouvre directement le changement de mot de passe.
- Supabase → *Authentication* → *URL Configuration* : l'adresse Vercel doit être dans *Site URL* et *Redirect URLs*.
- **À activer** avant d'ouvrir à beaucoup de monde : *Confirm email* (Supabase → *Authentication* → *Providers* → *Email*).

## 4. Clé Google Places

Dans la console Google Cloud, sur la clé :
- **Restriction d'API** : uniquement « Places API (New) ».
- **Plafond (quota)** journalier raisonnable, pour éviter une facture surprise.
- Alerte de budget sur le compte de facturation.

## 5. Check-list avant chaque mise en ligne

- [ ] `git status` ne montre **aucun** fichier `.env…` (sauf `.env.example`)
- [ ] Aucune clé collée « en dur » dans le code (`Ctrl + Maj + F` dans VS Code : chercher `AIza`, `eyJ`, `service_role`)
- [ ] `npm run build` passe sans erreur
- [ ] Tout nouveau tableau Supabase a RLS **activé** et ses règles écrites dans un script `supabase/0X_…sql`
- [ ] Les nouvelles pages privées sont bien dans `app/(app)/` (protégées par la connexion)

## 6. Points à améliorer (connus)

| Point | Risque | Piste |
|---|---|---|
| Les routes `/api/places/*` répondent même sans être connecté | Quelqu'un pourrait consommer le quota Google | Vérifier la session Supabase dans la route, ou limiter le nombre d'appels |
| En cas d'erreur, ces routes renvoient le détail technique | Fuite d'informations mineure | Renvoyer un message simple et garder le détail dans les logs |
| Pas encore de suppression de compte dans l'app | Obligation RGPD dès que l'app est publique | Voir `06_PAGE_COMPTE.md` |
| Pas encore de mentions légales ni de politique de confidentialité | Obligation légale en France | Créer une page `/legal` |

## 7. RGPD en bref

- Données collectées : e-mail, prénom/nom, restos, visites, montants, photos.
- L'utilisateur doit pouvoir : **voir** ses données, les **exporter**, **supprimer son compte**.
- Hébergement : Supabase (choisir une région en Europe) et Vercel.
