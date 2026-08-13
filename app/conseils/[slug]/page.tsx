'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type UserSession = { email: string; nom?: string | null; prenom?: string | null; role: 'user' | 'admin' };
type Article = {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  author: { email: string; nom: string | null; prenom: string | null } | null;
};

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [user, setUser] = useState<UserSession | null | undefined>(undefined);
  const [article, setArticle] = useState<Article | null | undefined>(undefined);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch(`/api/articles/by-slug/${slug}`).then((r) => r.json()),
    ]).then(([me, articleData]) => {
      setUser(me ?? null);
      setArticle(articleData?.id && articleData.isPublished ? articleData : null);
    }).catch(console.error);
  }, [slug]);

  if (article === undefined) return null;
  if (article === null) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user ?? undefined} />
        <main className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Article non trouvé.</p>
          <Button asChild className="mt-4"><Link href="/conseils">Retour aux conseils</Link></Button>
        </main>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <Header user={user ?? undefined} />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" asChild className="mb-4 md:mb-6 -ml-2">
            <Link href="/conseils">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux conseils
            </Link>
          </Button>

          <article>
            <header className="mb-6 md:mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs md:text-sm mb-3 md:mb-4">
                <BookOpen className="h-3 w-3" />
                Article
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {article.author?.prenom} {article.author?.nom || article.author?.email}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {format(new Date(article.createdAt), 'dd MMMM yyyy', { locale: fr })}
                </div>
              </div>
            </header>

            <Card>
              <CardContent className="py-6 md:py-8 px-4 md:px-6 prose prose-sm md:prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </CardContent>
            </Card>
          </article>

          <div className="mt-6 md:mt-8 text-center">
            {user ? (
              <>
                <p className="text-sm md:text-base text-muted-foreground mb-1 md:mb-1">
                  Vous avez aimé cet article ?
                </p>
                <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                  Consultez nos autres conseils pour en savoir plus sur la gestion du stress et le bien-être au travail !
                </p>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/conseils">
                    Consultez nos autres conseils
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                  Cet article vous a été utile ?
                </p>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/register">
                    Créez votre compte CESIZen
                  </Link>
                </Button>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
