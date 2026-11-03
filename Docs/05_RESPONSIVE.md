# 05 — Responsive (mobile, tablette, ordinateur)

> 📌 **Document commun à toutes les apps.**

Objectif : **une seule app** qui s'adapte parfaitement au téléphone, à la tablette et à l'ordinateur. On conçoit d'abord pour le **téléphone**, puis on ajoute l'agrandissement.

## 1. Les tailles d'écran (points de rupture Tailwind)

| Préfixe | À partir de | Appareil typique | Ce qui change |
|---|---|---|---|
| *(aucun)* | 0px | téléphone | texte de base 15px, 1 colonne, barre du bas |
| `sm:` | 640px | grand téléphone en paysage | texte 16px, panneaux en fenêtre centrée |
| `md:` | 768px | tablette | grilles en 2 colonnes |
| `lg:` | 1024px | ordinateur | **menu latéral à gauche**, la barre du bas disparaît |
| `xl:` | 1280px | grand écran | grilles en 3 colonnes |

## 2. Structure des écrans

### Téléphone et tablette (< 1024px)
```
┌──────────────────────────┐
│ [logo] NomApp       (MB) │ ← en-tête collant, bulle « compte »
├──────────────────────────┤
│                          │
│     contenu (1 colonne)  │
│                          │
│ ╭──────────────────────╮ │
│ │ 🏠   ➕   📊   👥     │ │ ← barre de navigation flottante
│ ╰──────────────────────╯ │
└──────────────────────────┘
```

### Ordinateur (≥ 1024px)
```
┌────────────┬─────────────────────────────────┐
│ [logo] App │                                 │
│            │   contenu (2 ou 3 colonnes)     │
│ ▸ Page 1   │   largeur max ~1150px, centré   │
│   Page 2   │                                 │
│   Page 3   │                                 │
│            │                                 │
│ ┌────────┐ │                                 │
│ │ Compte │ │ ← carte compte en bas du menu   │
│ └────────┘ │                                 │
└────────────┴─────────────────────────────────┘
   256px
```

### Code de référence (layout des pages connectées)
```tsx
<AppHeader />   {/* lg:hidden */}
<SideNav />     {/* hidden lg:flex, fixe, w-64 */}
<div className="lg:pl-64">
  <main className="mx-auto w-full max-w-2xl px-4 pb-32 pt-4
                   sm:px-6 sm:pb-36 sm:pt-6
                   md:max-w-4xl lg:max-w-6xl lg:px-10 lg:pb-14 lg:pt-10">
    {children}
  </main>
</div>
<BottomNav />   {/* lg:hidden */}
```

## 3. Règles à respecter

| Règle | Détail |
|---|---|
| **Pas de défilement horizontal** | Aucun élément ne doit dépasser la largeur de l'écran (tester à 390px). |
| **Zones tactiles ≥ 44px** | Boutons de 48px de haut (`min-h-12`), boutons icônes de 40px minimum. |
| **Marge de sécurité en bas** | Le contenu garde un espace sous lui (`pb-32`) pour ne pas passer sous la barre flottante. Les panneaux tiennent compte de l'encoche de l'iPhone (`env(safe-area-inset-bottom)`). |
| **Pas de doublon de navigation** | Une action présente dans la barre du bas ou le menu latéral ne doit pas être répétée en gros bouton dans la page. |
| **Formulaires** | 1 colonne sur mobile. Sur ordinateur, 2 colonnes si le formulaire est long (`lg:grid lg:grid-cols-2`). |
| **Listes de cartes** | `grid gap-4 md:grid-cols-2 xl:grid-cols-3` |
| **Pages « réglages »** (compte, profil) | Colonne étroite et centrée : `mx-auto max-w-2xl` |
| **Panneaux / fenêtres** | Composant `Sheet` : monte du bas sur mobile, fenêtre centrée (`sm:max-w-lg`) au-delà de 640px. |
| **Textes longs** | `truncate` (une ligne avec « … ») pour les noms dans les cartes. |
| **Hauteur d'écran** | Utiliser `dvh` (et non `vh`) pour que la barre d'adresse du téléphone ne casse pas la mise en page. |
| **Survol** | Rien d'important ne doit dépendre du survol de la souris (il n'existe pas au doigt). |

## 4. Comment tester

1. Dans Chrome : `F12` → icône téléphone (`Ctrl + Maj + M`).
2. Tester au minimum **3 largeurs** : **390px** (iPhone), **820px** (iPad), **1440px** (ordinateur).
3. Vérifier en clair **et** en sombre.
4. Tester sur ton vrai téléphone : `npm run dev`, puis ouvrir l'adresse « Network » (ex. `http://192.168.x.x:3000`) sur le même Wi-Fi.

### Check-list rapide
- [ ] Aucun défilement horizontal à 390px
- [ ] La barre du bas ne cache aucun bouton
- [ ] Le menu latéral apparaît à partir de 1024px, la barre du bas disparaît
- [ ] Les panneaux (`Sheet`) se ferment avec la croix, `Échap` et un clic à côté
- [ ] Les textes ne débordent pas des cartes
