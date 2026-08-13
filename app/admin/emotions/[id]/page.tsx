'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmotionForm } from '@/components/admin/emotion-form';
import { Heart } from 'lucide-react';

type Category = { id: number; label: string; colorHex: string; iconName: string };
type Emotion = { id: number; label: string; colorHex: string | null; iconName: string | null; categoryId: number | null; category?: Category };

export default function EditEmotionPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [emotion, setEmotion] = useState<Emotion | null | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/emotions/${id}`).then((r) => r.json()),
      fetch('/api/emotions/categories').then((r) => r.json()),
    ]).then(([emotionData, categoriesData]) => {
      setEmotion(emotionData?.id ? emotionData : null);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    }).catch(console.error);
  }, [id]);

  if (emotion === undefined || emotion === null) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Heart className="h-7 w-7 text-primary" />
          Modifier l&apos;émotion
        </h1>
        <p className="text-muted-foreground mt-1">
          Éditez les informations de l&apos;émotion
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;émotion</CardTitle>
          <CardDescription>
            Modifiez les champs pour mettre à jour l&apos;émotion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmotionForm emotion={emotion} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
