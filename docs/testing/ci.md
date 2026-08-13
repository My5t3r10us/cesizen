# GitHub Actions de CESIZen

## Workflow `ci.yml`

Déclenché à chaque `push` (toutes branches) et chaque `pull_request` vers `master`/`main`.

### Jobs

| Job | Quand | Bloquant ? |
|-----|-------|-----------|
| `web-quality` | Toujours | ✅ |
| `web-build` | Toujours (après `web-quality`) | ✅ |
| `web-unit` | Toujours | ✅ |
| `web-integration` | Toujours | ✅ |
| `web-e2e` | Toujours (après `web-build`) | ✅ |

### Variables d'environnement

Pour les jobs qui ont besoin d'une valeur factice mais pas-secrète :

```yaml
JWT_SECRET: ci-test-secret-key-for-testing-only-32chars-long
ENCRYPTION_KEY: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cesizen_test
```

> Ces valeurs sont **uniquement** valides pour la CI. La prod utilise des secrets dédiés.

### Service Postgres

Les jobs `web-integration` et `web-e2e` instancient un container Postgres 16 via la directive `services:`, accessible sur `localhost:5432`. Les migrations Drizzle sont appliquées avant chaque suite.

### Reports

- Playwright : artefact `playwright-report/` uploadé pendant 7 jours sur chaque run.
- Coverage Vitest : disponible localement via `bun run test:coverage` (rapport HTML).

## Maintenance

- Ajouter un browser Playwright : éditer `playwright.config.ts` et le `--project=` du job `web-e2e`.
  (validation syntaxique YAML automatique en CI).
