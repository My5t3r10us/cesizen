import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: ['./tests/globalSetup.ts'],
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['node_modules', '.next', 'mobile', 'e2e'],
    env: {
      NODE_ENV: 'test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        '.next/**',
        'mobile/**',
        'e2e/**',
        'tests/**',
        'drizzle/**',
        'scripts/**',
        '**/*.config.*',
        'app/layout.tsx',
        'app/**/layout.tsx',
        'app/**/page.tsx',
        'components/**',
        'lib/colors.ts',
        'lib/utils.ts',
        'lib/db/schema.ts',
        'lib/db/seed.ts',
        'lib/db/migrate-colors.ts',
        'proxy.ts',
        'next-env.d.ts',
      ],
      thresholds: {
        lines: 60,
        functions: 70,
        branches: 55,
        statements: 60,
      },
    },
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
