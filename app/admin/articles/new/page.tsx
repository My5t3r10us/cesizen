'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '@/components/admin/article-form';
import { FileText } from 'lucide-react';

type Category = { id: number; label: string; slug: string; colorHex: string };

export default function NewArticlePage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/articles/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" />
          Nouvel article
        </h1>
        <p className="text-muted-foreground mt-1">
          Créez un nouvel article de conseils
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;article</CardTitle>
          <CardDescription>
            Remplissez les champs pour créer votre article
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArticleForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
