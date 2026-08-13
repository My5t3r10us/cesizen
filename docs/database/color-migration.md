# Migration des couleurs d'émotions

## 📋 Vue d'ensemble

Ce système génère automatiquement des nuances de couleurs pour chaque émotion basées sur la couleur de leur catégorie parente.

## 🎨 Fonctionnalités

### Génération automatique de nuances
- Chaque catégorie d'émotion a une couleur de base
- Le système génère 5 variations de cette couleur (plus sombre → plus clair)
- Chaque émotion dans une catégorie reçoit une nuance unique

### Exemples de variations par catégorie

**Joie** (`#FFD700` - Or)
- Fierté: Nuance plus sombre
- Contentement: Nuance moyennement sombre
- Enchantement: Couleur de base
- Excitation: Nuance moyennement claire
- Émerveillement: Nuance plus claire
- Gratitude: Variation de la palette

**Colère** (`#FF6B6B` - Rouge)
- Frustration, Irritation, Rage, etc. avec leurs propres nuances de rouge

## 🚀 Migration des données existantes

### Pour mettre à jour les émotions existantes

```bash
npm run db:migrate-colors
```

Ce script va:
1. Récupérer toutes les catégories d'émotions
2. Générer des variations de couleur pour chaque catégorie
3. Assigner une couleur unique à chaque émotion
4. Afficher un rapport détaillé des changements

### Pour les nouvelles installations

Le script de seed (`npm run db:seed`) génère automatiquement les couleurs lors de la création initiale.

## 📝 Fichiers modifiés

- **`lib/colors.ts`**: Fonctions utilitaires de génération de couleurs
- **`lib/db/seed.ts`**: Seed avec génération automatique de couleurs
- **`lib/db/migrate-colors.ts`**: Script de migration des données
- **`components/admin/emotion-form.tsx`**: Interface avec sélecteur de nuances
- **`components/admin/category-card.tsx`**: Affichage amélioré des émotions

## 🎯 Utilisation dans l'interface admin

1. Accédez à **Admin → Émotions**
2. Créez ou modifiez une émotion
3. Sélectionnez une catégorie
4. Choisissez parmi 5 suggestions de nuances
5. Ou utilisez le sélecteur de couleur personnalisé

## ✨ Indicateurs visuels

- **Pastille de couleur** sur chaque badge d'émotion
- **Icône ✨** pour les émotions avec couleur personnalisée
- **Bordures colorées** pour une meilleure distinction

## 🔄 Schéma de base de données

Aucune modification du schéma n'est nécessaire. Le champ `color_hex` existe déjà dans la table `emotions` et peut être `NULL` (héritera de la catégorie).

## 📊 Résultat attendu

Après la migration, chaque émotion aura sa propre couleur nuancée:
- Les émotions d'une même catégorie auront des teintes cohérentes
- Meilleure distinction visuelle entre les émotions
- Interface plus riche et intuitive
