import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import {
  emotions,
  emotionCategories,
  articleCategories,
} from '@/lib/db/schema';

/**
 * Truncate all tables. Order is irrelevant thanks to CASCADE,
 * but each TRUNCATE runs separately for clarity.
 */
export async function resetDb() {
  await db.execute(sql`TRUNCATE TABLE "entries" RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE "articles" RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE "emotions" RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE "emotion_categories" RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE "article_categories" RESTART IDENTITY CASCADE`);
}

export async function seedEmotion() {
  const [cat] = await db
    .insert(emotionCategories)
    .values({ label: 'Joie', colorHex: '#FFD700', iconName: 'smile' })
    .returning();
  const [emotion] = await db
    .insert(emotions)
    .values({ label: 'Heureux', categoryId: cat.id })
    .returning();
  return { category: cat, emotion };
}

export async function seedArticleCategory() {
  const [cat] = await db
    .insert(articleCategories)
    .values({ label: 'Bien-être', slug: 'bien-etre', colorHex: '#8A9A5B' })
    .returning();
  return cat;
}
