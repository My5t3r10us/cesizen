# Cahier de recette de CESIZen

> Cahier de recette utilisateur (UAT — User Acceptance Testing) pour validation par le commanditaire.

| Champ | Valeur |
|-------|--------|
| Version | 1.0 |
| Date | 2026-05-04 |
| Maître d'ouvrage | _à compléter_ |
| Maître d'œuvre | Équipe CESIZen |
| Périmètre | Application CESIZen — web, mobile, administration |
| Référence technique | [`test-plan.md`](test-plan.md), [`data-flows.md`](../architecture/data-flows.md) |

---

## Sommaire

1. [Cadre de la recette](#1-cadre-de-la-recette)
2. [Environnement de recette](#2-environnement-de-recette)
3. [Procédure de recette](#3-procédure-de-recette)
4. [Scénarios — Citoyen Web](#4-scénarios--citoyen-web-r-web-cit)
5. [Scénarios — Administrateur Web](#5-scénarios--administrateur-web-r-web-adm)
7. [Scénarios — Sécurité transverse](#7-scénarios--sécurité-transverse-r-sec)
8. [Tableau récapitulatif](#8-tableau-récapitulatif-de-la-campagne)
9. [Procès-verbal de recette](#9-procès-verbal-de-recette)
10. [Annexe A — Glossaire métier](#annexe-a--glossaire-métier)
11. [Annexe B — Classification des anomalies](#annexe-b--classification-des-anomalies)
12. [Annexe C — Procédure d'escalade](#annexe-c--procédure-descalade)

---

## 1. Cadre de la recette

### 1.1 Objectifs

La recette vise à vérifier que **CESIZen** répond aux besoins fonctionnels exprimés par le commanditaire avant la mise en production. Elle est exécutée par un panel de testeurs représentatifs des futurs utilisateurs (citoyens et administrateurs).

### 1.2 Périmètre couvert

| Fonctionnalité | Couvert |
|----------------|--------|
| Création de compte / Connexion / Déconnexion | ✅ |
| Saisie d'une émotion + intensité + note + tags | ✅ |
| Consultation calendrier journal | ✅ |
| Statistiques personnelles (7j / 30j / 90j) | ✅ |
| Lecture d'articles publics | ✅ |
| Administration utilisateurs (ban / promote / delete) | ✅ |
| Administration articles (CRUD) | ✅ |
| Administration référentiel d'émotions | ✅ |
| Synchronisation entre web et mobile | ✅ |
| Confidentialité des notes (chiffrement) | ✅ |

### 1.3 Périmètre exclu de la recette

- Tests de charge / performance (campagne dédiée)
- Tests de sécurité approfondis (audit pentest dédié)
- Internationalisation (FR uniquement à ce stade)

### 1.4 Acteurs

| Acteur | Description |
|--------|-------------|
| **Citoyen** | Utilisateur final, suit ses émotions au quotidien |
| **Administrateur** | Gère contenu, utilisateurs et référentiels |
| **Testeur recette** | Exécute les scénarios, remplit le PV |

### 1.5 Critères d'acceptation globaux

La recette est **prononcée** si :
- ✅ 100 % des scénarios « Bloquant » sont OK
- ✅ ≥ 95 % des scénarios « Majeur » sont OK
- ✅ Aucune anomalie Bloquante ouverte
- ✅ Le PV est signé par le maître d'ouvrage

---

## 2. Environnement de recette

| Item | Valeur |
|------|--------|
| URL Web | À renseigner avant la campagne |
| Build mobile | À fournir avant la campagne |
| Base de données | PostgreSQL dédiée à préparer avant la campagne |
| Navigateurs cibles | Chrome ≥ 120, Firefox ≥ 120, Safari ≥ 17, Edge ≥ 120 |
| Résolutions à tester | 360×640 / 768×1024 / 1366×768 / 1920×1080 |

### 2.1 Comptes à provisionner

Le seed applicatif crée uniquement
`admin@cesizen.fr / Admin123!`. Les comptes `demo`, `empty` et `banned`,
ainsi que leurs données, sont des prérequis de campagne à préparer dans
l'environnement de recette.

| Login | Mot de passe | Rôle | État | Usage |
|-------|--------------|------|------|-------|
| `admin@cesizen.fr` | `Admin123!` | admin | actif | Scénarios admin |
| `demo@cesizen.fr` | `Demo1234` | user | actif (50 entrées préparées) | Stats déjà remplies |
| `empty@cesizen.fr` | `Empty1234` | user | actif (0 entrée) | Tests « état vide » |
| `banned@cesizen.fr` | `Banned1234` | user | banni | Test login refusé |

### 2.2 Données pré-chargées

- Le seed applicatif fournit 6 catégories d'émotions et 36 émotions.
- Le seed applicatif fournit 6 catégories d'articles, mais aucun article.
- La campagne doit ajouter 8 articles publiés, 2 brouillons et 50 entrées
  émotionnelles sur 90 jours pour `demo@cesizen.fr`.

---

## 3. Procédure de recette

### 3.1 Comment exécuter un scénario

1. **Lire** le scénario en entier avant de commencer.
2. **Vérifier** les préconditions (compte, données nécessaires).
3. **Suivre** les étapes une par une, sans déviation.
4. **Comparer** chaque résultat observé au résultat attendu.
5. **Cocher** la case appropriée (☐ OK / ☐ KO / ☐ Bloqué / ☐ N/A).
6. En cas d'écart : remplir une **fiche d'anomalie** (cf. annexe).

### 3.2 Comment remonter une anomalie

Toute anomalie est remontée :
- Sur le **canal #recette-cesizen** (Slack/Teams)
- Avec une **fiche d'anomalie** (modèle dans [`test-plan.md`](test-plan.md), annexe A)
- Capture d'écran ou vidéo systématique
- Message d'erreur exact (recopié, pas paraphrasé)
- Heure précise (UTC) pour corrélation logs

### 3.3 Statuts possibles

| Statut | Signification |
|--------|--------------|
| ☐ **OK** | Comportement conforme au résultat attendu |
| ☐ **KO** | Écart constaté → fiche d'anomalie obligatoire |
| ☐ **Bloqué** | Impossible d'exécuter (préconditions absentes, env down) |
| ☐ **N/A** | Non applicable au contexte |

---

## 4. Scénarios — Citoyen Web (R-WEB-CIT)

### R-WEB-CIT-01 — Inscription et premier suivi émotionnel

| Champ | Valeur |
|-------|--------|
| **Acteur** | Citoyen non connecté |
| **Criticité** | Bloquant |
| **Objectif** | Créer un compte et enregistrer une première émotion sans aide externe |
| **Préconditions** | Aucune (utilisateur lambda découvre l'app) |

**Étapes :**

1. Ouvrir https://recette.cesizen.fr dans un navigateur en navigation privée
2. Cliquer **« Commencer gratuitement »** sur la page d'accueil
3. Remplir le formulaire :
   - Prénom : `Marie`
   - Nom : `Test`
   - Email : `marie.test+<date>@example.com`
   - Mot de passe : `Recette2026`
   - Confirmer : `Recette2026`
4. Cliquer **« S'inscrire »**
5. Sur le dashboard, cliquer **« Ajouter une émotion »**
6. Choisir la catégorie **« Joie »**
7. Choisir l'émotion **« Heureux »**
8. Régler l'intensité à **4/5**
9. Cocher le tag **« Travail »**
10. Saisir la note : `Très bonne journée, projet livré !`
11. Cliquer **« Enregistrer »**

**Résultat attendu :**

- ✓ Toast vert « Votre humeur a été enregistrée ! »
- ✓ La carte « Météo du jour » affiche « 1 entrée aujourd'hui »
- ✓ La section « Entrées récentes » liste l'entrée créée
- ✓ Le KPI « Entrées aujourd'hui » passe à 1

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-CIT-02 — Connexion quotidienne et consultation calendrier

| Acteur | Criticité |
|--------|-----------|
| Citoyen avec compte actif | Bloquant |

**Préconditions :** Compte `demo@cesizen.fr / Demo1234` (50 entrées sur 90 jours).

**Étapes :**

1. Aller sur `/login`
2. Saisir `demo@cesizen.fr` / `Demo1234`
3. Cliquer **« Se connecter »**
4. Naviguer vers **« Mon Espace »** (header)
5. Vérifier le greeting (« Bonjour », « Bon après-midi » ou « Bonsoir » selon l'heure)
6. Cliquer sur **« Mon Journal »** dans la nav mobile (bottom nav) ou le menu (desktop)
7. Naviguer dans le calendrier au mois précédent
8. Cliquer sur une date avec entrée

**Résultat attendu :**

- ✓ Redirection automatique vers `/dashboard`
- ✓ Le greeting affiche le prénom du compte (`Demo`)
- ✓ Calendrier émotionnel affiche des points colorés sur les dates avec entrées
- ✓ Click sur date → dialog avec les entrées du jour, note déchiffrée visible

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-CIT-03 — Édition d'une note ancienne (déchiffrement OK)

| Acteur | Criticité |
|--------|-----------|
| Citoyen connecté | Majeur |

**Préconditions :** Au moins une entrée avec note non vide existante.

**Étapes :**

1. `/dashboard/journal` → cliquer une date avec entrée
2. Dans le dialog, cliquer **« Modifier »**
3. Vérifier que la note s'affiche en clair dans le textarea
4. Modifier la note : ajouter `[édité le <date>]` à la fin
5. Régler l'intensité sur 5
6. Cliquer **« Enregistrer »**
7. Recharger la page (F5)
8. Cliquer à nouveau sur la même date

**Résultat attendu :**

- ✓ Note rechargée avec la modification
- ✓ Intensité = 5/5
- ✓ Pas de perte de tags ni d'émotion

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-CIT-04 — Analyse des statistiques sur 30 jours

| Acteur | Criticité |
|--------|-----------|
| Citoyen connecté avec historique | Majeur |

**Préconditions :** `demo@cesizen.fr` avec les 50 entrées préparées pour la
campagne.

**Étapes :**

1. Login → cliquer **« Statistiques »**
2. Cliquer le preset **« Ce mois »**
3. Observer les KPI
4. Cliquer **« Cette semaine »**
5. Cliquer **« Cette année »**
6. Sélectionner manuellement une plage via les date pickers (ex : 1er du mois → aujourd'hui)
7. Vérifier les graphes : évolution / distribution catégorie / top émotions / weekday / hour / tags

**Résultat attendu :**

- ✓ KPI « Entrées totales », « Intensité moyenne », « Jours consécutifs max », « Jours actifs » s'affichent et changent selon la période
- ✓ Émotion la plus fréquente affichée avec compteur + pourcentage
- ✓ Graphe d'évolution lisible (lignes ou points)
- ✓ Distribution par catégorie avec barres colorées proportionnelles
- ✓ Activité par jour de semaine et par heure
- ✓ Cloud de tags si tags utilisés

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-CIT-05 — Lecture d'un article public sans connexion

| Acteur | Criticité |
|--------|-----------|
| Visiteur anonyme | Majeur |

**Étapes :**

1. Navigation privée → aller sur https://recette.cesizen.fr
2. Cliquer **« Conseils »**
3. Vérifier la liste des articles
4. Cliquer un article (ex : « Bien dormir »)
5. Lire l'intégralité
6. Cliquer **« Retour aux conseils »**

**Résultat attendu :**

- ✓ Liste accessible sans login
- ✓ Article complet lisible
- ✓ Mise en forme HTML correcte (titres, listes, gras, liens cliquables)
- ✓ CTA « Créez votre compte CESIZen » affiché en bas (visiteur non connecté)
- ✓ Retour fonctionne

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-CIT-06 — Recherche et filtre d'articles

| Acteur | Criticité |
|--------|-----------|
| Visiteur ou citoyen | Mineur |

**Étapes :**

1. `/conseils`
2. Saisir « stress » dans la barre de recherche
3. Vérifier les résultats
4. Effacer la recherche
5. Sélectionner la catégorie « Sommeil » dans le filtre
6. Changer le tri pour « Titre A-Z »

**Résultat attendu :**

- ✓ Recherche filtre titre + content + excerpt en temps réel
- ✓ Filtre catégorie ne montre que les articles de la catégorie
- ✓ Tri alphabétique fonctionne
- ✓ Compteur « X article(s) trouvé(s) » s'actualise

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-CIT-07 — Déconnexion + accès refusé au dashboard

| Acteur | Criticité |
|--------|-----------|
| Citoyen connecté | Bloquant (sécurité) |

**Étapes :**

1. Connecté en tant que `demo@cesizen.fr`
2. Cliquer l'avatar en haut à droite → **« Déconnexion »**
3. Vérifier la redirection
4. Tenter d'accéder à `/dashboard` directement via l'URL
5. Tenter d'accéder à `/dashboard/journal`

**Résultat attendu :**

- ✓ Redirection vers `/` après logout
- ✓ Avatar disparaît, CTA « Connexion / S'inscrire » réapparaissent
- ✓ Tentative `/dashboard` → redirige sur `/login`
- ✓ Tentative `/dashboard/journal` → redirige sur `/login`

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-CIT-08 — Tentative de connexion avec mauvais identifiants

| Acteur | Criticité |
|--------|-----------|
| Citoyen | Majeur |

**Étapes :**

1. `/login`
2. Saisir `demo@cesizen.fr` / `MauvaisMotDePasse`
3. Soumettre
4. Saisir `inconnu@nimporte.fr` / `Test1234`
5. Soumettre
6. Saisir `banned@cesizen.fr` / `Banned1234`
7. Soumettre

**Résultat attendu :**

- ✓ Étapes 2-3 : message « Email ou mot de passe incorrect »
- ✓ Étapes 4-5 : **même** message (pas de divulgation d'existence)
- ✓ Étapes 6-7 : message spécifique « suspendu / contactez l'administrateur »

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-CIT-09 — Consultation du profil

| Acteur | Criticité |
|--------|-----------|
| Citoyen connecté | Mineur |

**Étapes :**

1. Login → menu avatar → **« Mon Profil »**
2. Vérifier les informations affichées

**Résultat attendu :**

- ✓ Avatar avec initiales (ex : `DT` pour Demo Test)
- ✓ Email correct
- ✓ Badge « Utilisateur »
- ✓ Mention « Vos notes sont chiffrées de bout en bout »
- ✓ Bouton « Déconnexion » fonctionnel

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-CIT-10 — État vide (compte sans entrée)

| Acteur | Criticité |
|--------|-----------|
| Citoyen sans historique | Mineur |

**Préconditions :** `empty@cesizen.fr / Empty1234`.

**Étapes :**

1. Login avec ce compte
2. Naviguer dashboard → journal → statistiques

**Résultat attendu :**

- ✓ Dashboard : KPI à 0, message engageant
- ✓ Journal : calendrier sans points, message « Aucune entrée »
- ✓ Stats : message « Aucune entrée sur cette période. Commencez à enregistrer vos émotions ! »

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

## 5. Scénarios — Administrateur Web (R-WEB-ADM)

### R-WEB-ADM-01 — Tableau de bord administrateur

| Acteur | Criticité |
|--------|-----------|
| Administrateur | Bloquant |

**Étapes :**

1. Login `admin@cesizen.fr / Admin123!`
2. Cliquer **« Administration »** dans le header
3. Observer les KPI

**Résultat attendu :**

- ✓ Bandeau d'avertissement RGPD : « Les notes des utilisateurs sont chiffrées et inaccessibles »
- ✓ KPI affichés : Utilisateurs totaux, Nouveaux cette semaine, Articles publiés / total, Utilisateurs bannis
- ✓ Cards d'accès rapide : Articles, Utilisateurs

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-ADM-02 — Création d'un article complet

| Acteur | Criticité |
|--------|-----------|
| Administrateur | Bloquant |

**Étapes :**

1. Admin connecté → `/admin/articles` → **« Nouvel article »**
2. Remplir :
   - Titre : `Recette - Article test <date>`
   - Slug : `recette-article-<date>`
   - Catégorie : Bien-être
   - Cover image (URL) : facultatif
   - Excerpt : `Un résumé court`
   - Contenu (TipTap) : 1 H1, 1 paragraphe, 1 liste à puces, 1 lien
3. Décocher **« Publié »** (laisser en brouillon)
4. Cliquer **« Créer »**
5. Vérifier l'apparition dans la liste avec badge « Brouillon »
6. Ouvrir un onglet privé, aller sur `/conseils` → l'article ne doit PAS apparaître
7. Cliquer l'article → **« Modifier »** → cocher « Publié » → sauver
8. Recharger l'onglet privé `/conseils`

**Résultat attendu :**

- ✓ Création : redirection sur la liste, badge Brouillon
- ✓ Public : invisible quand brouillon
- ✓ Public : visible après publication
- ✓ URL `/conseils/recette-article-<date>` accessible publiquement

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-ADM-03 — Modification + dépublication d'un article

| Acteur | Criticité |
|--------|-----------|
| Administrateur | Majeur |

**Étapes :**

1. `/admin/articles` → éditer l'article créé en R-WEB-ADM-02
2. Modifier le titre
3. Décocher **« Publié »**
4. Sauver
5. Onglet privé : recharger `/conseils`

**Résultat attendu :**

- ✓ Titre modifié dans la liste admin
- ✓ Public : article disparu de la liste, URL directe → « Article non trouvé »

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-ADM-04 — Suppression d'un article

| Acteur | Criticité |
|--------|-----------|
| Administrateur | Majeur |

**Étapes :**

1. `/admin/articles` → cliquer l'icône poubelle de l'article test
2. Confirmer

**Résultat attendu :**

- ✓ Article disparu de la liste
- ✓ URL directe → « Article non trouvé »
- ✓ Aucune trace en base (vérifié si accès SQL)

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-ADM-05 — Bannir un utilisateur abusif

| Acteur | Criticité |
|--------|-----------|
| Administrateur | Bloquant |

**Étapes :**

1. `/admin/users`
2. Trouver `marie.test+<date>@example.com` (créé en R-WEB-CIT-01)
3. Cliquer **« Bannir »**
4. Ouvrir un onglet privé → tenter de se connecter avec ce compte

**Résultat attendu :**

- ✓ Badge « Banni » apparaît dans la liste admin
- ✓ Tentative login → message « suspendu »
- ✓ Card de l'utilisateur bordure rouge / fond destructive

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-ADM-06 — Tentative d'auto-bannissement refusée

| Acteur | Criticité |
|--------|-----------|
| Administrateur | Bloquant (sécurité) |

**Étapes :**

1. `/admin/users` → chercher son propre compte
2. Vérifier que les boutons « Bannir » et « Supprimer » sont absents OU rejetés

**Résultat attendu :**

- ✓ Soit les boutons n'apparaissent pas
- ✓ Soit ils renvoient une erreur API claire

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-ADM-07 — Promotion d'un user en admin

| Acteur | Criticité |
|--------|-----------|
| Administrateur | Majeur |

**Étapes :**

1. `/admin/users` → choisir `empty@cesizen.fr`
2. Cliquer **« Promouvoir admin »**
3. Confirmer
4. Logout admin
5. Login `empty@cesizen.fr / Empty1234`
6. Vérifier la présence du lien « Administration »

**Résultat attendu :**

- ✓ Badge « admin » apparaît dans la liste
- ✓ `empty@cesizen.fr` voit désormais le lien Administration et y accède

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

⚠ **Restauration après recette** : repromouvoir vers user pour reset.

---

### R-WEB-ADM-08 — Création d'une catégorie d'émotion + 3 émotions

| Acteur | Criticité |
|--------|-----------|
| Administrateur | Majeur |

**Étapes :**

1. `/admin/emotions` → **« + Catégorie »**
2. Remplir : label `Recette`, couleur `#00B894`, icône `heart`
3. Sauver
4. **« + Émotion »** (× 3) :
   - Reconnaissant (variation 1 du vert)
   - Inspiré (variation 2)
   - Optimiste (variation 3)
5. Logout admin → login user → ajouter une émotion → vérifier la présence de la catégorie « Recette »

**Résultat attendu :**

- ✓ Catégorie + 3 émotions visibles dans `/admin/emotions`
- ✓ Côté user, sélection en 2 étapes propose la nouvelle catégorie + ses 3 émotions

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-WEB-ADM-09 — Suppression de la catégorie de test (cascade)

| Acteur | Criticité |
|--------|-----------|
| Administrateur | Majeur |

**Étapes :**

1. `/admin/emotions` → supprimer la catégorie `Recette`
2. Confirmer

**Résultat attendu :**

- ✓ Catégorie supprimée
- ✓ Cascade : les 3 émotions sont supprimées (vérifié via `/admin/emotions`)
- ⚠ Si des entrées utilisaient ces émotions → vérifier le comportement (404 ou cascade aussi à valider)

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

## 7. Scénarios — Sécurité transverse (R-SEC)

### R-SEC-01 — Confidentialité des notes (admin n'y a pas accès)

| Acteur | Criticité |
|--------|-----------|
| Administrateur | Bloquant (RGPD) |

**Étapes :**

1. User `demo@cesizen.fr` saisit une entrée avec note `Note ultra-confidentielle XYZ123`
2. Logout user, login `admin@cesizen.fr`
3. Parcourir l'interface admin (`/admin`, `/admin/users`, etc.)
4. Tenter via DevTools de fetch `/api/entries` ou `/api/entries/<id>` avec le cookie admin
5. Inspecter les éventuelles données utilisateur retournées

**Résultat attendu :**

- ✓ **Aucun écran admin n'affiche la note ni `noteEncrypted`**
- ✓ Les endpoints admin n'exposent pas les notes (404 ou pas de champ)
- ✓ Le bandeau RGPD est visible sur `/admin` et `/admin/users`

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-SEC-02 — Protection des routes admin

| Acteur | Criticité |
|--------|-----------|
| User non-admin | Bloquant |

**Étapes :**

1. Login `demo@cesizen.fr`
2. Tenter d'accéder à `/admin`, `/admin/articles`, `/admin/users`, `/admin/emotions` directement par URL

**Résultat attendu :**

- ✓ Toutes redirigent vers `/dashboard`
- ✓ Aucun appel API admin ne réussit avec le cookie user (testable DevTools)

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-SEC-03 — Lecture cross-user refusée (IDOR)

| Acteur | Criticité |
|--------|-----------|
| User malveillant | Bloquant |

**Étapes :**

1. UserA crée une entrée → noter son UUID dans la URL ou via DevTools
2. Logout, login UserB
3. Via DevTools : `fetch('/api/entries/<uuid-de-userA>')` avec cookie UserB

**Résultat attendu :**

- ✓ HTTP 404
- ✓ Aucune fuite d'information

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-SEC-04 — Token altéré rejeté

| Acteur | Criticité |
|--------|-----------|
| Mobile / Web | Bloquant |

**Étapes :**

1. Récupérer un JWT valide (cookie ou Bearer)
2. Modifier 1 caractère dans la signature (3e segment)
3. Faire une requête authentifiée avec ce token

**Résultat attendu :**

- ✓ HTTP 401 (ou null pour `/auth/me`)
- ✓ Aucune action effectuée

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-SEC-05 — Pas de divulgation par messages d'erreur

| Acteur | Criticité |
|--------|-----------|
| Attaquant | Majeur |

**Étapes :**

1. Login avec email **inexistant** → noter le message
2. Login avec email **existant + mauvais mdp** → noter le message
3. Comparer

**Résultat attendu :**

- ✓ **Identiques** : « Email ou mot de passe incorrect »
- ✓ Pas de différence permettant de deviner si l'email existe

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

### R-SEC-06 — XSS via note utilisateur

| Acteur | Criticité |
|--------|-----------|
| User malveillant | Majeur |

**Étapes :**

1. Créer une entrée avec note : `<script>alert('xss')</script>`
2. Recharger le dashboard / journal
3. Ouvrir l'entrée

**Résultat attendu :**

- ✓ La note affichée en **texte brut**, pas d'exécution
- ✓ Pas de popup `alert`

**Statut :** ☐ OK · ☐ KO · ☐ Bloqué · ☐ N/A
**Commentaire :** ____________________________________________________________

---

## 8. Tableau récapitulatif de la campagne

À remplir au fur et à mesure.

### 8.1 Citoyen Web

| ID | Titre | OK | KO | Bloqué | N/A | Anomalie |
|----|-------|----|----|--------|-----|----------|
| R-WEB-CIT-01 | Inscription + 1ère émotion | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-CIT-02 | Connexion + calendrier | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-CIT-03 | Édition note ancienne | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-CIT-04 | Statistiques 30 jours | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-CIT-05 | Article public sans login | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-CIT-06 | Recherche + filtre | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-CIT-07 | Logout + accès refusé | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-CIT-08 | Mauvais identifiants | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-CIT-09 | Profil | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-CIT-10 | État vide | ☐ | ☐ | ☐ | ☐ | _________ |

### 8.2 Administrateur Web

| ID | Titre | OK | KO | Bloqué | N/A | Anomalie |
|----|-------|----|----|--------|-----|----------|
| R-WEB-ADM-01 | Dashboard admin | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-ADM-02 | Création article | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-ADM-03 | Modif/dépublier | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-ADM-04 | Suppression article | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-ADM-05 | Bannir user | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-ADM-06 | Auto-ban refusé | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-ADM-07 | Promotion admin | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-ADM-08 | Cat. + émotions | ☐ | ☐ | ☐ | ☐ | _________ |
| R-WEB-ADM-09 | Suppression cat. | ☐ | ☐ | ☐ | ☐ | _________ |

### 8.4 Sécurité

| ID | Titre | OK | KO | Bloqué | N/A | Anomalie |
|----|-------|----|----|--------|-----|----------|
| R-SEC-01 | Confidentialité notes | ☐ | ☐ | ☐ | ☐ | _________ |
| R-SEC-02 | Protection routes admin | ☐ | ☐ | ☐ | ☐ | _________ |
| R-SEC-03 | IDOR refusé | ☐ | ☐ | ☐ | ☐ | _________ |
| R-SEC-04 | Token altéré | ☐ | ☐ | ☐ | ☐ | _________ |
| R-SEC-05 | Pas de divulgation | ☐ | ☐ | ☐ | ☐ | _________ |
| R-SEC-06 | XSS note | ☐ | ☐ | ☐ | ☐ | _________ |

### 8.5 Compteur global

|  | Total | OK | KO | Bloqué | N/A |
|---|------|----|----|--------|-----|
| Citoyen Web | 10 | __ | __ | __ | __ |
| Admin Web | 9 | __ | __ | __ | __ |
| Sécurité | 6 | __ | __ | __ | __ |
| **TOTAL** | **34** | __ | __ | __ | __ |

**Taux de réussite :** ____ %

---

## 9. Procès-verbal de recette

> À compléter et signer en clôture de la campagne de recette.

### 9.1 Identification

| Champ | Valeur |
|-------|--------|
| Projet | CESIZen |
| Version livrée | _____________ |
| Date de début de recette | _____________ |
| Date de fin de recette | _____________ |
| Lieu | _____________ |

### 9.2 Participants

| Rôle | Nom | Organisation | Signature |
|------|-----|--------------|-----------|
| Maître d'ouvrage | __________ | __________ | __________ |
| Maître d'œuvre | __________ | __________ | __________ |
| Testeur recette 1 | __________ | __________ | __________ |
| Testeur recette 2 | __________ | __________ | __________ |

### 9.3 Synthèse des résultats

| Catégorie | Cas exécutés | OK | KO | Bloqués | Taux |
|-----------|--------------|----|----|---------|------|
| Citoyen Web | / 10 | __ | __ | __ | __ % |
| Admin Web | / 9 | __ | __ | __ | __ % |
| Sécurité | / 6 | __ | __ | __ | __ % |
| **GLOBAL** | / 34 | __ | __ | __ | __ % |

### 9.4 Anomalies remontées

| ID anomalie | Titre | Sévérité | Statut |
|-------------|-------|----------|--------|
| ANO-2026-001 | _____________________________________ | Bloquante / Majeure / Mineure / Cosmétique | Ouverte / Corrigée / Vérifiée |
| ANO-2026-002 | _____________________________________ | _____________ | _____________ |
| ANO-2026-003 | _____________________________________ | _____________ | _____________ |

(Ajouter autant de lignes que nécessaire.)

### 9.5 Décision

Cocher une seule option :

☐ **Recette prononcée sans réserve**
   Tous les critères d'acceptation sont remplis. Mise en production autorisée.

☐ **Recette prononcée avec réserves**
   Anomalies majeures documentées et acceptées par le maître d'ouvrage.
   Liste : _________________________________________________________________
   Engagement de correction sous : _____ semaines.

☐ **Recette refusée**
   Au moins une anomalie bloquante non résolue.
   Une nouvelle campagne est requise après correction.

### 9.6 Engagements post-recette

- [ ] Correctifs des anomalies bloquantes : _____________
- [ ] Tests de non-régression à exécuter après fixes : _____________
- [ ] Date de la nouvelle campagne (si applicable) : _____________
- [ ] Documentation à mettre à jour : _____________

### 9.7 Signatures

```
Fait à __________________, le ___/___/______


Maître d'ouvrage                   Maître d'œuvre
(Nom + signature)                  (Nom + signature)



______________                     ______________
```

---

## Annexe A — Glossaire métier

| Terme | Définition |
|-------|-----------|
| **Émotion** | Ressenti subjectif identifié par l'utilisateur (ex : Heureux, Anxieux). Toujours rattachée à une **catégorie**. |
| **Catégorie d'émotion** | Famille regroupant des émotions similaires (Joie, Tristesse, Colère, Peur, Surprise). |
| **Entrée (journal)** | Enregistrement d'un ressenti à un instant T, comprenant : émotion, intensité (1-10), note privée chiffrée, tags de contexte. |
| **Tag de contexte** | Étiquette associée à une entrée pour qualifier la situation (Travail, Famille, Sport, Sommeil…). |
| **Article (conseil)** | Contenu rédigé par un admin pour accompagner les utilisateurs. Peut être Brouillon ou Publié. |
| **Streak** | Nombre maximum de jours consécutifs avec au moins une entrée. |
| **Catégorie d'article** | Classification éditoriale (Bien-être, Stress, Sommeil…). |
| **Citoyen** | Utilisateur final lambda, rôle `user`. |
| **Administrateur** | Utilisateur avec rôle `admin`, gère contenu et utilisateurs. |
| **JWT** | JSON Web Token — jeton d'authentification signé HMAC-SHA256, durée 7 jours. |
| **Bearer token** | Mode d'envoi du JWT côté mobile via header `Authorization`. |
| **Cookie httpOnly** | Mode d'envoi du JWT côté web, inaccessible au JavaScript client. |
| **AES-256-GCM** | Algorithme de chiffrement symétrique authentifié des notes utilisateurs. |

---

## Annexe B — Classification des anomalies

| Sévérité | Critères | Exemple | Délai correctif |
|----------|----------|---------|----------------|
| **Bloquante** | Empêche l'utilisation du logiciel ou compromet la sécurité / l'intégrité des données | Login HS, IDOR, leak de données privées | Hot-fix < 24 h |
| **Majeure** | Fonctionnalité importante dégradée, contournement difficile | Stats fausses, ban contournable, crash récurrent | Avant la mise en production |
| **Mineure** | Gêne fonctionnelle mineure, contournement existe | Filtre articles bug, message d'erreur peu clair | Version + 1 |
| **Cosmétique** | Visuel, libellé, animation | Typo, alignement, couleur inexacte | Backlog |

### Décision en fonction des anomalies

| Bloquantes ouvertes | Majeures ouvertes | Décision recommandée |
|--------------------|-------------------|---------------------|
| 0 | 0 | ✅ Recette prononcée |
| 0 | ≤ 2 (acceptées) | ⚠ Recette avec réserves |
| 0 | > 2 | ❌ Recette refusée |
| ≥ 1 | * | ❌ Recette refusée (absolu) |

---

## Annexe C — Procédure d'escalade

| Niveau | Type d'anomalie | Personne à prévenir | Canal |
|--------|----------------|--------------------|----|
| 1 | Cosmétique / Mineure | Chef de projet | Tracker |
| 2 | Majeure | Lead dev + Chef de projet | Slack #cesizen-dev |
| 3 | Bloquante | Lead dev + DPO si données | Téléphone + Slack |
| 4 | Faille de sécurité | RSSI + DPO | E-mail chiffré + tel |

### Délai de prise en compte

| Sévérité | Accusé de réception | 1ère réponse |
|----------|--------------------|---|
| Bloquante | < 1 h ouvrée | < 4 h ouvrées |
| Majeure | < 4 h ouvrées | < 24 h ouvrées |
| Mineure | < 1 j ouvré | < 3 j ouvrés |
| Cosmétique | Best-effort | Backlog |

---

*Cahier de recette v1.0 — à utiliser conjointement avec
[`test-plan.md`](test-plan.md), le référentiel technique.*
