import { 
  pgTable, 
  serial, 
  varchar, 
  timestamp, 
  pgEnum, 
  uuid, 
  text, 
  integer, 
  boolean 
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['user', 'admin']);

// Table Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  nom: varchar('nom', { length: 255 }),
  prenom: varchar('prenom', { length: 255 }),
  role: roleEnum('role').default('user').notNull(),
  isBanned: boolean('is_banned').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table Catégories d'émotions (émotions de base)
export const emotionCategories = pgTable('emotion_categories', {
  id: serial('id').primaryKey(),
  label: varchar('label', { length: 100 }).notNull().unique(),
  colorHex: varchar('color_hex', { length: 7 }).notNull(),
  iconName: varchar('icon_name', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table Emotions (émotions détaillées)
export const emotions = pgTable('emotions', {
  id: serial('id').primaryKey(),
  label: varchar('label', { length: 100 }).notNull(),
  categoryId: integer('category_id').notNull().references(() => emotionCategories.id, { onDelete: 'cascade' }),
  colorHex: varchar('color_hex', { length: 7 }),
  iconName: varchar('icon_name', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table Entries (journal émotionnel)
export const entries = pgTable('entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  emotionId: integer('emotion_id').notNull().references(() => emotions.id),
  intensity: integer('intensity').notNull(), // 1-10
  noteEncrypted: text('note_encrypted'), // Chiffré AES-256-GCM côté serveur
  contextTags: text('context_tags').array(), // Array de tags
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table Catégories d'articles
export const articleCategories = pgTable('article_categories', {
  id: serial('id').primaryKey(),
  label: varchar('label', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  colorHex: varchar('color_hex', { length: 7 }).notNull().default('#8A9A5B'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table Articles (CMS)
export const articles = pgTable('articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(), // Markdown/HTML
  excerpt: text('excerpt'), // Résumé pour la liste
  coverImage: varchar('cover_image', { length: 500 }),
  categoryId: integer('category_id').references(() => articleCategories.id),
  authorId: uuid('author_id').notNull().references(() => users.id),
  isPublished: boolean('is_published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  entries: many(entries),
  articles: many(articles),
}));

export const emotionCategoriesRelations = relations(emotionCategories, ({ many }) => ({
  emotions: many(emotions),
}));

export const emotionsRelations = relations(emotions, ({ one, many }) => ({
  category: one(emotionCategories, {
    fields: [emotions.categoryId],
    references: [emotionCategories.id],
  }),
  entries: many(entries),
}));

export const entriesRelations = relations(entries, ({ one }) => ({
  user: one(users, {
    fields: [entries.userId],
    references: [users.id],
  }),
  emotion: one(emotions, {
    fields: [entries.emotionId],
    references: [emotions.id],
  }),
}));

export const articleCategoriesRelations = relations(articleCategories, ({ many }) => ({
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  category: one(articleCategories, {
    fields: [articles.categoryId],
    references: [articleCategories.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type EmotionCategory = typeof emotionCategories.$inferSelect;
export type NewEmotionCategory = typeof emotionCategories.$inferInsert;
export type Emotion = typeof emotions.$inferSelect;
export type NewEmotion = typeof emotions.$inferInsert;
export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
export type ArticleCategory = typeof articleCategories.$inferSelect;
export type NewArticleCategory = typeof articleCategories.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
