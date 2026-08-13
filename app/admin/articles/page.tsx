'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Edit } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DeleteArticleButton } from '@/components/admin/delete-article-button';

type Article = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
  author: { email: string; nom: string | null; prenom: string | null } | null;
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(data => setArticles(Array.isArray(data) ? data : []));
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            Articles
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Gérez les articles de conseils
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/articles/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel article
          </Link>
        </Button>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun article pour le moment.</p>
            <Button asChild className="mt-4">
              <Link href="/admin/articles/new">Créer le premier article</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <Card key={article.id} className='py-2'>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base md:text-lg truncate">{article.title}</h3>
                      <Badge variant={article.isPublished ? 'default' : 'secondary'}>
                        {article.isPublished ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                      /{article.slug} • {format(new Date(article.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      Par {article.author?.prenom} {article.author?.nom || article.author?.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-start">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/articles/${article.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteArticleButton articleId={article.id} onSuccess={refresh} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
