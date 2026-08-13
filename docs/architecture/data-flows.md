# Architecture et flux de données de CESIZen

> Référence exhaustive des flux de données de l'application :
> **PWA Next.js** · **API REST**.
>
> La PWA utilise le même backend Next.js `/api/*` et la même base PostgreSQL.

---

## Sommaire

1. [Architecture globale](#1-architecture-globale)
2. [Stack technique](#2-stack-technique)
3. [Modèle de données (PostgreSQL / Drizzle)](#3-modèle-de-données-postgresql--drizzle)
4. [Flux d'authentification — vue transversale](#4-flux-dauthentification--vue-transversale)
5. [Flux Web (Next.js App Router)](#5-flux-web-nextjs-app-router)
6. [Flux REST API (`/app/api/*`)](#6-flux-rest-api-appapi)
8. [Flux transversaux](#8-flux-transversaux)
9. [Tableau de référence des endpoints](#9-tableau-de-référence-des-endpoints)
10. [Matrice écran → endpoints](#10-matrice-écran--endpoints)

---

## 1. Architecture globale

```\nPWA Next.js -> Route Handlers Next.js -> PostgreSQL\n```\n
- **Source de vérité unique** : la base PostgreSQL.
- **Surface API unique** : `/app/api/**/route.ts` est consommée par la PWA via des requêtes relatives.
- **Deux modes d'authentification** acceptés simultanément par chaque endpoint protégé :
  - Cookie `session` (web — `httpOnly`, `sameSite: lax`).

---

## 2. Stack technique

|--------|-----|--------|-----|
| Langage | TypeScript 6 | TypeScript 5.9 | TypeScript 6 |
| ORM | — | — | Drizzle ORM 0.45 |
| DB | — | — | PostgreSQL via `pg` Pool |
| Validation | Zod (côté serveur) | Vérifs UI minimales | Zod |
| Chiffrement notes | — | — | `crypto` AES-256-GCM |
| Hash mot de passe | — | — | `crypto` scrypt + salt |

---

## 3. Modèle de données (PostgreSQL / Drizzle)

Source : `lib/db/schema.ts`.

```
users (uuid)
  ├── entries (uuid)            ← FK userId, FK emotionId
  └── articles (uuid)           ← FK authorId

emotion_categories (serial)
  └── emotions (serial)         ← FK categoryId
        └── entries.emotionId

article_categories (serial)
  └── articles.categoryId
```

| Table | Champs clés | Sensibilité |
|-------|-------------|-------------|
| `users` | `id (uuid)`, `email` (unique), `passwordHash` (scrypt:salt), `nom`, `prenom`, `role` (`user`/`admin`), `isBanned` | Mot de passe **haché** (jamais renvoyé par l'API) |
| `emotion_categories` | `id`, `label` (unique), `colorHex`, `iconName` | Public |
| `emotions` | `id`, `label`, `categoryId` (FK cascade), `colorHex?`, `iconName?` | Public |
| `entries` | `id (uuid)`, `userId` (FK cascade), `emotionId`, `intensity` (1-10), **`noteEncrypted`** (AES-256-GCM), `contextTags[]`, `createdAt` | **Notes chiffrées au repos** |
| `article_categories` | `id`, `label` (unique), `slug` (unique), `colorHex` | Public |
| `articles` | `id (uuid)`, `title`, `slug` (unique), `content` (HTML), `excerpt`, `coverImage`, `categoryId`, `authorId`, `isPublished`, `createdAt`, `updatedAt` | Public si publié |

> **Particularité sécurité** : `entries.noteEncrypted` est chiffré côté serveur via `lib/security/encryption.ts` (AES-256-GCM, IV aléatoire 16 octets, format `iv:authTag:encrypted` en hex). La clé `ENCRYPTION_KEY` n'est jamais exposée au client. Les notes sont **déchiffrées uniquement à la lecture** par le propriétaire.

---

## 4. Flux d'authentification — vue transversale

### 4.1 Création de session (login / register)

```
Client                       /api/auth/login (POST)
──────                       ──────────────────────
{email,password}      ───►   Zod loginSchema.safeParse()
                             db.users.findFirst({email})
                             verifyPassword(scrypt + timingSafeEqual)
                             ✗ → 401  ✗ banni → 403
                             ✓ → createSession(user)
                                 ├─ SignJWT (HS256, exp 7j)
                                 │  payload: {userId,email,role,nom,prenom,expiresAt}
                                 ├─ cookies().set('session', token, {httpOnly, sameSite:lax})
                                 └─ retourne {success:true, token}
                      ◄───   200 + Set-Cookie + body.token
```

- **Web** : ignore `body.token`, le cookie suffit (envoyé automatiquement à chaque fetch relatif).

### 4.2 Lecture de session côté serveur

```ts
// lib/auth/session.ts
getSessionFromRequest(request)
  ├─ Si Authorization: Bearer …  → jwtVerify(token)         (mobile)
  └─ Sinon                       → cookies().get('session') (web)
                                   jwtVerify(token)
```

Tous les endpoints `entries/*` utilisent `getSessionFromRequest` (compatible web + mobile). Les endpoints `articles/*` côté admin et `admin/*` utilisent `getSession()` (cookie uniquement → admin web seulement).

### 4.3 Protection des routes web

- `app/dashboard/layout.tsx` : `getSession()` puis `redirect('/login')` si absente.
- `app/admin/layout.tsx` : `getSession()` + check `role === 'admin'` (sinon `redirect('/dashboard')`).
- `proxy.ts` : convention Next.js 16 montée à la racine, avec un `matcher`
  couvrant `/dashboard/:path*` et `/admin/:path*`.
- Les layouts répètent volontairement les contrôles côté serveur : le proxy
  réalise la redirection précoce, tandis que les layouts restent la barrière
  d'autorisation au rendu.

### 4.4 Logout

| Surface | Action |
|---------|--------|
| Web | `POST /api/auth/logout` → `cookies().delete('session')` |

---

## 5. Flux Web (Next.js App Router)

### 5.1 Pages publiques

#### `/` — Landing (`app/page.tsx`)
- **Server Component** (`force-dynamic`).
- Lit `getSession()` côté serveur pour conditionner les CTA Hero.
- Pas d'appel API client.

#### `/login`, `/register` — Authentification
- **Client Components**.
- Soumission : `fetch('/api/auth/login' | '/api/auth/register', POST JSON)`.
- Sur succès → `router.push('/dashboard')`.
- Sur erreur : affichage de `result.error` et `result.fieldErrors` (provenant de Zod côté serveur).

#### `/conseils` — Liste publique d'articles (`app/conseils/page.tsx`)
- **Client Component**, charge en parallèle au montage :
  - `GET /api/auth/me` → état utilisateur (header).
  - `GET /api/articles?publishedOnly=true` → liste publiée.
  - `GET /api/articles/categories` → filtres.
- Filtrage / tri / recherche **uniquement côté client** (`useMemo` sur le tableau).

#### `/conseils/[slug]` — Article public
- Client Component.
- `useParams().slug` → fetch parallèle :
  - `GET /api/auth/me`
  - `GET /api/articles/by-slug/[slug]`
- Refus client si `!article.isPublished` (sécurité de défense en profondeur — un brouillon resté accessible par URL serait masqué).
- Contenu HTML rendu via `dangerouslySetInnerHTML`.

### 5.2 Espace utilisateur (`/dashboard/*`)

> Layout serveur protégé : `getSession()` puis redirect si absente.

#### `/dashboard` — Tableau de bord
- Client Component, **fetch parallèle au mount** (`Promise.all`) :
  - `GET /api/auth/me` → prénom pour le greeting.
  - `GET /api/emotions` → liste pour le formulaire d'ajout.
  - `GET /api/entries/stats` → stats 30 jours pour les KPI et le graphe.
  - `GET /api/entries?startDate=…&endDate=…` (jour courant) → détection "entrée déjà saisie aujourd'hui".
- Ajout d'une émotion : `<EmotionForm>` → `POST /api/entries` puis `onSuccess()` rappelle `fetchData()` (refresh local).

#### `/dashboard/journal` — Calendrier émotionnel
- Fetch parallèle : `GET /api/entries` (toutes les entrées, sans filtre date) + `GET /api/emotions`.
- `<JournalCalendar>` permet de cliquer sur une date → ouvre `<EditEntryDialog>` :
  - **Update** : `PUT /api/entries/[id]` (Zod côté serveur, ré-encrypte la note).
  - **Delete** : `DELETE /api/entries/[id]`.

#### `/dashboard/statistiques` — Stats avancées
- Sélecteur de période (presets ou date pickers).
- À chaque changement : `GET /api/entries/detailed-stats?startDate=…&endDate=…`.
- Le serveur calcule **tout** (distribution émotion/catégorie, weekday, hour, streak, tags). Le client n'affiche que.

#### `/dashboard/profil` — Profil
- **Server Component** : lit `getSession()` directement (pas d'appel API).
- Bouton logout → `POST /api/auth/logout`.

### 5.3 Espace admin (`/admin/*`)

> Layout serveur : `getSession()` + check `role === 'admin'`.

| Route | Fetch initial | Mutations |
|-------|---------------|-----------|
| `/admin` | `GET /api/admin/stats` | — |
| `/admin/articles` | `GET /api/articles` (tous, publiés + brouillons — autorisé car endpoint public) | `DELETE /api/articles/[id]` |
| `/admin/articles/new` | `GET /api/articles/categories` | `POST /api/articles` |
| `/admin/articles/[id]` | `GET /api/articles/[id]` + `GET /api/articles/categories` | `PUT /api/articles/[id]` |
| `/admin/users` | `GET /api/admin/users` | `PATCH /api/admin/users/[id]` (`toggleBan` / `toggleRole`), `DELETE /api/admin/users/[id]` |
| `/admin/emotions` | `GET /api/emotions/categories` (avec émotions imbriquées) | — |
| `/admin/emotions/categories/new` | — | `POST /api/emotions/categories` |
| `/admin/emotions/categories/[id]` | `GET /api/emotions/categories/[id]` | `PUT` / `DELETE /api/emotions/categories/[id]` |
| `/admin/emotions/new` | `GET /api/emotions/categories` | `POST /api/emotions` *(⚠ voir §8.5)* |
| `/admin/emotions/[id]` | `GET /api/emotions/[id]` + `GET /api/emotions/categories` | `PUT` / `DELETE /api/emotions/[id]` |

---

## 6. Flux REST API (`/app/api/*`)

Notation : `🔓` = public · `🔒` = utilisateur authentifié · `👑` = admin uniquement.
Auth method :
- `[bearer|cookie]` = `getSessionFromRequest()` (web + mobile).
- `[cookie-only]` = `getSession()` (cookie uniquement → admin web).

### 6.1 Auth

| Méthode | Path | Auth | Entrée | Traitement | Sortie |
|---------|------|------|--------|------------|--------|
| POST | `/api/auth/register` | 🔓 | `{email,password,confirmPassword,nom?,prenom?}` | Zod `registerSchema` (regex MAJ/min/chiffre, 8+ car., confirm match) → unicité email → `hashPassword` (scrypt:salt) → INSERT users → `createSession` | `{success, token}` + Set-Cookie session |
| POST | `/api/auth/login` | 🔓 | `{email,password}` | Zod → SELECT user → check `isBanned` (403) → `verifyPassword` (`timingSafeEqual`) → `createSession` | `{success, token}` + Set-Cookie session |
| POST | `/api/auth/logout` | 🔓 | — | `deleteSession()` | `{success:true}` |
| GET | `/api/auth/me` | `[bearer\|cookie]` | — | `getSessionFromRequest()` | `SessionPayload \| null` |

### 6.2 Entries (journal émotionnel)

> Toutes ces routes utilisent `getSessionFromRequest` (compat mobile).

| Méthode | Path | Auth | Entrée | Traitement | Sortie |
|---------|------|------|--------|------------|--------|
| GET | `/api/entries` | 🔒 | query `?startDate&endDate` (optionnel) | SELECT entries WHERE userId = session + bornes dates → JOIN emotion → **decryptNote** sur chaque entrée → strip `noteEncrypted` | `Entry[]` avec `note` en clair |
| POST | `/api/entries` | 🔒 | `{emotionId,intensity,note?,contextTags?}` | Zod `entrySchema` (intensité 1-10, note ≤ 2000) → `encryptNote(note)` → INSERT → `revalidatePath('/dashboard')` | `{success:true}` |
| GET | `/api/entries/[id]` | 🔒 | param `id` | SELECT WHERE id AND userId = session → 404 si autre user → JOIN emotion → decryptNote | `Entry` avec `note` |
| PUT | `/api/entries/[id]` | 🔒 | idem POST | Vérifie ownership (404 sinon) → Zod → `encryptNote` → UPDATE → revalidate | `{success:true}` |
| DELETE | `/api/entries/[id]` | 🔒 | param `id` | DELETE WHERE id AND userId = session (idempotent) | `{success:true}` |
| GET | `/api/entries/stats` | 🔒 | — | SELECT entries 30 derniers jours → groupBy date → `dailyAverages`, `recentEntries[-7:]`, `totalEntries` | `StatsData` |
| GET | `/api/entries/detailed-stats` | 🔒 | query `?startDate&endDate` (**requis**) | SELECT bornées → calcule en mémoire : avg intensity, distribution émotion/catégorie, weekday, hour, **streak max**, top tags | `DetailedStats` |

> **Ownership** : chaque clause `WHERE` inclut `eq(entries.userId, session.userId)` — un utilisateur ne peut jamais lire/modifier/supprimer une entrée d'un autre, même par ID forgé.

### 6.3 Emotions (référentiel public + admin)

| Méthode | Path | Auth | Notes |
|---------|------|------|-------|
| GET | `/api/emotions` | 🔓 | Toutes les émotions avec leur `category` imbriquée (alphabétique). |
| GET | `/api/emotions/[id]` | 🔓 | Détail d'une émotion. |
| PUT | `/api/emotions/[id]` | 👑 `[cookie-only]` | Zod `emotionSchema` (label, categoryId, colorHex regex `#RRGGBB`, iconName). `revalidatePath('/admin/emotions','/dashboard')`. |
| DELETE | `/api/emotions/[id]` | 👑 `[cookie-only]` | Suppression dure (les `entries.emotionId` n'ont **pas** de cascade — risque de FK violation si l'émotion est référencée). |
| GET | `/api/emotions/categories` | 🔓 | Catégories + leurs émotions imbriquées. |
| POST | `/api/emotions/categories` | 👑 `[cookie-only]` | Zod `categorySchema` (label, colorHex, iconName). |
| GET | `/api/emotions/categories/[id]` | 🔓 | Détail catégorie + émotions. |
| PUT | `/api/emotions/categories/[id]` | 👑 `[cookie-only]` | UPDATE. |
| DELETE | `/api/emotions/categories/[id]` | 👑 `[cookie-only]` | DELETE — déclenche un `ON DELETE CASCADE` sur `emotions` (schéma : `references(..., { onDelete: 'cascade' })`). |

### 6.4 Articles (CMS)

| Méthode | Path | Auth | Notes |
|---------|------|------|-------|
| GET | `/api/articles` | 🔓 | Si `?publishedOnly=true` → seulement publiés. Sinon **tous** (utilisé par `/admin/articles`). Inclut `author` (sans `passwordHash`) + `category`. |
| POST | `/api/articles` | 👑 `[cookie-only]` | Zod `articleSchema` (slug regex `/^[a-z0-9-]+$/`) → vérifie unicité slug → INSERT avec `authorId = session.userId` → revalidate `/admin/articles`,`/conseils`. |
| GET | `/api/articles/[id]` | 🔓 | Avec `author` (colonnes filtrées). |
| PUT | `/api/articles/[id]` | 👑 `[cookie-only]` | Vérifie unicité slug (sauf identique) → UPDATE → revalidate `/admin/articles`,`/conseils`,`/conseils/[slug]`. |
| DELETE | `/api/articles/[id]` | 👑 `[cookie-only]` | DELETE. |
| GET | `/api/articles/by-slug/[slug]` | 🔓 | Lookup par slug (utilisé par `/conseils/[slug]` et le mobile). |
| GET | `/api/articles/categories` | 🔓 | Liste alphabétique des catégories d'articles. |

### 6.5 Admin (gestion globale)

| Méthode | Path | Auth | Notes |
|---------|------|------|-------|
| GET | `/api/admin/stats` | 👑 `[cookie-only]` | `totalUsers`, `bannedUsers`, `admins`, `newUsersThisWeek`, `totalArticles`, `publishedArticles`. |
| GET | `/api/admin/users` | 👑 `[cookie-only]` | Liste users (sans `passwordHash`). |
| PATCH | `/api/admin/users/[id]` | 👑 `[cookie-only]` | `{action: 'toggleBan' \| 'toggleRole'}`. **Refus** si `id === session.userId` (auto-modif), **refus** de bannir un admin. |
| DELETE | `/api/admin/users/[id]` | 👑 `[cookie-only]` | **Refus** si self ou si cible est admin. CASCADE supprime entries/articles. |

### 6.6 Tableau d'erreurs typiques

| Code | Cas |
|------|-----|
| 400 | Zod `Validation échouée` (`fieldErrors`), paramètres requis manquants (detailed-stats), action invalide |
| 401 | `Non authentifié` — session absente ou JWT invalide ; login échoué (`Email ou mot de passe incorrect`) |
| 403 | `Non autorisé` (rôle insuffisant) ; compte banni au login |
| 404 | Ressource non trouvée OU appartenant à un autre utilisateur (entries) |
| 409 | Email déjà pris (`/auth/register`), slug déjà pris (`/articles`) |
| 500 | Erreur serveur (loggée `console.error`, message générique) |

---

## 8. Flux transversaux

### 8.1 Validation Zod

Définie dans `lib/validation/schemas.ts` (web/api) et appliquée **côté serveur** systématiquement :
- `registerSchema` (regex maj/min/chiffre, ≥8 car., refine confirm).
- `loginSchema`.
- `entrySchema` (intensity 1-10, note ≤ 2000).
- `articleSchema` (slug `^[a-z0-9-]+$`).
- Schémas locaux dans les routes emotions/categories (regex `#RRGGBB`).

Les retours d'erreur 400 standardisent :
```json
{ "error": "Validation échouée", "fieldErrors": { "email": ["..."], "password": ["..."] } }
```
→ `fieldErrors` est consommé par les forms web pour l'affichage par champ.

### 8.2 Chiffrement des notes (`lib/security/encryption.ts`)

- Algorithme : AES-256-GCM, clé hex 32 octets via `ENCRYPTION_KEY` (env).
- IV aléatoire 16 octets / message.
- Format stocké : `iv:authTag:cipherHex`.
- **`encryptNote()`** appelé dans `POST /api/entries` et `PUT /api/entries/[id]`.
- **`decryptNote()`** appelé dans `GET /api/entries`, `GET /api/entries/[id]`. Jamais exposé aux endpoints admin → un admin ne peut techniquement pas lire les notes (rappelé dans la UI `/admin`).

### 8.3 Hash de mot de passe (`lib/auth/password.ts`)

- `scryptSync(password, salt, 64)` avec `salt = randomBytes(16).toString('hex')`.
- Stockage `salt:hash` (hex).
- Vérification : `timingSafeEqual` pour éviter les attaques temporelles.
- Note : `bcryptjs` est listé dans `package.json` mais n'est pas utilisé — l'implémentation actuelle est scrypt natif Node.

### 8.4 Cache & invalidation

| Mécanisme | Usage |
|-----------|-------|
| `revalidatePath('/dashboard')` | Après création/édition/suppression d'entries |
| `revalidatePath('/admin/articles','/conseils','/conseils/[slug]')` | Après mutation d'article |
| `revalidatePath('/admin/emotions','/dashboard')` | Après mutation d'émotion ou catégorie |
| `revalidatePath('/admin/users')` | Après ban/promote/delete user |
| TanStack Query `invalidateQueries` | Côté mobile après mutation |

### 8.5 Anomalies / points d'attention identifiés

| # | Localisation | Observation |
|---|--------------|-------------|
| 1 | `app/api/emotions/route.ts` | **Pas de handler `POST`** — pourtant `components/admin/emotion-form.tsx:51` poste vers `/api/emotions` lors d'une création. Une création d'émotion via l'UI admin retourne 405. |
| 2 | `app/api/emotions/[id]/route.ts` `DELETE` | Pas de cascade définie sur `entries.emotionId` → `DELETE` bloqué par FK si l'émotion est utilisée. |
| 4 | `app/api/articles/route.ts` `GET` | Sans `publishedOnly=true`, retourne **tous** les articles (brouillons inclus) à un appel non authentifié. Acceptable si admin uniquement consomme cette variante, mais aucun garde-fou serveur. |

---

## 9. Tableau de référence des endpoints

Légende auth : `🔓` public · `🔒` user · `👑` admin (cookie web seulement) · `🔑` user (cookie ou bearer mobile).

| # | Méthode | Endpoint | Auth | Web consommé par | Mobile consommé par |
|---|---------|----------|------|------------------|---------------------|
| 1 | POST | `/api/auth/register` | 🔓 | `/register` | `(auth)/register` |
| 2 | POST | `/api/auth/login` | 🔓 | `/login` | `(auth)/login` |
| 3 | POST | `/api/auth/logout` | 🔓 | Header dropdown | `(app)/profil` |
| 4 | GET | `/api/auth/me` | 🔑 | `/dashboard`, `/conseils`, `/conseils/[slug]` | `AuthContext.initAuth/login/register` |
| 5 | GET | `/api/entries` | 🔑 | `/dashboard` (jour), `/dashboard/journal` | `(app)/journal`, `(app)/journal/[id]` |
| 6 | POST | `/api/entries` | 🔑 | `<EmotionForm>` (dashboard) | `(app)/journal/new` |
| 7 | GET | `/api/entries/[id]` | 🔑 | — *(non utilisé)* | — *(non utilisé)* |
| 8 | PUT | `/api/entries/[id]` | 🔑 | `<EditEntryDialog>` | `(app)/journal/[id]` |
| 9 | DELETE | `/api/entries/[id]` | 🔑 | `<EditEntryDialog>` | `(app)/journal/[id]` |
| 10 | GET | `/api/entries/stats` | 🔑 | `/dashboard` | `(app)/index` |
| 11 | GET | `/api/entries/detailed-stats` | 🔑 | `/dashboard/statistiques` | `(app)/statistiques` |
| 12 | GET | `/api/emotions` | 🔓 | `/dashboard`, `/dashboard/journal` | *(non — utilise `/categories`)* |
| 13 | GET | `/api/emotions/[id]` | 🔓 | `/admin/emotions/[id]` | — |
| 14 | PUT | `/api/emotions/[id]` | 👑 | `<EmotionForm>` (admin) | — |
| 15 | DELETE | `/api/emotions/[id]` | 👑 | `<CategoryCard>` (admin) | — |
| 16 | POST | `/api/emotions` | ⚠ *(handler manquant)* | tenté par `<EmotionForm>` create | — |
| 17 | GET | `/api/emotions/categories` | 🔓 | `/admin/emotions`, `/admin/emotions/new` | `(app)/journal/new`, `(app)/journal/[id]` |
| 18 | POST | `/api/emotions/categories` | 👑 | `<CategoryForm>` (admin) | — |
| 19 | GET | `/api/emotions/categories/[id]` | 🔓 | `/admin/emotions/categories/[id]` | — |
| 20 | PUT | `/api/emotions/categories/[id]` | 👑 | `<CategoryForm>` edit | — |
| 21 | DELETE | `/api/emotions/categories/[id]` | 👑 | `<CategoryCard>` delete | — |
| 22 | GET | `/api/articles` | 🔓 | `/admin/articles`, `/conseils` (avec `publishedOnly`) | `(app)/conseils` (avec `publishedOnly`) |
| 23 | POST | `/api/articles` | 👑 | `<ArticleForm>` create | — |
| 24 | GET | `/api/articles/[id]` | 🔓 | `/admin/articles/[id]` | — |
| 25 | PUT | `/api/articles/[id]` | 👑 | `<ArticleForm>` edit | — |
| 26 | DELETE | `/api/articles/[id]` | 👑 | `<DeleteArticleButton>` | — |
| 27 | GET | `/api/articles/by-slug/[slug]` | 🔓 | `/conseils/[slug]` | `(app)/conseils/[slug]` |
| 28 | GET | `/api/articles/categories` | 🔓 | `/conseils`, `/admin/articles/new`, `/admin/articles/[id]` | `(app)/conseils` |
| 29 | GET | `/api/admin/stats` | 👑 | `/admin` | — |
| 30 | GET | `/api/admin/users` | 👑 | `/admin/users` | — |
| 31 | PATCH | `/api/admin/users/[id]` | 👑 | `<BanUserButton>`, `<PromoteUserButton>` | — |
| 32 | DELETE | `/api/admin/users/[id]` | 👑 | `<DeleteUserButton>` | — |

---

## 10. Matrice écran → endpoints

### Web

| Écran | GET au montage | Mutations |
|-------|----------------|-----------|
| `/` | — | — |
| `/login` | — | POST `/api/auth/login` |
| `/register` | — | POST `/api/auth/register` |
| `/conseils` | `/api/auth/me`, `/api/articles?publishedOnly=true`, `/api/articles/categories` | — |
| `/conseils/[slug]` | `/api/auth/me`, `/api/articles/by-slug/[slug]` | — |
| `/dashboard` | `/api/auth/me`, `/api/emotions`, `/api/entries/stats`, `/api/entries?startDate&endDate` | POST `/api/entries` |
| `/dashboard/journal` | `/api/entries`, `/api/emotions` | PUT/DELETE `/api/entries/[id]` |
| `/dashboard/statistiques` | `/api/entries/detailed-stats?...` | — |
| `/dashboard/profil` | *(server: getSession)* | POST `/api/auth/logout` |
| `/admin` | `/api/admin/stats` | — |
| `/admin/users` | `/api/admin/users` | PATCH/DELETE `/api/admin/users/[id]` |
| `/admin/articles` | `/api/articles` | DELETE `/api/articles/[id]` |
| `/admin/articles/new` | `/api/articles/categories` | POST `/api/articles` |
| `/admin/articles/[id]` | `/api/articles/[id]`, `/api/articles/categories` | PUT `/api/articles/[id]` |
| `/admin/emotions` | `/api/emotions/categories` | DELETE émotions/catégories |
| `/admin/emotions/categories/new` | — | POST `/api/emotions/categories` |
| `/admin/emotions/categories/[id]` | `/api/emotions/categories/[id]` | PUT `/api/emotions/categories/[id]` |
| `/admin/emotions/new` | `/api/emotions/categories` | POST `/api/emotions` ⚠ |
| `/admin/emotions/[id]` | `/api/emotions/[id]`, `/api/emotions/categories` | PUT `/api/emotions/[id]` |

