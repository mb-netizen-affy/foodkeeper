# 06 — Page « Mon compte » (modèle commun)

> 📌 **Document commun à toutes les apps.** Chaque app doit avoir cette page, avec la même structure.
> **Modèle de référence :** FoodKeeper → `app/(app)/profile/page.tsx`

## 1. Comment on y accède

| Écran | Accès |
|---|---|
| Téléphone / tablette | bulle ronde avec les **initiales**, en haut à droite → menu « Mon compte » / « Se déconnecter » |
| Ordinateur | **carte compte** en bas du menu latéral → « Mon compte » / « Se déconnecter » |
| Adresse | `/profile` (page protégée, dans `app/(app)/`) |

## 2. Structure de la page (de haut en bas)

Colonne centrée `mx-auto max-w-2xl`, titre « Mon compte ».

| # | Bloc | Contenu | Obligatoire ? |
|---|---|---|---|
| 1 | **Carte identité** | Avatar (initiales), prénom + nom, e-mail, bouton ✏️ → panneau « Mon profil » (prénom, nom) | ✅ toutes les apps |
| 2 | **Bloc propre à l'app** | Réglages spécifiques. FoodKeeper : *Partage* (carnet public + bouton « Partager mon carnet »). HomeKeeper : *Notifications*. | Selon l'app |
| 3 | **Apparence** | Choix du thème : Clair / Sombre / Auto (puces, mémorisé sur l'appareil) | ✅ |
| 4 | **Sécurité** | « Changer d'e-mail », « Changer de mot de passe » (désactivés si connexion Google, avec une phrase d'explication) | ✅ |
| 5 | **Mes données** | « Exporter mes données » (CSV), « Supprimer mon compte » | ✅ avant ouverture au public (RGPD) |
| 6 | **À propos** | Liens « Mentions légales » et « Confidentialité », numéro de version | ✅ avant ouverture au public |
| 7 | **Déconnexion** | Bouton pleine largeur « Se déconnecter » (style ghost) | ✅ |

Chaque modification s'ouvre dans un **panneau `Sheet`**, jamais dans une nouvelle page.

## 3. Comportements attendus

| Action | Comportement |
|---|---|
| Modifier prénom / nom | Enregistre dans `profiles`, message « Profil mis à jour », ferme le panneau |
| Changer d'e-mail | `supabase.auth.updateUser({ email })` puis message « Vérifie ta boîte mail pour confirmer » |
| Changer de mot de passe | 8 caractères minimum + confirmation identique, `supabase.auth.updateUser({ password })` |
| Lien « mot de passe oublié » | L'e-mail renvoie vers `/profile?reset=1`, qui ouvre directement le panneau mot de passe |
| Interrupteur (ex. carnet public) | Mise à jour immédiate à l'écran ; si l'enregistrement échoue, retour en arrière + message d'erreur |
| Thème | Appliqué immédiatement, sans recharger |
| Supprimer mon compte | Panneau de confirmation, on tape « SUPPRIMER », puis suppression de toutes les données et photos, déconnexion |
| Se déconnecter | Retour à `/login` |

## 4. Suppression de compte — principe technique

La suppression d'un compte Supabase demande la clé secrète `service_role`. **Elle ne doit jamais être dans le navigateur.** Deux options :

1. **Fonction SQL** `delete_my_account()` en `security definer`, qui supprime les lignes de l'utilisateur connecté (`auth.uid()`) puis son compte dans `auth.users`. Appel : `supabase.rpc("delete_my_account")`.
2. **Route serveur** `/api/account/delete` qui vérifie la session, puis utilise la clé `service_role` stockée **uniquement** dans les variables Vercel (sans `NEXT_PUBLIC_`).

Dans les deux cas : supprimer aussi les **fichiers du stockage** de l'utilisateur.

## 5. État par app

| Bloc | FoodKeeper | HomeKeeper | MediKeeper | Markadas |
|---|---|---|---|---|
| Identité | ✅ | à vérifier | ☐ | ☐ |
| Bloc propre à l'app | ✅ Partage | ✅ Notifications push | ☐ Famille / partage | ☐ |
| Apparence | ✅ | ✅ | ☐ | ☐ |
| Sécurité | ✅ | ✅ | ☐ | ☐ |
| Mes données (export + suppression) | ☐ | ☐ | ☐ | ☐ |
| À propos (légal + version) | ☐ | ☐ | ☐ | ☐ |
| Déconnexion | ✅ | à vérifier | ☐ | ☐ |

> Pour Markadas, la page n'a de sens que pour les comptes « admin / secrétariat » ; les pages jury et pointeur, accessibles par simple lien, n'en ont pas besoin.

## 6. Fichiers à copier pour l'ajouter dans une autre app

- `app/(app)/profile/page.tsx` → adapter le bloc n°2 et le texte
- `components/ui/Sheet.tsx`, `Toast.tsx`, `Inputs.tsx` (`Switch`), `Blocks.tsx` (`Avatar`, `PageHeader`, `SectionTitle`)
- `lib/theme.ts`, `lib/themeScript.ts` (changer le préfixe de la clé : `fk-theme` → `hk-theme`…)
- `lib/format.ts` (`initials`, `fullName`)
- La bulle compte et la carte compte du menu latéral dans `components/AppChrome.tsx`
- Remplacer le préfixe `fk-` des classes par celui de l'app
