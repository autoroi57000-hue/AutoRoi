# AUTO ROI — DESIGN SYSTEM
> Luxe automobile européen · Confiance · Performance · Exclusivité

---

## Philosophie
> "Chaque pixel justifié. Aucun compromis."

Style inspiré de Bentley.com, Porsche.com, BMW.com.
Palette sobre et affirmée : noir profond, or chaud, blanc pur.

---

## Tokens CSS (`src/app/globals.css` — `:root`)

### Couleurs marque
| Variable CSS | Valeur | Usage |
|---|---|---|
| `--ar-black` | `#0A0A0A` | Fond principal dark |
| `--ar-dark` | `#111111` | Fond sections dark / sidebar admin |
| `--ar-gold` | `#C9A84C` | Accent signature — CTA, icônes, prix |
| `--ar-gold-light` | `#F0D080` | Hover des éléments or |
| `--ar-gold-dark` | `#8B6914` | Pressed state, texte sur fond clair |
| `--ar-gold-muted` | `rgba(201,168,76,0.15)` | Fonds subtils, hover discret |
| `--ar-silver` | `#C0C0C0` | Texte secondaire |
| `--ar-surface` | `#FAFAFA` | Fond pages catalogue/détail |
| `--ar-white` | `#FFFFFF` | Fond cartes, inputs |

### Nuances de gris (toutes disponibles en Tailwind)
| Variable CSS | Valeur | Classe Tailwind |
|---|---|---|
| `--ar-gray-900` | `#1A1A1A` | `ar-gray-900` |
| `--ar-gray-700` | `#2A2A2A` | `ar-gray-700` |
| `--ar-gray-500` | `#6B6B6B` | `ar-gray-500` |
| `--ar-gray-300` | `#AAAAAA` | `ar-gray-300` |
| `--ar-gray-200` | `#DDDDDD` | `ar-gray-200` |
| `--ar-gray-100` | `#F4F4F4` | `ar-gray-100` |

### États sémantiques
| Variable CSS | Valeur | Classe Tailwind | Usage |
|---|---|---|---|
| `--ar-danger` | `#8B1A1A` | `ar-danger` | Erreurs, suppression, vendu |
| `--ar-success` | `#1A6B3A` | `ar-success` | Confirmations, succès |
| `--ar-info` | `#1A3A5C` | `ar-info` | Informations |

### Services tiers
| Variable CSS | Valeur | Classe Tailwind | Usage |
|---|---|---|---|
| `--ar-whatsapp` | `#25D366` | `ar-whatsapp` | Boutons WhatsApp uniquement |

---

## Tailwind — Classes utilitaires

Toutes les couleurs `ar-*` sont disponibles en classes Tailwind avec modificateurs d'opacité :

```
bg-ar-gold          text-ar-gold        border-ar-gold
bg-ar-gold/10       text-ar-gold/80     border-ar-gold/30
bg-ar-danger        text-ar-danger      border-ar-danger/20
bg-ar-success/10    text-ar-success     border-ar-success/30
bg-ar-whatsapp      text-ar-whatsapp
bg-ar-surface       bg-ar-gray-100      text-ar-gray-500
shadow-card         shadow-card-hover   shadow-gold
```

---

## Typographie

| Variable | Famille | Usage |
|---|---|---|
| `--font-display` | Playfair Display | H1, titres héro, prix |
| `--font-heading` | Inter | H2, H3, sous-titres |
| `--font-body` | Inter | Corps de texte |
| `--font-mono` | Geist Mono | Chiffres, specs techniques |
| `--font-label` | Inter | Labels, badges, boutons |

**Classes Tailwind :**
```
font-display   → Playfair Display
font-sans      → Inter
font-mono      → Geist Mono
```

---

## Ombres

| Classe Tailwind | Variable CSS | Usage |
|---|---|---|
| `shadow-card` | `--shadow-card` | Cartes au repos |
| `shadow-card-hover` | `--shadow-card-hover` | Cartes au hover |
| `shadow-gold` | `--shadow-gold` | Boutons primaires au hover |
| `shadow-glow` | `--shadow-glow` | Éléments d'accentuation |

