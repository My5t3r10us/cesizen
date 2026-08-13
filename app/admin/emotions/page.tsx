'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Plus } from 'lucide-react';
import Link from 'next/link';
import { CategoryCard } from '@/components/admin/category-card';

type Emotion = { id: number; label: string; colorHex: string | null; iconName: string | null };
type Category = { id: number; label: string; colorHex: string; iconName: string; emotions: Emotion[] };

export default function EmotionsAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    fetch('/api/emotions/categories')
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []));
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Heart className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            Gestion des Émotions
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Gérez les catégories et émotions du référentiel
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/admin/emotions/categories/new" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Catégorie
            </Button>
          </Link>
          <Link href="/admin/emotions/new" className="flex-1 sm:flex-none">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Émotion
            </Button>
          </Link>
        </div>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Aucune catégorie</h3>
            <p className="text-muted-foreground mt-1">
              Commencez par créer une catégorie d&apos;émotions
            </p>
            <Link href="/admin/emotions/categories/new">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Créer une catégorie
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} onSuccess={refresh} />
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
          <CardDescription>Vue d&apos;ensemble du référentiel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 md:p-4 bg-muted/50 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-primary">{categories.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Catégories</div>
            </div>
            <div className="text-center p-3 md:p-4 bg-muted/50 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-primary">
                {categories.reduce((acc, cat) => acc + (cat.emotions?.length || 0), 0)}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Émotions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
