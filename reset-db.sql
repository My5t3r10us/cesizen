-- Script pour réinitialiser complètement la base de données
-- ATTENTION: Cela supprime TOUTES les données !

-- Supprimer toutes les tables
DROP TABLE IF EXISTS "entries" CASCADE;
DROP TABLE IF EXISTS "articles" CASCADE;
DROP TABLE IF EXISTS "emotions" CASCADE;
DROP TABLE IF EXISTS "emotion_categories" CASCADE;
DROP TABLE IF EXISTS "article_categories" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Supprimer l'enum
DROP TYPE IF EXISTS "role" CASCADE;

-- Supprimer la table de migrations de drizzle
DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE;
