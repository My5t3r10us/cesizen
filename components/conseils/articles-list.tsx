'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, ArrowRight, Search, SlidersHorizontal, ArrowUpDown, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type ArticleCategory = {
  id: number;
  label: string;
  slug: string;
  colorHex: string;
  createdAt: Date | string;
};

type ArticleWithCategory = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  categoryId?: number | null;
  isPublished: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  author?: {
    id: string;
    email: string;
    nom?: string | null;
    prenom?: string | null;
  } | null;
  category?: ArticleCategory | null;
};

interface ArticlesListProps {
  articles: ArticleWithCategory[];
  categories: ArticleCategory[];
}

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

export function ArticlesList({ articles, categories }: ArticlesListProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredArticles = useMemo(() => {
    let result = [...articles];

    // Filtre par recherche
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower) ||
          article.excerpt?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      result = result.filter(
        (article) => article.categoryId === parseInt(selectedCategory)
      );
    }

    // Tri
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [articles, search, selectedCategory, sortBy]);

  const getExcerpt = (article: ArticleWithCategory) => {
    if (article.excerpt) return article.excerpt;
    return article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-45">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.colorHex }}
                  />
                  {cat.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-40">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Plus récents</SelectItem>
            <SelectItem value="oldest">Plus anciens</SelectItem>
            <SelectItem value="title-asc">Titre A-Z</SelectItem>
            <SelectItem value="title-desc">Titre Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Résultats */}
      <div className="text-sm text-muted-foreground">
        {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} trouvé{filteredArticles.length !== 1 ? 's' : ''}
      </div>

      {/* Liste d'articles */}
      {filteredArticles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aucun article ne correspond à votre recherche.
            </p>
            <Button
              variant="link"
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredArticles.map((article) => (
            <Link key={article.id} href={`/conseils/${article.slug}`}>
              <Card className="hover:shadow-lg transition-all hover:border-primary/30 group overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {article.coverImage && (
                    <div className="relative md:w-48 h-32 md:h-auto bg-muted shrink-0">
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          {article.category && (
                            <Badge
                              variant="secondary"
                              style={{
                                backgroundColor: article.category.colorHex + '20',
                                color: article.category.colorHex,
                              }}
                            >
                              {article.category.label}
                            </Badge>
                          )}
                          <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </CardTitle>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 hidden sm:block" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground line-clamp-2 mb-3">
                        {getExcerpt(article)}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(article.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </span>
                        {article.author && (
                          <span>
                            Par {article.author.prenom} {article.author.nom}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
