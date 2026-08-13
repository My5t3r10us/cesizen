'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '@/components/admin/article-form';
import { FileText } from 'lucide-react';

type Category = { id: number; label: string; slug: string; colorHex: string };
type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  categoryId?: number | null;
  isPublished: boolean;
};

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [article, setArticle] = useState<Article | null | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    Promise.all([
      fetch(`/api/articles/${id}`).then((r) => r.json()),
      fetch('/api/articles/categories').then((r) => r.json()),
    ]).then(([articleData, categoriesData]) => {
      setArticle(articleData?.id ? articleData : null);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    }).catch(console.error);
  }, [id]);

  if (article === null || article === undefined) return null;

  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" />
          Modifier l&apos;article
        </h1>
        <p className="text-muted-foreground mt-1">
          Éditez les informations de l&apos;article
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;article</CardTitle>
          <CardDescription>
            Modifiez les champs pour mettre à jour l&apos;article
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArticleForm article={article} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
