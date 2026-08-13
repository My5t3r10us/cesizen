'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryForm } from '@/components/admin/category-form';
import { FolderEdit } from 'lucide-react';

type Category = { id: number; label: string; colorHex: string; iconName: string };

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [category, setCategory] = useState<Category | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/emotions/categories/${id}`)
      .then((r) => r.json())
      .then((data) => setCategory(data?.id ? data : null))
      .catch(console.error);
  }, [id]);

  if (category === undefined || category === null) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <FolderEdit className="h-7 w-7 text-primary" />
          Modifier la catégorie
        </h1>
        <p className="text-muted-foreground mt-1">
          Éditez les informations de la catégorie
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la catégorie</CardTitle>
          <CardDescription>
            Modifiez les champs pour mettre à jour la catégorie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm category={category} />
        </CardContent>
      </Card>
    </div>
  );
}
