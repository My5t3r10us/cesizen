'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
type EmotionCategory = { id: number; label: string; colorHex: string; iconName: string };

interface CategoryFormProps {
  category?: EmotionCategory;
}

const iconOptions = [
  'smile', 'frown', 'meh', 'heart', 'flame', 'zap',
  'alert-triangle', 'cloud', 'sun', 'moon', 'star',
  'thumbs-up', 'thumbs-down', 'eye', 'eye-off',
];

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [label, setLabel] = useState(category?.label || '');
  const [colorHex, setColorHex] = useState(category?.colorHex || '#FFD700');
  const [iconName, setIconName] = useState(category?.iconName || 'smile');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});

    const body = { label, colorHex, iconName };

    const res = await fetch(
      category ? `/api/emotions/categories/${category.id}` : '/api/emotions/categories',
      {
        method: category ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    const result = await res.json();
    setPending(false);

    if (result.success) {
      toast.success(category ? 'Catégorie mise à jour !' : 'Catégorie créée !');
      router.push('/admin/emotions');
    } else {
      setError(result.error || 'Une erreur est survenue');
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="label">Nom de la catégorie *</Label>
        <Input
          type="text"
          id="label"
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: Joie, Colère, Peur..."
          className="h-11"
        />
        {fieldErrors.label && (
          <p className="text-sm text-destructive">{fieldErrors.label[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="colorHex">Couleur *</Label>
        <div className="flex items-center gap-3">
          <Input
            type="color"
            id="colorHex"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            className="w-16 h-11 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            placeholder="#FFD700"
            className="h-11 flex-1"
          />
          <div
            className="w-11 h-11 rounded-lg border"
            style={{ backgroundColor: colorHex }}
          />
        </div>
        {fieldErrors.colorHex && (
          <p className="text-sm text-destructive">{fieldErrors.colorHex[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Icône *</Label>
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
          {iconOptions.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setIconName(icon)}
              className={`p-3 rounded-lg border text-center text-sm transition-colors ${
                iconName === icon
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
        {fieldErrors.iconName && (
          <p className="text-sm text-destructive">{fieldErrors.iconName[0]}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {category ? 'Mise à jour...' : 'Création...'}
            </>
          ) : (
            category ? 'Mettre à jour' : 'Créer la catégorie'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
