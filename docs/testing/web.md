# Tests web de CESIZen

## Structure

```
tests/
├── setup.ts              # Mocks globaux (next/headers, next/cache) + .env.test
├── helpers/
│   ├── auth.ts           # createTestUser({role}) → { user, token, password }
│   ├── db.ts             # resetDb(), seedEmotion(), seedArticleCategory()
│   └── request.ts        # buildRequest() pour invoquer les Route Handlers Next
├── unit/                 # Tests unitaires sans DB
│   ├── password.test.ts
│   ├── encryption.test.ts
│   ├── session.test.ts
│   └── validation.test.ts
└── integration/          # Tests d'intégration HTTP+DB (Postgres requis)
    ├── admin.test.ts
    ├── articles.test.ts
    ├── articles-crud.test.ts
    ├── auth.test.ts
    ├── emotions.test.ts
    ├── emotions-crud.test.ts
    └── entries.test.ts
```

## Lancer

```bash
# Unit (rapide, pas de DB)
bun run test:unit

# Intégration (Postgres requis)
docker run -d --name cesizen-pg-test -p 5432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cesizen_test postgres:16
bunx drizzle-kit migrate
bun run test:integration

# Tout
bun run test

# Coverage
bun run test:coverage

# E2E Playwright (build + start auto via webServer)
bun run test:e2e:install   # première fois
bun run test:e2e
```

## Variables d'environnement de test

`.env.test` (chargé automatiquement par `tests/setup.ts`) :

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5454/cesizen_test
JWT_SECRET=test-secret-key-for-testing-only-32chars-long
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

> `ENCRYPTION_KEY` doit faire 64 caractères hex (= 32 octets pour AES-256).

## Approche : pas de serveur HTTP

Les tests d'intégration appellent **directement** les fonctions exportées par les Route Handlers Next (`POST`, `GET`, etc.) avec un `NextRequest` mocké via `tests/helpers/request.ts`. C'est l'approche officielle Next.js (« unit-testing of route handlers ») — elle est rapide et évite le besoin d'un serveur séparé.

## E2E

- **Web** : `e2e/*.spec.ts` (Playwright). Le serveur Next est démarré automatiquement par la directive `webServer` dans `playwright.config.ts`.
  [`mobile-e2e.md`](mobile-e2e.md).
