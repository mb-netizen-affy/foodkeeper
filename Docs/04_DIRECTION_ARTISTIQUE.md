# 04 — Direction artistique commune

> 📌 **Document commun à toutes les apps.** Copie-le tel quel dans le dossier `Docs/` de chaque projet.

Toutes mes apps partagent **le même style** : seules **la palette de couleurs** et **le logo** changent d'une app à l'autre.
On doit reconnaître la « famille » au premier coup d'œil.

---

## 1. Le style : « néo-brutalisme doux »

| Principe | Concrètement |
|---|---|
| Bordures franches | `2px` pleines, couleur du texte (« encre ») |
| Ombres décalées, sans flou | `3px 3px 0` (petite : `2px 2px 0`, grande : `5px 5px 0`) |
| Coins arrondis généreux | cartes `1.25rem` (20px), boutons et champs `1rem`, puces rondes |
| Fonds calmes, un seul accent vif | l'accent sert aux actions importantes et aux chiffres clés, **avec parcimonie** |
| Typo grasse et compacte | titres en `font-extrabold`, interlettrage serré (`tracking-tight`) |
| Retour tactile | au clic, le bouton « s'enfonce » : il se décale de 2px et son ombre diminue |
| Animations discrètes | Motion : apparitions douces, pas de gros effets ; respect de « réduire les animations » |

**À éviter :** dégradés, ombres floues, plus d'un accent vif, emojis à la place des icônes dans la navigation, textes gris trop pâles.

## 2. Typographie

- **Police unique :** Bricolage Grotesque (Google Fonts, chargée via `next/font/google`).
- Graisses utilisées : 400 (texte), 500 (champs), 600 (puces), 700 (boutons, labels), 800 (titres, chiffres).

| Usage | Taille mobile | Taille ≥ 640px |
|---|---|---|
| Titre de page | `text-2xl` | `text-3xl` |
| Titre de carte | `text-base` | `text-lg` |
| Grand chiffre (stat) | `text-xl` | `text-2xl` |
| Texte normal | `text-base` | `text-base` |
| Texte secondaire | `text-sm` en couleur « muted » | idem |
| Petits titres de section | `text-xs` en MAJUSCULES, gras, espacés | idem |

> Sur téléphone (< 640px), la taille de base du texte est **15px** au lieu de 16px, pour un rendu plus compact.

## 3. Couleurs — système de rôles

Chaque app définit **les mêmes rôles** avec **ses propres valeurs**. On construit l'interface avec les rôles, jamais avec un code couleur écrit en dur.

| Rôle | À quoi il sert |
|---|---|
| **Fond** | fond général de l'app |
| **Surface** | fond des cartes, champs, boutons « ghost » |
| **Surface 2** | zones secondaires, onglets, puces non actives, étiquettes |
| **Encre** | texte principal, bordures, ombres, bouton principal |
| **Encre profonde** | texte posé sur l'accent |
| **Discret** (muted) | texte secondaire |
| **Accent** | action principale, élément actif, chiffre vedette |
| **Accent doux** | fond léger lié à l'accent (sélection de texte, badges) |
| **Danger** | suppression, erreurs |

### Palettes par app

| Rôle | FoodKeeper | HomeKeeper | MediKeeper | Markadas (client) |
|---|---|---|---|---|
| Nom du token | `cream` / `paper` / `sand` / `choco` / `deep` / `muted` / `paprika` / `paprika-soft` / `danger` | *à reporter* | *à définir* | *à définir* |
| Fond | `#F3ECE1` crème | bleu nuit | — | noir |
| Surface | `#FFFBF5` papier | — | — | — |
| Surface 2 | `#E6D9C6` sable | — | — | — |
| Encre | `#4A2C1A` chocolat | — | — | — |
| Encre profonde | `#2E1A0F` | — | — | — |
| Discret | `#7A6555` | — | — | — |
| Accent | `#E2651F` paprika | cyan | — | rouge vif |
| Accent doux | `#F8DCC8` | — | — | — |
| Danger | `#A4161A` | — | — | — |

> **À faire :** recopier les valeurs exactes de HomeKeeper depuis son `app/globals.css`, et choisir celles de MediKeeper.
> **Markadas** est une app pour un client : elle garde **les couleurs de son site** (noir, rouge), mais suit la même structure, les mêmes composants et les mêmes règles responsive.

### Thème sombre
- Mêmes noms de rôles, valeurs inversées : l'**encre devient claire**, les fonds deviennent foncés. Les bordures et les ombres suivent automatiquement.
- Activé par `data-theme="dark"` sur `<html>`. Choix « Clair / Sombre / Auto » dans **Mon compte**, mémorisé sur l'appareil.
- Un petit script dans `<head>` applique le thème **avant** l'affichage (pas de flash blanc).

### Contraste
- Texte normal : contraste d'au moins **4,5:1** avec son fond (vérifiable sur webaim.org/resources/contrastchecker).
- Le texte sur l'accent utilise l'**encre profonde**, pas le blanc, quand l'accent est clair.

## 4. Composants (classes communes)

Chaque app a son **préfixe** (`fk-` FoodKeeper, `hk-` HomeKeeper, `mk-` MediKeeper…), mais **les mêmes noms après le préfixe**.

| Classe | Rôle |
|---|---|
| `-card` | carte avec bordure + ombre |
| `-card-flat` | carte sans ombre |
| `-btn` + `-btn-primary` | bouton principal (fond encre) |
| `-btn-accent` | bouton d'action vedette (fond accent) — **un seul par écran** |
| `-btn-ghost` | bouton secondaire (fond surface) |
| `-btn-danger` | suppression |
| `-icon-btn` | bouton rond avec une icône (40px) |
| `-input`, `-label` | champs de formulaire |
| `-chip` | puce cliquable (filtres) ; active si `aria-pressed="true"` |
| `-tag` | étiquette non cliquable |
| `-skeleton` | bloc gris animé pendant le chargement |
| `-scroll-x` | rangée qui défile horizontalement sans barre |

Composants React communs (`components/ui/`) :

| Composant | Rôle |
|---|---|
| `Sheet` | panneau qui monte du bas sur mobile, fenêtre centrée sur ordinateur |
| `Toast` / `useToast()` | petit message de confirmation ou d'erreur |
| `PageHeader` | titre de page + sous-titre + bouton d'action |
| `SectionTitle` | petit titre de section |
| `EmptyState` | écran vide sympathique avec emoji + bouton |
| `Avatar` | rond avec les initiales |
| `Switch` | interrupteur on/off |

## 5. Icônes

- **lucide-react** uniquement, trait épais (`strokeWidth={2.5}` dans les boutons), taille 18px (boutons), 22px (navigation).
- Les emojis sont réservés au contenu « émotion » (états vides, badges), jamais à la navigation.

## 6. Logo et nom

- Logo dans une case arrondie avec bordure et petite ombre (composant `Logo`).
- Nom de l'app en deux couleurs : 1re partie en encre, « Keeper » en accent (composant `Wordmark`).
- Favicon généré à partir du logo (`app/icon.png` + `app/favicon.ico`).

## 7. Ton des textes

- Tutoiement, phrases courtes, chaleureuses.
- Boutons = verbe d'action : « Ajouter une visite », « Enregistrer », « Partager mon carnet ».
- Messages d'erreur simples, sans jargon : « Erreur lors de l'enregistrement ».
