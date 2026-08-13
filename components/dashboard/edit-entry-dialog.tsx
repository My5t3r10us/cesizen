'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Smile, Frown, Meh, Heart, Zap, Cloud, Sun, Moon, Flame, AlertTriangle, ThumbsDown, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { EmotionCategory } from '@/lib/db/schema';

const iconMap: Record<string, React.ElementType> = {
  smile: Smile,
  frown: Frown,
  meh: Meh,
  heart: Heart,
  zap: Zap,
  cloud: Cloud,
  sun: Sun,
  moon: Moon,
  flame: Flame,
  'alert-triangle': AlertTriangle,
  'thumbs-down': ThumbsDown,
};

const contextTags = [
  'Travail', 'Famille', 'Santé', 'Sport', 'Sommeil', 
  'Relations', 'Finances', 'Loisirs', 'Météo', 'Actualités'
];

type EmotionWithCategory = {
  id: number;
  label: string;
  colorHex?: string | null;
  iconName?: string | null;
  categoryId: number;
  category?: EmotionCategory | null;
};

interface EditEntryDialogProps {
  entry: {
    id: string;
    emotionId: number;
    intensity: number;
    note?: string | null;
    contextTags?: string[] | null;
  };
  emotions: EmotionWithCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Step = 'category' | 'emotion' | 'details';

function EditEntryDialogInner({ entry, emotions, open, onOpenChange, onSuccess }: EditEntryDialogProps) {
  const currentEmotion = emotions.find(e => e.id === entry.emotionId);
  
  const [step, setStep] = useState<Step>('details');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(currentEmotion?.categoryId || null);
  const [selectedEmotion, setSelectedEmotion] = useState<number>(entry.emotionId);
  const [intensity, setIntensity] = useState([entry.intensity]);
  const [selectedTags, setSelectedTags] = useState<string[]>(entry.contextTags || []);
  const [note, setNote] = useState(entry.note || '');

  // Grouper les émotions par catégorie
  const groupedEmotions = emotions.reduce((acc, emotion) => {
    const categoryId = emotion.categoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: emotion.category,
        emotions: [],
      };
    }
    acc[categoryId].emotions.push(emotion);
    return acc;
  }, {} as Record<number, { category?: EmotionCategory | null; emotions: EmotionWithCategory[] }>);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch(`/api/entries/${entry.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emotionId: selectedEmotion,
        intensity: intensity[0],
        note: note || null,
        contextTags: selectedTags,
      }),
    });
    const result = await res.json();
    setPending(false);

    if (result.success) {
      toast.success('Entrée modifiée');
      onOpenChange(false);
      onSuccess?.();
    } else {
      setError(result.error || 'Une erreur est survenue');
    }
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setStep('emotion');
  };

  const handleEmotionSelect = (emotionId: number) => {
    setSelectedEmotion(emotionId);
    setStep('details');
  };

  const handleBack = () => {
    if (step === 'emotion') {
      setStep('category');
    } else if (step === 'details') {
      setStep('emotion');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const selectedCategoryData = selectedCategory ? groupedEmotions[selectedCategory] : null;
  const selectedEmotionData = emotions.find(e => e.id === selectedEmotion);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'category' && 'Changer l\'émotion'}
            {step === 'emotion' && selectedCategoryData?.category?.label}
            {step === 'details' && 'Modifier l\'entrée'}
          </DialogTitle>
          <DialogDescription>
            {step === 'category' && 'Choisissez une catégorie'}
            {step === 'emotion' && 'Sélectionnez une émotion'}
            {step === 'details' && `${selectedEmotionData?.label || 'Émotion'}`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Étape 1: Catégories */}
        {step === 'category' && (
          <div className="grid grid-cols-2 gap-3 py-4">
            {Object.entries(groupedEmotions).map(([categoryId, group]) => {
              const categoryColor = group.category?.colorHex || '#888888';
              const CategoryIcon = iconMap[group.category?.iconName || 'meh'] || Meh;
              
              return (
                <button
                  key={categoryId}
                  type="button"
                  onClick={() => handleCategorySelect(Number(categoryId))}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    selectedCategory === Number(categoryId) 
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div 
                    className="p-3 rounded-full"
                    style={{ backgroundColor: categoryColor + '20' }}
                  >
                    <CategoryIcon 
                      className="h-6 w-6" 
                      style={{ color: categoryColor }}
                    />
                  </div>
                  <span className="text-sm font-medium">{group.category?.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Étape 2: Émotions */}
        {step === 'emotion' && selectedCategoryData && (
          <div className="space-y-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-1 -ml-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Retour
            </Button>
            <div className="flex flex-wrap gap-2">
              {selectedCategoryData.emotions.map((emotion) => {
                const emotionColor = emotion.colorHex || selectedCategoryData.category?.colorHex || '#888888';
                const isSelected = selectedEmotion === emotion.id;
                
                return (
                  <button
                    key={emotion.id}
                    type="button"
                    onClick={() => handleEmotionSelect(emotion.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium",
                      isSelected ? "border-primary bg-primary/10" : "hover:scale-105"
                    )}
                    style={{
                      borderColor: isSelected ? undefined : emotionColor + '50',
                      backgroundColor: isSelected ? undefined : emotionColor + '10',
                    }}
                  >
                    {emotion.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Étape 3: Détails */}
        {step === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Bouton pour changer d'émotion */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep('category')}
              className="w-full"
            >
              Changer d&apos;émotion ({selectedEmotionData?.label})
            </Button>

            {/* Intensité */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Intensité</Label>
                <span className="text-sm font-medium text-primary">{intensity[0]}/5</span>
              </div>
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                max={5}
                min={0}
                step={1}
                className="py-4"
              />
            </div>

            {/* Tags de contexte */}
            <div className="space-y-3">
              <Label>Contexte</Label>
              <div className="flex flex-wrap gap-2">
                {contextTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer transition-all"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Note privée */}
            <div className="space-y-3">
              <Label htmlFor="edit-note">Note privée</Label>
              <Textarea
                id="edit-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Décrivez votre journée..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Bouton submit */}
            <Button 
              type="submit" 
              disabled={pending}
              className="w-full"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer les modifications'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function EditEntryDialog(props: EditEntryDialogProps) {
  return <EditEntryDialogInner key={props.entry.id} {...props} />;
}
