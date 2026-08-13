# Cahier de tests de CESIZen

> Référentiel formel des cas de test couvrant l'ensemble de l'application (PWA Next.js et API REST).

| Champ | Valeur |
|-------|--------|
| Version | 1.0 |
| Date | 2026-05-04 |
| Périmètre | Application CESIZen — toutes surfaces |
| Références | [`data-flows.md`](../architecture/data-flows.md), [`README.md`](README.md), [`README` racine](../../README.md) |
| Norme | Inspiré ISO/IEC/IEEE 29119 (simplifié) |

---

## Sommaire

1. [Stratégie de test](#1-stratégie-de-test)
2. [Environnements](#2-environnements)
3. [Données de test](#3-données-de-test)
4. [Critères d'entrée et de sortie](#4-critères-dentrée-et-de-sortie)
5. [Matrice de couverture](#5-matrice-de-couverture)
6. [Cas de test — AUTH](#6-cas-de-test--auth-authentification)
7. [Cas de test — JRN (Journal émotionnel)](#7-cas-de-test--jrn-journal-émotionnel)
8. [Cas de test — STAT (Statistiques)](#8-cas-de-test--stat-statistiques)
9. [Cas de test — CONS (Conseils / Articles)](#9-cas-de-test--cons-conseils--articles)
10. [Cas de test — ADM (Administration)](#10-cas-de-test--adm-administration)
11. [Cas de test — MOB (Mobile spécifique)](#11-cas-de-test--mob-mobile-spécifique)
12. [Cas de test — SEC (Sécurité)](#12-cas-de-test--sec-sécurité)
13. [Plan de régression](#13-plan-de-régression)
14. [Annexe A — Modèle de fiche d'anomalie](#annexe-a--modèle-de-fiche-danomalie)
15. [Annexe B — Classification des anomalies](#annexe-b--classification-des-anomalies)

---

## 1. Stratégie de test

### 1.1 Niveaux de test

| Niveau | Outil | Pour quoi |
|--------|-------|-----------|
| **Unitaire** | Vitest (web), Jest (mobile) | Logique pure : hash, chiffrement, validation, helpers |
| **Intégration** | Vitest + Supertest (Route Handlers Next directs) | Endpoints API + DB + chiffrement bout-en-bout |
| **Manuel exploratoire** | Humain | UX, lisibilité, cohérence visuelle |

### 1.2 Types de test

- **Fonctionnel** — comportement métier conforme à la spécification.
- **Sécurité** — RBAC, ownership, chiffrement, JWT, headers.
- **Robustesse** — gestion des entrées invalides, cas limites, erreurs réseau.
- **Régression** — sous-ensemble joué à chaque release.
- **Compatibilité** — Chrome / Firefox / Safari, avec installation PWA sur iOS et Android.

### 1.3 Criticité (priorité d'exécution)

| Niveau | Définition | Exemple |
|--------|-----------|---------|
| **Bloquant** | Échec = pas de mise en prod | Login impossible, perte de données utilisateur |
| **Haute** | À corriger avant release | Stats erronées, ban contournable |
| **Moyenne** | À corriger dans la version + 1 | Filtre articles bug, message d'erreur peu clair |
| **Basse** | Backlog | Animation saccadée, libellé typo |

---

## 2. Environnements

| Environnement | URL Web | API Mobile | Base de données | Usage |
|---------------|---------|------------|-----------------|-------|
| **Local dev** | http://localhost:3000 | http://localhost:3000 | Postgres local | Développement |
| **CI** | localhost:3000 (éphémère) | — | Postgres service container | Pipeline automatisé |
| **Staging / Recette** | À renseigner | À renseigner | Base dédiée à préparer | UAT |
| **Production** | Hors périmètre de ce dépôt | Hors périmètre | Hors périmètre | Live |

### Versions cibles

| Plateforme | Versions supportées |
|-----------|---------------------|
| Navigateurs web | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |
| Résolutions | 360×640 (mobile) → 1920×1080 (desktop) |

---

## 3. Données de test

### 3.1 Comptes de recette à provisionner

Le seed applicatif garantit uniquement
`admin@cesizen.fr / Admin123!`. Les autres comptes ci-dessous doivent être
créés dans l'environnement de recette avant la campagne.

| Login | Mot de passe | Rôle | État |
|-------|--------------|------|------|
| `admin@cesizen.fr` | `Admin123!` | admin | actif |
| `demo@cesizen.fr` | `Demo1234` | user | actif |
| `banned@cesizen.fr` | `Banned1234` | user | banni |
| `empty@cesizen.fr` | `Empty1234` | user | actif (0 entrée) |

### 3.2 Référentiel d'émotions seed

| Catégorie | Couleur | Émotions |
|-----------|---------|----------|
| Joie | #FFD700 | Heureux, Fier, Apaisé, Reconnaissant |
| Tristesse | #4682B4 | Mélancolique, Découragé, Solitaire |
| Colère | #DC143C | Frustré, Irrité, Furieux |
| Peur | #800080 | Anxieux, Inquiet, Stressé |
| Surprise | #FFA500 | Étonné, Émerveillé |

### 3.3 Articles seed

Au moins 5 articles publiés dont 1 par catégorie (Bien-être, Stress, Sommeil, Travail, Émotions).

---

## 4. Critères d'entrée et de sortie

### 4.1 Critères d'entrée d'une campagne de test

- [ ] Build déployé sur l'environnement cible
- [ ] Migrations DB appliquées (`drizzle-kit migrate`)
- [ ] Données seed chargées
- [ ] Comptes de test créés
- [ ] Documentation à jour
- [ ] Pipeline CI vert sur la branche

### 4.2 Critères de sortie

- [ ] **100 %** des cas Bloquants OK
- [ ] **≥ 95 %** des cas Hautes OK
- [ ] **≥ 85 %** des cas Moyennes OK
- [ ] Aucune anomalie Bloquante ouverte
- [ ] Tous les correctifs livrés ont leur test de non-régression
- [ ] PV de recette signé

---

## 5. Matrice de couverture

| Exigence métier | Cas de test associés |
|----------------|----------------------|
| Un citoyen peut créer un compte | CT-AUTH-001, CT-AUTH-002, CT-AUTH-003 |
| Un citoyen peut se connecter | CT-AUTH-004, CT-AUTH-005, CT-AUTH-006, CT-AUTH-007 |
| Les notes sont chiffrées au repos | CT-JRN-005, CT-SEC-001, CT-ADM-013 |
| Un user ne lit pas les entrées d'un autre | CT-JRN-009, CT-JRN-010, CT-SEC-006 |
| Les admins ne voient pas les notes en clair | CT-SEC-001, CT-ADM-013 |
| La PWA est installable | Vérification du manifest et du service worker |
| Un admin peut bannir un user | CT-ADM-005, CT-ADM-006 |
| Un admin ne peut pas se ban lui-même | CT-ADM-007 |
| Les statistiques reflètent les entrées du user | CT-STAT-001 à CT-STAT-008 |
| Les articles brouillons restent invisibles | CT-CONS-007, CT-CONS-008 |
| Mot de passe robuste (8+, maj, min, chiffre) | CT-AUTH-013, CT-AUTH-014 |
| Les sessions JWT expirent à 7 jours | CT-AUTH-009, CT-SEC-008 |

---

## 6. Cas de test — AUTH (Authentification)

### CT-AUTH-001 — Inscription nominale

| Champ | Valeur |
|-------|--------|
| **Module** | Authentification |
| **Niveau** | Intégration |
| **Criticité** | Bloquant |
| **Préconditions** | Aucun compte avec l'email cible n'existe en DB |
| **Données** | email=`new@test.com`, password=`Password1`, confirm=`Password1`, prenom=`Jane`, nom=`Doe` |
| **Étapes** | 1. POST `/api/auth/register` avec le body<br/>2. Lire la réponse |
| **Résultat attendu** | • HTTP 200<br/>• `body.success === true`<br/>• `body.token` au format JWT (3 segments séparés par `.`)<br/>• Cookie `session` posé httpOnly + sameSite=lax<br/>• Ligne créée dans `users` avec `role='user'` et `isBanned=false` |
| **Automatisé** | ✅ `tests/integration/auth.test.ts` |

### CT-AUTH-002 — Inscription rejetée pour mot de passe faible

| Champ | Valeur |
|-------|--------|
| **Module** | Authentification |
| **Niveau** | Intégration |
| **Criticité** | Haute |
| **Préconditions** | — |
| **Données** | email=`a@b.co`, password=`short`, confirm=`short` |
| **Étapes** | POST `/api/auth/register` |
| **Résultat attendu** | HTTP 400 + `body.fieldErrors.password` non vide (regex maj/min/chiffre/8 car) |
| **Automatisé** | ✅ |

### CT-AUTH-003 — Inscription rejetée pour email déjà utilisé

| Champ | Valeur |
|-------|--------|
| **Module** | Authentification |
| **Niveau** | Intégration |
| **Criticité** | Haute |
| **Préconditions** | Un user `dup@test.com` existe |
| **Étapes** | POST `/api/auth/register` avec ce même email |
| **Résultat attendu** | HTTP 409 + `body.error` contient « existe déjà » |
| **Automatisé** | ✅ |

### CT-AUTH-004 — Connexion nominale

| Champ | Valeur |
|-------|--------|
| **Module** | Authentification |
| **Niveau** | Intégration |
| **Criticité** | Bloquant |
| **Préconditions** | Compte `log@test.com / Password123` actif |
| **Étapes** | POST `/api/auth/login` |
| **Résultat attendu** | HTTP 200 + token JWT + cookie session posé |
| **Automatisé** | ✅ |

### CT-AUTH-005 — Connexion refusée — mauvais mot de passe

| Champ | Valeur |
|-------|--------|
| **Criticité** | Bloquant |
| **Étapes** | POST `/api/auth/login` avec mauvais mot de passe |
| **Résultat attendu** | HTTP 401 + body.error « Email ou mot de passe incorrect » (message identique pour email inconnu, **anti-énumération**) |
| **Automatisé** | ✅ |

### CT-AUTH-006 — Connexion refusée — email inconnu

| Criticité | Bloquant |
|-----------|----------|
| **Étapes** | POST `/api/auth/login` avec email jamais inscrit |
| **Résultat attendu** | HTTP 401 + même message qu'au CT-AUTH-005 |
| **Automatisé** | ✅ |

### CT-AUTH-007 — Connexion refusée — compte banni

| Criticité | Haute |
|-----------|-------|
| **Préconditions** | `banned@test.com` avec `isBanned=true` |
| **Étapes** | POST `/api/auth/login` |
| **Résultat attendu** | HTTP 403 + body.error contient « suspendu » |
| **Automatisé** | ✅ |

### CT-AUTH-008 — `/api/auth/me` sans authentification

| Criticité | Moyenne |
|-----------|---------|
| **Étapes** | GET `/api/auth/me` sans cookie ni Bearer |
| **Résultat attendu** | HTTP 200 + body = `null` |
| **Automatisé** | ✅ |

### CT-AUTH-010 — `/api/auth/me` avec Bearer altéré

| Criticité | Bloquant |
|-----------|----------|
| **Étapes** | GET `/api/auth/me` avec un JWT dont la signature est modifiée |
| **Résultat attendu** | HTTP 200 + body = `null` (jose rejette silencieusement) |
| **Automatisé** | ✅ |

### CT-AUTH-011 — Logout web

| Criticité | Haute |
|-----------|-------|
| **Préconditions** | Cookie session présent |
| **Étapes** | POST `/api/auth/logout` |
| **Résultat attendu** | HTTP 200 + Set-Cookie supprimant `session` |
| **Automatisé** | ✅ |

### CT-AUTH-013 — Mot de passe sans majuscule

| Criticité | Haute |
|-----------|-------|
| **Étapes** | register avec `password=alllower1` |
| **Résultat attendu** | HTTP 400 + fieldErrors.password |
| **Automatisé** | ✅ |

### CT-AUTH-014 — Mot de passe sans chiffre

| Criticité | Haute |
|-----------|-------|
| **Étapes** | register avec `password=NoDigitsHere` |
| **Résultat attendu** | HTTP 400 |
| **Automatisé** | ✅ |

### CT-AUTH-015 — `confirmPassword` ne correspond pas

| Criticité | Haute |
|-----------|-------|
| **Étapes** | register avec `password=Password1` et `confirmPassword=Password2` |
| **Résultat attendu** | HTTP 400 + fieldErrors.confirmPassword |
| **Automatisé** | ✅ |

---

## 7. Cas de test — JRN (Journal émotionnel)

### CT-JRN-001 — Création d'une entrée minimale (sans note ni tags)

| Criticité | Bloquant |
|-----------|----------|
| **Préconditions** | User authentifié, émotion `id=1` existe |
| **Données** | `{ emotionId: 1, intensity: 5 }` |
| **Étapes** | POST `/api/entries` |
| **Résultat attendu** | HTTP 200 + ligne `entries` créée avec userId, emotionId, intensity, noteEncrypted=null, contextTags=[] |
| **Automatisé** | ✅ |

### CT-JRN-002 — Création d'une entrée complète (note + tags)

| Criticité | Bloquant |
|-----------|----------|
| **Données** | emotionId=1, intensity=7, note="Ma note privée", contextTags=["travail","sommeil"] |
| **Résultat attendu** | • HTTP 200<br/>• En DB : `noteEncrypted` au format `iv:tag:cipher` (pas en clair)<br/>• `contextTags` = tableau des 2 tags |
| **Automatisé** | ✅ |

### CT-JRN-003 — Lecture des entrées (note déchiffrée)

| Criticité | Bloquant |
|-----------|----------|
| **Préconditions** | Suite à CT-JRN-002 |
| **Étapes** | GET `/api/entries` |
| **Résultat attendu** | • HTTP 200<br/>• body[0].note === "Ma note privée" (déchiffré)<br/>• body[0].noteEncrypted === undefined (strippé) |
| **Automatisé** | ✅ |

### CT-JRN-004 — Lecture filtrée par dates

| Criticité | Haute |
|-----------|-------|
| **Étapes** | GET `/api/entries?startDate=...&endDate=...` |
| **Résultat attendu** | Seules les entrées dans la fenêtre sont retournées |
| **Automatisé** | ✅ |

### CT-JRN-005 — Note stockée chiffrée en DB

| Criticité | Bloquant (sécurité) |
|-----------|---------|
| **Étapes** | • Créer entrée avec note "secret"<br/>• Lire `entries.note_encrypted` directement en SQL |
| **Résultat attendu** | • Pas de "secret" en clair<br/>• Format `iv:tag:cipher` (3 parties hex séparées par `:`) |
| **Automatisé** | ✅ via `encryption.test.ts` + `entries.test.ts` |

### CT-JRN-006 — Intensité < 1 rejetée

| Criticité | Haute |
|-----------|-------|
| **Données** | `{ emotionId: 1, intensity: 0 }` |
| **Résultat attendu** | HTTP 400 + fieldErrors.intensity |
| **Automatisé** | ✅ |

### CT-JRN-007 — Intensité > 10 rejetée

| Criticité | Haute |
|-----------|-------|
| **Données** | `{ emotionId: 1, intensity: 99 }` |
| **Résultat attendu** | HTTP 400 |
| **Automatisé** | ✅ |

### CT-JRN-008 — Note > 2000 caractères rejetée

| Criticité | Moyenne |
|-----------|---------|
| **Données** | note = "x".repeat(2001) |
| **Résultat attendu** | HTTP 400 + fieldErrors.note |
| **Automatisé** | ✅ |

### CT-JRN-009 — Ownership : un user ne voit pas les entrées d'un autre

| Criticité | Bloquant (sécurité) |
|-----------|---------|
| **Préconditions** | userA a 1 entrée, userB authentifié |
| **Étapes** | GET `/api/entries` avec token de userB |
| **Résultat attendu** | body = [] (pas d'entrée de userA) |
| **Automatisé** | ✅ |

### CT-JRN-010 — Ownership : GET d'une entrée d'un autre user → 404

| Criticité | Bloquant (sécurité) |
|-----------|---------|
| **Étapes** | GET `/api/entries/[idDeUserA]` avec token de userB |
| **Résultat attendu** | HTTP 404 (pas 403, pour ne pas révéler l'existence) |
| **Automatisé** | ✅ |

### CT-JRN-011 — Édition d'une entrée

| Criticité | Haute |
|-----------|-------|
| **Étapes** | PUT `/api/entries/[id]` avec nouvelles valeurs |
| **Résultat attendu** | HTTP 200 + entrée modifiée + `noteEncrypted` ré-encrypté |
| **Automatisé** | ✅ |

### CT-JRN-012 — Édition d'une entrée d'un autre user → 404

| Criticité | Bloquant (sécurité) |
|-----------|---------|
| **Étapes** | PUT `/api/entries/[idDeUserA]` avec token de userB |
| **Résultat attendu** | HTTP 404, aucune modification en DB |
| **Automatisé** | ✅ |

### CT-JRN-013 — Suppression d'une entrée

| Criticité | Haute |
|-----------|-------|
| **Étapes** | DELETE `/api/entries/[id]` |
| **Résultat attendu** | HTTP 200 + ligne supprimée |
| **Automatisé** | ✅ |

### CT-JRN-014 — Suppression idempotente (entrée déjà supprimée)

| Criticité | Basse |
|-----------|-------|
| **Étapes** | DELETE 2 fois la même entrée |
| **Résultat attendu** | Les 2 retournent 200 (clause WHERE userId = session) |
| **Automatisé** | Optionnel |

### CT-JRN-015 — Création requiert authentification

| Criticité | Bloquant |
|-----------|----------|
| **Étapes** | POST `/api/entries` sans token ni cookie |
| **Résultat attendu** | HTTP 401 |
| **Automatisé** | ✅ |

### CT-JRN-016 — emotionId inexistant rejeté

| Criticité | Moyenne |
|-----------|---------|
| **Données** | `{ emotionId: 99999, intensity: 5 }` |
| **Résultat attendu** | HTTP 500 (FK violation) ou 400 si validation amont |
| **Automatisé** | À ajouter |

### CT-JRN-017 — Web : ajout d'émotion via flow guidé

| Criticité | Bloquant |
|-----------|----------|
| **Niveau** | E2E |
| **Étapes** | • Login<br/>• Cliquer "Ajouter une émotion"<br/>• Choisir catégorie → émotion<br/>• Régler intensité<br/>• Saisir note<br/>• Enregistrer |
| **Résultat attendu** | • Toast de succès<br/>• Carte "Météo du jour" mise à jour<br/>• Liste "Entrées récentes" affiche la nouvelle entrée |
| **Automatisé** | Manuel + `e2e/journal.spec.ts` partiel |

### CT-JRN-018 — Web : édition depuis le calendrier

| Criticité | Haute |
|-----------|-------|
| **Niveau** | Manuel |
| **Étapes** | Dashboard → Journal → cliquer sur une date → modifier intensité → sauver |
| **Résultat attendu** | Mise à jour reflétée immédiatement |
| **Automatisé** | Non |

## 8. Cas de test — STAT (Statistiques)

### CT-STAT-001 — Stats vides (0 entrée)

| Criticité | Moyenne |
|-----------|---------|
| **Préconditions** | User sans entrée |
| **Étapes** | GET `/api/entries/stats` |
| **Résultat attendu** | totalEntries=0, dailyAverages=[], recentEntries=[] (pas d'erreur) |
| **Automatisé** | À ajouter |

### CT-STAT-002 — Stats nominales sur 30 jours

| Criticité | Haute |
|-----------|-------|
| **Préconditions** | 3 entrées dans les 30 jours |
| **Étapes** | GET `/api/entries/stats` |
| **Résultat attendu** | totalEntries=3, dailyAverages avec moyenne par jour |
| **Automatisé** | ✅ |

### CT-STAT-003 — detailed-stats sans bornes → 400

| Criticité | Moyenne |
|-----------|---------|
| **Étapes** | GET `/api/entries/detailed-stats` sans paramètres |
| **Résultat attendu** | HTTP 400 |
| **Automatisé** | ✅ |

### CT-STAT-004 — detailed-stats — agrégats complets

| Criticité | Haute |
|-----------|-------|
| **Étapes** | GET `/api/entries/detailed-stats?startDate=...&endDate=...` |
| **Résultat attendu** | • totalEntries, averageIntensity<br/>• mostFrequentEmotion / Category<br/>• emotionDistribution[] et categoryDistribution[]<br/>• dailyAverages[]<br/>• weekdayDistribution[7], hourDistribution[24]<br/>• streakDays<br/>• contextTagsDistribution[] |
| **Automatisé** | ✅ |

### CT-STAT-005 — Streak de jours consécutifs

| Criticité | Moyenne |
|-----------|---------|
| **Préconditions** | 3 entrées sur 3 jours consécutifs, puis trou de 5 jours, puis 2 entrées sur 2 jours |
| **Résultat attendu** | streakDays = 3 (max) |
| **Automatisé** | ✅ `entries.test.ts` vérifie les jours consécutifs et les ruptures |

### CT-STAT-006 — Distribution par jour de la semaine

| Criticité | Moyenne |
|-----------|---------|
| **Étapes** | Créer 5 entrées un lundi |
| **Résultat attendu** | weekdayDistribution[1].count = 5, percentage = 100 |
| **Automatisé** | À ajouter |

### CT-STAT-007 — Web : sélecteur de période

| Criticité | Haute |
|-----------|-------|
| **Niveau** | E2E |
| **Étapes** | `/dashboard/statistiques` → cliquer "Cette semaine" puis "Mois dernier" |
| **Résultat attendu** | Refetch + KPI mis à jour |
| **Automatisé** | Manuel |

## 9. Cas de test — CONS (Conseils / Articles)

### CT-CONS-001 — Liste publique des articles publiés

| Criticité | Haute |
|-----------|-------|
| **Étapes** | GET `/api/articles?publishedOnly=true` |
| **Résultat attendu** | Seuls les articles avec `isPublished=true` |
| **Automatisé** | ✅ |

### CT-CONS-002 — Liste sans filtre (admin)

| Criticité | Moyenne |
|-----------|---------|
| **Étapes** | GET `/api/articles` |
| **Résultat attendu** | Tous les articles (drafts inclus) |
| **Automatisé** | ✅ |

### CT-CONS-003 — Lookup par slug existant

| Criticité | Haute |
|-----------|-------|
| **Étapes** | GET `/api/articles/by-slug/hello` |
| **Résultat attendu** | HTTP 200 + article complet |
| **Automatisé** | ✅ |

### CT-CONS-004 — Lookup par slug inexistant

| Criticité | Moyenne |
|-----------|---------|
| **Étapes** | GET `/api/articles/by-slug/nope` |
| **Résultat attendu** | HTTP 404 |
| **Automatisé** | ✅ |

### CT-CONS-005 — Recherche client par mot-clé

| Criticité | Moyenne |
|-----------|---------|
| **Niveau** | Manuel |
| **Étapes** | `/conseils` → champ recherche → saisir un mot |
| **Résultat attendu** | Liste filtrée (titre + content + excerpt) |
| **Automatisé** | Manuel |

### CT-CONS-006 — Filtre par catégorie

| Criticité | Moyenne |
|-----------|---------|
| **Étapes** | Sélectionner une catégorie dans le filtre |
| **Résultat attendu** | Seuls les articles de cette catégorie |
| **Automatisé** | ✅ Mobile partiel |

### CT-CONS-007 — Brouillon non visible côté public

| Criticité | Bloquant (confidentialité) |
|-----------|---------|
| **Étapes** | • Créer article `isPublished=false`<br/>• GET `/conseils` (liste)<br/>• GET `/conseils/<slug>` direct |
| **Résultat attendu** | • Liste : article absent<br/>• URL directe : redirige vers "Article non trouvé" (vérification client) |
| **Automatisé** | ✅ partiel |

### CT-CONS-008 — Brouillon visible côté admin

| Criticité | Haute |
|-----------|-------|
| **Étapes** | Admin → `/admin/articles` |
| **Résultat attendu** | Brouillons listés avec badge "Brouillon" |
| **Automatisé** | Manuel |

### CT-CONS-009 — Article HTML rendu correctement

| Criticité | Haute |
|-----------|-------|
| **Niveau** | Manuel |
| **Étapes** | Lire un article avec `<h1>`, `<ul>`, `<a>`, `<strong>` |
| **Automatisé** | Manuel |

### CT-CONS-010 — Web : navigation depuis article

| Criticité | Basse |
|-----------|-------|
| **Étapes** | Article → "Retour aux conseils" |
| **Résultat attendu** | Retour à la liste |
| **Automatisé** | Manuel |

---

## 10. Cas de test — ADM (Administration)

### CT-ADM-001 — Accès `/admin` sans connexion

| Criticité | Bloquant |
|-----------|----------|
| **Étapes** | GET `/admin` |
| **Résultat attendu** | Redirect 307 vers `/login` |
| **Automatisé** | ✅ Playwright |

### CT-ADM-002 — Accès `/admin` en tant que user simple

| Criticité | Bloquant (sécurité) |
|-----------|---------|
| **Préconditions** | Authentifié role=user |
| **Étapes** | GET `/admin` |
| **Résultat attendu** | Redirect vers `/dashboard` |
| **Automatisé** | ✅ `admin.test.ts` vérifie la promotion et la rétrogradation |

### CT-ADM-003 — Tableau de bord admin

| Criticité | Haute |
|-----------|-------|
| **Étapes** | Admin login → `/admin` |
| **Résultat attendu** | KPI affichés : totalUsers, newUsersThisWeek, totalArticles, bannedUsers |
| **Automatisé** | Manuel + `admin.test.ts` couvre l'API |

### CT-ADM-004 — Liste utilisateurs

| Criticité | Haute |
|-----------|-------|
| **Étapes** | GET `/api/admin/users` (admin) |
| **Résultat attendu** | Liste sans `passwordHash` |
| **Automatisé** | ✅ |

### CT-ADM-005 — Bannir un user

| Criticité | Haute |
|-----------|-------|
| **Étapes** | PATCH `/api/admin/users/[id]` body `{action:"toggleBan"}` |
| **Résultat attendu** | HTTP 200 + `isBanned=true` |
| **Automatisé** | ✅ |

### CT-ADM-006 — Le user banni ne peut plus se connecter

| Criticité | Bloquant |
|-----------|----------|
| **Préconditions** | Suite à CT-ADM-005 |
| **Étapes** | POST `/api/auth/login` avec ce user |
| **Résultat attendu** | HTTP 403 |
| **Automatisé** | ✅ (couvert par CT-AUTH-007) |

### CT-ADM-007 — Refus de l'auto-modification

| Criticité | Haute (sécurité) |
|-----------|---------|
| **Étapes** | PATCH `/api/admin/users/[idAdminConnecté]` |
| **Résultat attendu** | HTTP 400 + body.error « propre compte » |
| **Automatisé** | ✅ |

### CT-ADM-008 — Refus de bannir un autre admin

| Criticité | Haute |
|-----------|-------|
| **Étapes** | PATCH avec target=autre admin, action=toggleBan |
| **Résultat attendu** | HTTP 400 |
| **Automatisé** | ✅ |

### CT-ADM-009 — Promotion d'un user en admin

| Criticité | Haute |
|-----------|-------|
| **Étapes** | PATCH avec action=toggleRole |
| **Résultat attendu** | HTTP 200 + `role='admin'` |
| **Automatisé** | ✅ `admin.test.ts` vérifie la promotion et la rétrogradation |

### CT-ADM-010 — Suppression d'un user

| Criticité | Haute |
|-----------|-------|
| **Étapes** | DELETE `/api/admin/users/[id]` (target = user) |
| **Résultat attendu** | HTTP 200 + user supprimé + cascade sur entries |
| **Automatisé** | ✅ `admin.test.ts` vérifie la suppression d'un utilisateur |

### CT-ADM-011 — Refus de suppression d'un admin

| Criticité | Haute |
|-----------|-------|
| **Étapes** | DELETE sur autre admin |
| **Résultat attendu** | HTTP 400 |
| **Automatisé** | ✅ |

### CT-ADM-012 — CRUD article admin

| Criticité | Haute |
|-----------|-------|
| **Étapes** | • POST `/api/articles` (admin)<br/>• PUT<br/>• DELETE |
| **Résultat attendu** | Cycle complet OK + slug unique enforced (409 sinon) |
| **Automatisé** | ✅ `articles.test.ts` + `articles-crud.test.ts` couvrent l'API |

### CT-ADM-013 — Notes user invisibles côté admin

| Criticité | Bloquant (RGPD) |
|-----------|---------|
| **Étapes** | • User crée entrée avec note "secret"<br/>• Admin tente d'accéder à cette entrée par n'importe quel moyen |
| **Résultat attendu** | • Aucune route API admin ne retourne `noteEncrypted` ni la note en clair<br/>• La page `/admin/users` affiche un avertissement |
| **Automatisé** | Validé par absence d'endpoint + CT-JRN-009/010 |

### CT-ADM-014 — Création catégorie d'émotion

| Criticité | Moyenne |
|-----------|---------|
| **Étapes** | POST `/api/emotions/categories` (admin) |
| **Résultat attendu** | HTTP 200 + ligne créée |
| **Automatisé** | ✅ `emotions.test.ts` vérifie la création |

### CT-ADM-015 — Modification catégorie

| Criticité | Moyenne |
|-----------|---------|
| **Étapes** | PUT `/api/emotions/categories/[id]` |
| **Automatisé** | ✅ `emotions-crud.test.ts` vérifie la modification |

### CT-ADM-016 — Suppression catégorie cascade émotions

| Criticité | Moyenne |
|-----------|---------|
| **Étapes** | DELETE `/api/emotions/categories/[id]` |
| **Résultat attendu** | Cascade ON DELETE supprime les émotions liées |
| **Automatisé** | Partiel : `emotions-crud.test.ts` vérifie la suppression de la catégorie, pas explicitement la cascade |

### CT-ADM-017 — Validation regex couleur hexa

| Criticité | Basse |
|-----------|-------|
| **Données** | colorHex=`pas-une-couleur` |
| **Résultat attendu** | HTTP 400 |
| **Automatisé** | ✅ `emotions.test.ts` et `emotions-crud.test.ts` vérifient la validation |

### CT-ADM-018 — Validation slug article unique

| Criticité | Haute |
|-----------|-------|
| **Étapes** | Créer 2 articles avec le même slug |
| **Résultat attendu** | 2e tentative → HTTP 409 |
| **Automatisé** | ✅ `articles.test.ts` et `articles-crud.test.ts` vérifient les conflits de slug |

---

## 12. Cas de test — SEC (Sécurité)

### CT-SEC-001 — Notes utilisateur chiffrées au repos

| Criticité | Bloquant (RGPD) |
|-----------|---------|
| **Étapes** | • Inspecter `entries.note_encrypted` directement<br/>• Vérifier l'absence de la note en clair |
| **Résultat attendu** | Format AES-256-GCM `iv:tag:cipher` |
| **Automatisé** | ✅ |

### CT-SEC-002 — Mots de passe non stockés en clair

| Criticité | Bloquant |
|-----------|----------|
| **Étapes** | SELECT password_hash FROM users |
| **Résultat attendu** | Format `salt:hash` hex (scrypt), pas le mot de passe |
| **Automatisé** | ✅ |

### CT-SEC-003 — Brute-force timing attack

| Criticité | Haute |
|-----------|-------|
| **Étapes** | Mesurer le temps de réponse pour : email valide / mauvais mdp vs email inconnu |
| **Résultat attendu** | Diff < 50ms (timingSafeEqual + lookup similaires) |
| **Automatisé** | Manuel |

### CT-SEC-004 — JWT signature altérée

| Criticité | Bloquant |
|-----------|----------|
| **Étapes** | Modifier la signature d'un token, l'envoyer |
| **Résultat attendu** | session = null, requête refusée |
| **Automatisé** | ✅ CT-AUTH-010 |

### CT-SEC-005 — JWT payload modifié (élévation de privilège)

| Criticité | Bloquant |
|-----------|----------|
| **Étapes** | Tenter de modifier le payload pour passer role=admin sans re-signer |
| **Résultat attendu** | Vérification HMAC échoue → null |
| **Automatisé** | ✅ par jose |

### CT-SEC-006 — IDOR (lecture entrée d'un autre user)

| Criticité | Bloquant |
|-----------|----------|
| **Étapes** | GET `/api/entries/<uuid-de-userA>` avec token userB |
| **Résultat attendu** | HTTP 404 |
| **Automatisé** | ✅ CT-JRN-010 |

### CT-SEC-007 — XSS dans la note (saisie utilisateur)

| Criticité | Haute |
|-----------|-------|
| **Données** | note = `<script>alert(1)</script>` |
| **Résultat attendu** | • Web : note affichée en texte brut (pas d'exécution)<br/>• Mobile : idem (Text component) |
| **Automatisé** | Manuel |

### CT-SEC-008 — XSS dans le contenu d'un article (admin)

| Criticité | Haute |
|-----------|-------|
| **Risque** | L'admin entre du HTML rendu via `dangerouslySetInnerHTML` |
| **Mitigation** | TipTap utilisé (sanitize amont), revue admin |
| **Résultat attendu** | À risque par design — la confiance est placée sur le compte admin. À documenter explicitement. |
| **Automatisé** | Non |

### CT-SEC-009 — SQL injection

| Criticité | Bloquant |
|-----------|----------|
| **Étapes** | Soumettre `email='; DROP TABLE users;--` |
| **Résultat attendu** | Drizzle utilise des requêtes paramétrées, aucune exécution |
| **Automatisé** | Manuel + couvert par les tests intégration |

### CT-SEC-010 — CSRF (Cross-Site Request Forgery)

| Criticité | Haute |
|-----------|-------|
| **Étapes** | Cookie `sameSite=lax` configuré dans `createSession` |
| **Résultat attendu** | Les requêtes cross-site n'envoient pas le cookie automatiquement |
| **Automatisé** | Couvert par lecture du code |

### CT-SEC-011 — Headers de sécurité

| Criticité | Moyenne |
|-----------|---------|
| **Étapes** | Inspecter les headers de réponse |
| **Résultat attendu** | À auditer : CSP, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security (à compléter en production) |
| **Automatisé** | Manuel — non implémenté actuellement |

### CT-SEC-012 — Brute-force login (rate limiting)

| Criticité | Haute |
|-----------|-------|
| **Risque** | Pas de rate limiter actuellement → backlog |
| **Résultat attendu** | À implémenter (Upstash Ratelimit, middleware) |
| **Automatisé** | Non — anomalie connue |

---

## 13. Plan de régression

À exécuter **avant chaque release**, sur l'environnement de recette.

### 13.1 Régression critique (~25 min)

| ID | Description |
|----|-------------|
| CT-AUTH-001 | Inscription nominale |
| CT-AUTH-004 | Login nominal |
| CT-AUTH-007 | Login refusé compte banni |
| CT-JRN-002 | Création entrée avec note |
| CT-JRN-003 | Lecture déchiffrée |
| CT-JRN-005 | Note chiffrée en DB |
| CT-JRN-009 | Ownership lecture |
| CT-JRN-010 | Ownership lecture par ID |
| CT-STAT-002 | Stats 30j |
| CT-CONS-007 | Brouillon non visible |
| CT-ADM-001 | Accès admin sans connexion |
| CT-ADM-002 | Accès admin user simple |
| CT-ADM-007 | Refus auto-modif |
| CT-ADM-013 | Notes invisibles admin |
| CT-MOB-001 | Persistance session |
| CT-MOB-002 | Token effacé logout |
| CT-SEC-006 | IDOR refusé |

### 13.2 Régression complète

L'intégralité des 90+ cas — exécutée 1× par mois ou avant une release majeure.

---

## Annexe A — Modèle de fiche d'anomalie

```
ID anomalie       : ANO-2026-XXX
Date              : 2026-MM-JJ
Détecté par       : <nom>
Environnement     : Local / Recette / Prod
Cas de test       : CT-XXX-YYY
Sévérité          : Bloquante / Majeure / Mineure / Cosmétique
Statut            : Ouvert / En cours / Corrigé / Vérifié / Fermé
Module            : AUTH / JRN / STAT / CONS / ADM / MOB / SEC

Description :
  <description courte>

Étapes pour reproduire :
  1. ...
  2. ...

Résultat observé :
  ...

Résultat attendu :
  ...

Capture / Logs :
  <pièce jointe>

Versions :
  Web build :    <git sha>
  DB migration : <ID dernière migration>

Affecté à        : <développeur>
Correction       : <PR / commit>
Test de NR       : <CT à ajouter / modifier>
```

---

## Annexe B — Classification des anomalies

| Sévérité | Critères | Exemple | Délai correctif |
|----------|----------|---------|----------------|
| **Bloquante** | Empêche l'utilisation OU compromet la sécurité OU perte de données | Login impossible, IDOR, leak de données | Hot-fix < 24 h |
| **Majeure** | Fonctionnalité importante dégradée | Stats fausses, ban contournable, crash récurrent | Avant release |
| **Mineure** | Gêne mineure, contournement existe | Filtre articles bug, message erreur peu clair | Version + 1 |
| **Cosmétique** | Visuel, libellé, animation | Typo, couleur off, animation saccadée | Backlog |

### Décision de mise en production

| Bloquantes ouvertes | Majeures ouvertes | Décision |
|--------------------|-------------------|----------|
| 0 | 0 | ✅ Go production |
| 0 | ≤ 2 documentées | ⚠ Go avec réserves (PV signé) |
| 0 | > 2 | ❌ No-go, correctifs requis |
| ≥ 1 | * | ❌ No-go absolu |

---

*Cahier de tests v1.0 — dernière vérification documentaire le 2026-08-13.*
