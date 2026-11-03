# 02 — Base de données (Supabase)

## 1. Tables

### `profiles` — un profil par compte
| Colonne | Type | Rôle |
|---|---|---|
| `id` | uuid (= id du compte) | clé |
| `name` | text | prénom |
| `last_name` | text | nom |
| `locale` | text | ancienne colonne de langue (plus utilisée dans l'interface) |
| `is_public` | boolean | carnet visible par les autres ou non |
| `updated_at` | timestamptz | dernière modification |

### `restaurants` — les restos du carnet
| Colonne | Type | Rôle |
|---|---|---|
| `id` | uuid | clé |
| `user_id` | uuid | propriétaire |
| `name`, `city`, `country`, `address` | text | infos du resto |
| `rating` | number | note sur 20 |
| `tags` | text[] | étiquettes (cuisine, ambiance…) |
| `place_id` | text | identifiant Google |
| `lat`, `lng` | number | position sur la carte |
| `created_at` | timestamptz | date d'ajout |

### `restaurant_visits` — chaque passage dans un resto
| Colonne | Type | Rôle |
|---|---|---|
| `id` | uuid | clé |
| `restaurant_id` | uuid | resto concerné |
| `user_id` | uuid | propriétaire |
| `visited_at` | timestamptz | date |
| `price_eur` | number | montant de l'addition |
| `covers` | number | nombre de couverts |
| `dishes` | text (300 car. max) | plats (facultatif) |
| `comment` | text (1000 car. max) | commentaire (facultatif) |
| `photo_path` | text | chemin de la photo dans le stockage |

### `wishlist` — liste « À tester » (toujours privée)
| Colonne | Type | Rôle |
|---|---|---|
| `id` | uuid | clé |
| `user_id` | uuid | propriétaire (rempli automatiquement) |
| `place_id` | text | identifiant Google (un seul exemplaire par compte) |
| `name`, `city`, `country`, `address` | text | infos |
| `lat`, `lng` | double | position |
| `note` | text (200 car. max) | petite note |
| `created_at` | timestamptz | date d'ajout |

### Stockage `visit-photos`
- **Privé**, 8 Mo maximum par photo, formats JPEG, PNG, WebP et HEIC.
- Chaque photo est rangée dans `<id utilisateur>/<fichier>.jpg`.

## 2. Scripts SQL (dossier `supabase/`)

À lancer **dans l'ordre**, dans Supabase → *SQL Editor* → *New query* → *Run*.
Tous les scripts peuvent être relancés sans casser les données.

| Ordre | Script | Ce qu'il fait | Déjà lancé ? |
|---|---|---|---|
| 1 | `01_securite_rls.sql` | Active la protection RLS sur profils, restos et visites | ✅ |
| 2 | `02_test_securite.sql` | Vérifie ce qu'un visiteur non connecté peut voir (ne modifie rien) | ✅ |
| 3 | `03_liste_a_tester.sql` | Crée la table `wishlist` et ses règles | ✅ |
| 4 | `04_souvenirs_visites.sql` | Ajoute plats / commentaire / photo et le stockage `visit-photos` | ✅ |

**Règle pour la suite :** chaque changement de base = un nouveau fichier numéroté (`05_…sql`), avec un commentaire en haut qui explique ce qu'il fait. On ne modifie jamais la base « à la main » sans laisser de script.

## 3. Sauvegardes

- Offre gratuite Supabase : pas de sauvegarde automatique téléchargeable. Pense à faire un export de temps en temps (*Database → Backups* ou *Table editor → Export to CSV*).
- Un projet gratuit **se met en pause** après quelques jours sans activité. Dans ce cas, l'app affiche « Failed to fetch » : il faut cliquer sur *Restore project* dans Supabase.
