'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

type EmotionCategory = { id: number; label: string; colorHex: string; iconName: string };
type Emotion = { id: number; label: string; colorHex: string | null; iconName: string | null };

interface CategoryCardProps {
  category: EmotionCategory & { emotions: Emotion[] };
  onSuccess?: () => void;
}

export function CategoryCard({ category, onSuccess }: CategoryCardProps) {
  const handleDeleteCategory = async () => {
    if (!confirm(`Supprimer la catégorie "${category.label}" et toutes ses émotions ?`)) return;
    
    const res = await fetch(`/api/emotions/categories/${category.id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      toast.success('Catégorie supprimée');
      onSuccess?.();
    } else {
      toast.error(result.error || 'Erreur');
    }
  };

  const handleDeleteEmotion = async (emotion: Emotion) => {
    if (!confirm(`Supprimer l'émotion "${emotion.label}" ?`)) return;
    
    const res = await fetch(`/api/emotions/${emotion.id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      toast.success('Émotion supprimée');
      onSuccess?.();
    } else {
      toast.error(result.error || 'Erreur');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: category.colorHex + '30' }}
            >
              <span style={{ color: category.colorHex }}>●</span>
            </div>
            <div>
              <CardTitle className="text-lg">{category.label}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {category.emotions?.length || 0} émotion(s)
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/emotions/categories/${category.id}`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleDeleteCategory}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {category.emotions?.map((emotion) => {
            const emotionColor = emotion.colorHex || category.colorHex;
            const hasCustomColor = !!emotion.colorHex;
            
            return (
              <Badge
                key={emotion.id}
                variant="secondary"
                className="flex items-center gap-2 py-1.5 px-3 border-2 transition-all hover:scale-105"
                style={{ 
                  backgroundColor: emotionColor + '20',
                  borderColor: emotionColor,
                }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: emotionColor }}
                  />
                  <span className="font-medium">{emotion.label}</span>
                  {hasCustomColor && (
                    <span className="text-xs opacity-60" title="Couleur personnalisée">✨</span>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-1">
                  <Link href={`/admin/emotions/${emotion.id}`}>
                    <Button variant="ghost" size="icon" className="h-5 w-5 p-0 hover:bg-white/20">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 hover:bg-white/20"
                    onClick={() => handleDeleteEmotion(emotion)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </Badge>
            );
          })}
          {(!category.emotions || category.emotions.length === 0) && (
            <p className="text-sm text-muted-foreground italic">
              Aucune émotion dans cette catégorie
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
