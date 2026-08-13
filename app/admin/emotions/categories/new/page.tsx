import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryForm } from '@/components/admin/category-form';
import { FolderPlus } from 'lucide-react';

export default function NewCategoryPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <FolderPlus className="h-7 w-7 text-primary" />
          Nouvelle catégorie
        </h1>
        <p className="text-muted-foreground mt-1">
          Créez une nouvelle catégorie d&apos;émotions (émotion de base)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la catégorie</CardTitle>
          <CardDescription>
            Les catégories représentent les émotions de base (Joie, Colère, Peur, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  );
}
