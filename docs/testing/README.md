# Tests et CI/CD de CESIZen

> Documentation complète de l'infrastructure de tests web et API et du pipeline CI/CD GitHub Actions.

---

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Pyramide de tests](#2-pyramide-de-tests)
3. [Web — Vitest (unit)](#3-web--vitest-unit)
4. [Web — Supertest / Vitest (intégration API)](#4-web--supertest--vitest-intégration-api)
5. [Web — Playwright (E2E)](#5-web--playwright-e2e)
8. [GitHub Actions CI/CD](#8-github-actions-cicd)
9. [Variables d'environnement](#9-variables-denvironnement)
10. [Lancer les tests en local](#10-lancer-les-tests-en-local)
11. [Ajouter un nouveau test](#11-ajouter-un-nouveau-test)
12. [Dépannage](#12-dépannage)

---

## 1. Vue d'ensemble


| Couche | Outil | Surface | Localisation | Quand ça tourne |
|--------|-------|---------|--------------|------------------|
| Unit web | **Vitest** | Web (Next.js) | `tests/unit/` | À chaque push (CI + local) |
| Intégration API | **Vitest + Supertest** | API REST `/app/api/*` | `tests/integration/` | À chaque push (CI + local, requiert Postgres) |
| E2E web | **Playwright** | Frontend Next.js | `e2e/` | À chaque push (CI + local, requiert build) |



---

## 2. Pyramide de tests


**Quoi tester à quel niveau ?**

| Niveau | Quand l'utiliser |
|--------|------------------|
| **Unit** | Logique pure : hash mot de passe, chiffrement notes, validation Zod, helpers, hooks isolés. Pas de DB, pas de réseau. |
| **Intégration** | Endpoints API : routage + validation + auth + DB + chiffrement bout-en-bout. Vérifie l'ownership, les codes HTTP, les contraintes RBAC. |
| **E2E** | Parcours utilisateur complets : signup → dashboard → ajout d'émotion → stats → logout. Vérifie la stack entière. |

---

## 3. Web — Vitest (unit)

### 3.1 Configuration

**`vitest.config.ts`** (racine)

```ts
{
  environment: 'node',
  setupFiles: ['./tests/setup.ts'],
  include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  exclude: ['node_modules', '.next', 'mobile', 'e2e'],
  coverage: {
    provider: 'v8',
    thresholds: { lines: 60, functions: 60, branches: 60, statements: 60 },
  },
  pool: 'forks',
  fileParallelism: false, // évite les races sur la DB
}

### 3.4 Lancer

```bash
bun run test:unit         # tests unit uniquement
bun run test              # tous les tests Vitest (unit + intégration)
bun run test:watch        # mode watch
bun run test:coverage     # rapport HTML dans ./coverage/
buildRequest('/api/entries', { method: 'POST', token, body: {...} })
        │
        ▼  NextRequest
   POST(req)              ← exporté par app/api/entries/route.ts
        │
        ▼  Postgres (test DB)
   Response (200/400/401/...)
        │
        ▼  readJson(res)
   { status, body }       ← assertions

**`auth.ts`** — Création utilisateurs de test
```ts
createTestUser({ email?, password?, role?, isBanned? })
  → { user, token, password }

### 4.3 Fichiers de tests

| Fichier | Endpoints couverts | Cas testés |
|---------|--------------------|-----------:|
| `tests/integration/auth.test.ts` | `/api/auth/{register,login,logout,me}` | register success/400/409 dup, login success/401/403 banned/401 unknown, me sans/avec Bearer, logout |
| `tests/integration/entries.test.ts` | `/api/entries{,/[id],/stats,/detailed-stats}` | 401 sans auth, create+read decrypted, ownership inter-users, 400 invalid, update+delete, 404 cross-user, stats agrégées, detailed-stats avec/sans dates |
| `tests/integration/articles.test.ts` | `/api/articles{,/by-slug/[slug]}` | GET all vs `publishedOnly=true`, POST sans admin → 403, by-slug 404, by-slug success |
| `tests/integration/admin.test.ts` | `/api/admin/{users,users/[id],stats}` | 403 sans session admin, list users, refus auto-modif, refus ban admin, toggleBan user OK, refus delete admin, stats |
| `tests/integration/articles-crud.test.ts` | `/api/articles{,/[id]}` | Création, lecture, mise à jour, suppression et permissions |
| `tests/integration/emotions.test.ts` | `/api/emotions{,/categories}` | Lecture publique du référentiel et catégories |
| `tests/integration/emotions-crud.test.ts` | `/api/emotions{,/[id],/categories/[id]}` | CRUD admin, validation et contraintes référentielles |

### 4.4 Pré-requis local

```bash
docker run -d --name cesizen-pg-test -p 5432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cesizen_test \
  postgres:16

bunx drizzle-kit migrate    # applique le schéma
bun run test:integration

---

## 5. Web — Playwright (E2E)

### 5.1 Configuration

**`playwright.config.ts`**
- `baseURL` = `http://localhost:3000` (override via `E2E_BASE_URL`)
- 3 projets : Chromium, Firefox, WebKit
- `webServer` : démarre `bun run build && bun run start` automatiquement (sauf si `E2E_BASE_URL` est défini → suppose serveur déjà lancé)
- `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`
- En CI : `retries: 2`, `workers: 1`, reporter HTML + GitHub annotations

### 5.2 Spécifications

| Fichier | Parcours testé |
|---------|----------------|
| `e2e/landing.spec.ts` | Hero visible pour les invités · `/dashboard` redirige vers `/login` · `/admin` redirige vers `/login` |
| `e2e/auth.spec.ts` | Register → land sur `/dashboard` · login error pour mauvais credentials · logout → `/` |
| `e2e/journal.spec.ts` | User authentifié peut accéder à `/dashboard/journal` et `/dashboard/statistiques` |
| `e2e/conseils.spec.ts` | Page liste publique accessible · 404-like pour slug inconnu |

### 5.3 Lancer

```bash
bun run test:e2e:install    # première fois — télécharge les navigateurs
bun run test:e2e             # exécute toute la suite
bun run test:e2e:ui          # interface interactive Playwright UI
bunx playwright test --debug e2e/auth.spec.ts  # debug pas-à-pas

### 8.2 Jobs

| Job | But | Bloquant ? | Durée typique |
|-----|-----|------------|---------------|
| `web-quality` | `bun run lint` + `bun run type-check` | ✅ | ~1 min |
| `web-build` | `bun run build` (Next.js prod) | ✅ | ~2 min |
| `web-unit` | `bun run test:unit` (Vitest) | ✅ | ~30 s |
| `web-integration` | Postgres service + migrate + `bun run test:integration` | ✅ | ~2 min |
| `web-e2e` | Postgres service + migrate + seed + Playwright | ✅ | ~5 min |

### 8.3 Graphe de dépendances


### 8.4 Service Postgres

Les jobs `web-integration` et `web-e2e` instancient un container Postgres 16 :

```yaml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: cesizen_test
    ports: ['5432:5432']
    options: >-
      --health-cmd pg_isready
      --health-interval 5s --health-timeout 5s --health-retries 10
```

Les migrations Drizzle sont appliquées via `bunx drizzle-kit migrate` avant chaque suite.

### 8.6 Variables d'environnement CI

Définies au niveau du workflow pour tous les jobs :

```yaml
env:
  JWT_SECRET: ci-test-secret-key-for-testing-only-32chars-long
  ENCRYPTION_KEY: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cesizen_test
```

Ce sont des valeurs **factices non-secrètes** — elles permettent au build/tests de tourner. La prod utilise des secrets dédiés via Vercel/Railway/etc.

### 8.7 Secrets requis (GitHub Settings → Secrets)

| Secret | Utilité | Comment l'obtenir |
|--------|---------|-------------------|

Aucun secret n'est requis pour les jobs web — les valeurs factices suffisent.

### 8.8 Artefacts

| Artefact | Job | Rétention |
|----------|-----|-----------|
| `playwright-report/` | `web-e2e` | 7 jours |

À récupérer depuis l'onglet **Actions** → run → **Artifacts** en bas.

---

## 9. Variables d'environnement

### 9.1 Local (`.env.test`)

Chargé automatiquement par `tests/setup.ts` :

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5454/cesizen_test
JWT_SECRET=test-secret-key-for-testing-only-32chars-long
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
NODE_ENV=test
```

> ⚠ `.env.test` est dans `.gitignore` (`.env*`) — c'est volontaire. Les valeurs sont régénérables et CI a son propre block `env:`.

### 9.2 Contraintes

| Variable | Format | Pourquoi |
|----------|--------|----------|
| `JWT_SECRET` | string ≥ 32 chars | Clé HMAC-SHA256 pour signer les JWT |
| `ENCRYPTION_KEY` | **64 chars hex** (= 32 octets) | AES-256-GCM exige une clé de 32 octets exacts |
| `DATABASE_URL` | `postgresql://user:pass@host:port/db` | Connection string `pg` |

## 10. Lancer les tests en local

### 10.1 Setup initial

```bash
# 1. Cloner + installer
git clone <repo>
cd cesi_zen
bun install

# 2. Lancer Postgres de test
docker run -d --name cesizen-pg-test -p 5432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cesizen_test \
  postgres:16

# 3. Appliquer le schéma
bunx drizzle-kit migrate

# 4. Première fois Playwright
bun run test:e2e:install
```

### 10.2 Runs courants

```bash
# Tous les tests web (unit + intégration), rapide
bun run test

# Unit seulement (pas besoin de Postgres)
bun run test:unit

# Intégration uniquement
bun run test:integration

# E2E web (build + start auto)
bun run test:e2e

# E2E web ciblé
bunx playwright test e2e/auth.spec.ts --project=chromium --debug



# Couverture web
bun run test:coverage
open coverage/index.html
```

### 10.3 Avant un push

```bash
bun run lint && bun run type-check && bun run test:unit
```

C'est l'équivalent rapide de `web-quality` + `web-unit` en CI. Pour reproduire **exactement** la CI :

```bash
bun run lint && \
bun run type-check && \
bun run build && \
bun run test:unit && \
bun run test:integration && \
bun run test:e2e
```

---

## 11. Ajouter un nouveau test

### 11.1 Test unit web

```bash
# Créer le fichier
touch tests/unit/mon-helper.test.ts
```

Squelette :
```ts
import { describe, it, expect } from 'vitest';
import { monHelper } from '@/lib/mon-helper';

describe('monHelper', () => {
  it('fait X dans le cas Y', () => {
    expect(monHelper(input)).toBe(expected);
  });
});
```

→ Pris automatiquement par `bun run test:unit` (glob `tests/**/*.test.ts`).

### 11.2 Test d'intégration API

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/mon-endpoint/route';
import { buildRequest, readJson } from '../helpers/request';
import { resetDb } from '../helpers/db';
import { createTestUser } from '../helpers/auth';

describe('POST /api/mon-endpoint', () => {
  beforeEach(async () => { await resetDb(); });

  it('rejette sans auth', async () => {
    const res = await POST(buildRequest('/api/mon-endpoint', { method: 'POST', body: {} }));
    expect(res.status).toBe(401);
  });

  it('accepte avec Bearer valide', async () => {
    const { token } = await createTestUser();
    const res = await POST(buildRequest('/api/mon-endpoint', {
      method: 'POST', token, body: { foo: 'bar' },
    }));
    expect(res.status).toBe(200);
  });
});
```

### 11.3 Test E2E Playwright

```ts
// e2e/ma-feature.spec.ts
import { test, expect } from '@playwright/test';

test('user peut faire X', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /commencer/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});
```

→ Pris automatiquement par `bun run test:e2e`.

## 12. Dépannage

### 12.1 « Cannot find module '@/lib/...' » dans Vitest

`vitest.config.ts` doit avoir l'alias :
```ts
resolve: { alias: { '@': path.resolve(__dirname, '.') } }
```

### 12.2 Tests d'intégration : « ECONNREFUSED 127.0.0.1:5432 »

Postgres de test pas démarré. Lancer :
```bash
docker start cesizen-pg-test
# ou recréer
docker run -d --name cesizen-pg-test -p 5432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cesizen_test postgres:16
```

### 12.3 « ENCRYPTION_KEY environment variable is not set »

Vérifier `.env.test` ou exporter manuellement :
```bash
export ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### 12.4 Playwright : `webServer` timeout

Le build Next.js peut être lent. Augmenter dans `playwright.config.ts` :
```ts
webServer: { ..., timeout: 240_000 }
```

Ou démarrer le serveur manuellement et utiliser `E2E_BASE_URL` :
```bash
bun run build && bun run start &
E2E_BASE_URL=http://localhost:3000 bunx playwright test
```

### 12.7 CI : `web-e2e` échoue mais passe en local

- Comparer le block `env:` du workflow avec ton `.env.test`
- Vérifier l'artefact `playwright-report` (vidéos + screenshots)
- Réduire `--workers=1` (déjà le cas en CI) ou augmenter `retries`

### 12.9 ESLint crash « contextOrFilename.getFilename »

ESLint 10 ↔ `eslint-plugin-react` incompat. Downgrade à ESLint 9 :
```json
"eslint": "^9.17.0"
```
(Déjà appliqué dans ce projet.)

---

## Annexe A — Checklist nouveau contributeur

- [ ] `bun install` à la racine
- [ ] Docker tourne, container `cesizen-pg-test` démarré
- [ ] `bunx drizzle-kit migrate`
- [ ] `bun run test:unit` → 38 cas unitaires collectés et réussis
- [ ] `bun run test:e2e:install` (Playwright browsers)

## Annexe B — Référence rapide commandes

| Commande | Effet |
|----------|-------|
| `bun run type-check` | `tsc --noEmit` |
| `bun run build` | Build Next.js |
| `bun run test` | Vitest (unit + intégration) |
| `bun run test:unit` | Vitest unit seulement |
| `bun run test:integration` | Vitest intégration seulement |
| `bun run test:coverage` | Couverture HTML |
| `bun run test:e2e` | Playwright (web E2E) |
| `bun run test:e2e:ui` | Playwright UI mode |

---

*Dernière vérification documentaire : 2026-08-13.*
