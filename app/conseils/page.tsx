'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { ArticlesList } from '@/components/conseils/articles-list';
import { BookOpen } from 'lucide-react';

type User = { email: string; nom?: string | null; prenom?: string | null; role: 'user' | 'admin' };
type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  categoryId?: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; email: string; nom?: string | null; prenom?: string | null } | null;
  category?: { id: number; label: string; slug: string; colorHex: string; createdAt: string } | null;
};
type Category = { id: number; label: string; slug: string; colorHex: string; createdAt: string };

export default function ConseilsPage() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/articles?publishedOnly=true').then((r) => r.json()),
      fetch('/api/articles/categories').then((r) => r.json()),
    ]).then(([me, articlesData, categoriesData]) => {
      setUser(me ?? undefined);
      setArticles(Array.isArray(articlesData) ? articlesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 text-primary mb-3 md:mb-4">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs md:text-sm font-medium">Blog bien-être</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Conseils & Articles
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Découvrez nos articles rédigés par des experts pour vous accompagner 
              dans votre parcours de bien-être mental.
            </p>
          </div>

          <ArticlesList articles={articles} categories={categories} />
        </div>
      </main>
    </div>
  );
}