---

## Rayons

| Variable | Valeur | Usage |
|---|---|---|
| `--radius-sm` | `4px` | Badges, tags |
| `--radius-md` | `8px` | Inputs, boutons petits |
| `--radius-lg` | `12px` | Cartes, modales |
| `--radius-xl` | `24px` | Drawers, grandes cartes |

---

## Transitions

| Variable | Valeur | Usage |
|---|---|---|
| `--transition-fast` | `150ms cubic-bezier(0.4,0,0.2,1)` | Hover discret |
| `--transition-base` | `250ms cubic-bezier(0.4,0,0.2,1)` | Standard |
| `--transition-slow` | `400ms cubic-bezier(0.4,0,0.2,1)` | Animations d'entrée |
| `--transition-spring` | `500ms cubic-bezier(0.34,1.56,0.64,1)` | Effet rebond |

---

## Classes composants

### Boutons
```jsx
<button className="btn-primary">Acheter ce véhicule</button>
<button className="btn-secondary">En savoir plus</button>
<button className="btn-ghost">Retour</button>
<button className="btn-danger">Supprimer</button>
```

**Chaque bouton inclut :** normal · hover (lift + shadow) · active (scale) · focus-visible (ring) · disabled (opacity)

**`.btn-primary` :** effet shimmer animé au hover (reflet lumineux glissant)

### Cartes
```jsx
<div className="card-ar">
  {/* position: relative automatique, overflow hidden, border dorée au hover */}
</div>
```

### Badges de statut
```jsx
<span className="badge-new">Nouveau</span>
<span className="badge-sold">Vendu</span>
<span className="badge-featured">Coup de cœur</span>
<span className="badge-draft">Brouillon</span>
```

### Inputs
```jsx
<input className="input-ar" />
<input className="input-ar input-error" />  {/* état erreur */}
```

### Effets luxe
```jsx
<div className="glass">…</div>           {/* glassmorphism */}
<hr className="divider-luxury" />         {/* séparateur doré */}
<div className="grain">…</div>            {/* texture grain */}
<div className="reveal">…</div>           {/* réveil au scroll (ajouter .visible) */}
<div className="bg-mesh">…</div>          {/* fond gradient animé */}
<span className="shimmer">…</span>        {/* animation shimmer */}
<span className="text-gradient-gold">…</span>  {/* texte dégradé or */}
```

---

## Règles absolues

### ✅ TOUJOURS
- Utiliser les variables `var(--ar-*)` dans les fichiers CSS
- Utiliser les classes Tailwind `ar-*` dans les composants TSX
- Utiliser `shadow-card` / `shadow-card-hover` pour les cartes
- Utiliser `text-ar-danger` pour les erreurs (jamais `text-red-*`)
- Utiliser `text-ar-success` pour les confirmations (jamais `text-green-*`)
- Utiliser `bg-ar-whatsapp` pour les boutons WhatsApp (jamais `#25D366`)
- Utiliser `bg-ar-surface` pour les fonds de pages catalogue

### ❌ JAMAIS
- Couleurs hardcodées : `#fff`, `#000`, `rgb()`, `rgba()`, `#hex`
- Classes Tailwind hors système : `gray-*`, `red-*`, `green-*`, `blue-*`, `purple-*`, `amber-*`
- Shadows arbitraires : `shadow-[0_2px_20px_rgba(...)]`
- Inline styles de police : `style={{ fontFamily: "Helvetica" }}`
- Opacités sur CSS variables : `bg-ar-danger/80` ✅ (hex dans tailwind.config = OK)

---

## Architecture des fichiers de style

```
src/app/globals.css          ← Design system complet (CSS vars + composants)
tailwind.config.ts           ← Tokens Tailwind (hex pour opacité modifier)
src/components/**/*.tsx      ← Utilisation via classes Tailwind ar-*
```

---

*Auto Roi Design System — Version 2.0 — Mars 2026*
