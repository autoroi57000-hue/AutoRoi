# Composants de la Page d'Accueil Auto Roi

Ce dossier contient les composants de la page d'accueil premium d'Auto Roi.

## Structure

### Sections (par ordre d'apparition)

1. **HeroSection** (`HeroSection.tsx`)
   - Plein écran (100vh)
   - Image de fond avec overlay gradient
   - Logo couronne animé
   - Titre "AUTO ROI" en Playfair Display
   - Compteur animé des véhicules disponibles
   - Barre de recherche rapide (overlay)
   - Flèche de scroll animée

2. **StatsSection** (`StatsSection.tsx`)
   - Bande noire avec 3 statistiques
   - Compteurs animés au scroll (Intersection Observer)
   - "100+" Véhicules, "FR & EN" Service bilingue, "7j/7" Disponible

3. **FeaturedVehiclesSection** (`FeaturedVehiclesSection.tsx`)
   - Fond blanc
   - Titre "SÉLECTION DU MOMENT"
   - Grille 3 colonnes desktop, 2 tablette, 1 mobile
   - 6 véhicules avec `is_featured=true` (ou 6 derniers)

4. **CategoriesSection** (`CategoriesSection.tsx`)
   - Fond gris clair
   - 4 cards : Voitures, Motos, Utilitaires, Tous
   - Hover avec élévation + bordure dorée
   - Compteurs dynamiques

5. **WhyChooseUsSection** (`WhyChooseUsSection.tsx`)
   - Fond noir
   - 4 arguments en grille
   - Icônes en cercle doré
   - Stock important, Photos HD, Service international, Contact direct

6. **LatestArrivalsSection** (`LatestArrivalsSection.tsx`)
   - Fond blanc
   - 3 dernières annonces
   - Badge "NOUVEAU"

7. **ContactCTASection** (`ContactCTASection.tsx`)
   - Fond gradient or (#C9A84C → #8B6914)
   - Boutons WhatsApp, Appeler, Formulaire
   - Hover noir

## Composants Partagés

### VehicleCard (`../vehicle/VehicleCard.tsx`)
- Aspect ratio 4:3
- Badge NOUVEAU (< 7 jours) / VENDU
- Hover élévation + bordure dorée
- Prix en grand or
- Icônes pour Année, Km, Carburant

### QuickSearchBar (`../search/QuickSearchBar.tsx`)
- Desktop: barre avec 3 selects + bouton
- Mobile: bouton qui ouvre modal
- Filtres: Marque, Type, Prix max

### FloatingWhatsAppButton (`../contact/FloatingWhatsAppButton.tsx`)
- Bouton flottant fixe bas-droite
- Animation pulse toutes les 3s
- Tooltip "Nous contacter sur WhatsApp"
- Modal avec preview conversation

## Page Principale

`src/app/[locale]/(public)/page.tsx`

- Server Component
- Récupération des données côté serveur (Supabase)
- Metadata SEO
- Assemblage des 7 sections

## Personnalisation

### Remplacer l'image hero
Remplacer `/public/hero.jpg` par une image de voiture premium (1920x1080 minimum recommandé).

### Modifier les textes
Les textes sont définis dans chaque composant avec un objet `texts` supportant fr/en.

### Ajuster les animations
Utiliser framer-motion avec les props:
- `initial`: état initial
- `animate`: état animé
- `transition`: durée et easing
- `whileHover`: effets au survol
