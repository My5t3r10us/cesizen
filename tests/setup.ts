import { vi } from 'vitest';
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';

const envTestPath = path.resolve(process.cwd(), '.env.test');

if (!process.env.CI && !existsSync(envTestPath)) {
  console.warn(
    '\n⚠️  .env.test introuvable — utilisation des valeurs par défaut.\n' +
    "   Les tests d'intégration nécessitent DATABASE_URL.\n" +
    '   Copier .env.test.example → .env.test (voir GUIDE_TESTS.md).\n'
  );
}

config({ path: envTestPath });

// Valeurs de repli : utilisées en CI (vars injectées par GitHub Actions)
// et pour les tests unitaires qui ne nécessitent pas de base de données.
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only-32chars';
}
if (!process.env.ENCRYPTION_KEY) {
  process.env.ENCRYPTION_KEY =
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
}

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

const cookieStore = new Map<string, { value: string }>();

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string) => {
      cookieStore.set(name, { value });
    },
    delete: (name: string) => {
      cookieStore.delete(name);
    },
  }),
}));

export function clearTestCookies() {
  cookieStore.clear();
}
