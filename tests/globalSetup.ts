import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'node:path';

export default async function globalSetup() {
  const envTestPath = path.resolve(process.cwd(), '.env.test');
  if (existsSync(envTestPath)) {
    config({ path: envTestPath });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return;

  try {
    const { drizzle } = await import('drizzle-orm/node-postgres');
    const { migrate } = await import('drizzle-orm/node-postgres/migrator');
    const { Pool } = await import('pg');

    const pool = new Pool({ connectionString: dbUrl, connectionTimeoutMillis: 5000 });
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
    await pool.end();
    console.log('✓ Migrations appliquées sur la DB de test');
  } catch (err) {
    console.warn('⚠️  Migration DB test échouée:', err instanceof Error ? err.message : err);
  }
}
