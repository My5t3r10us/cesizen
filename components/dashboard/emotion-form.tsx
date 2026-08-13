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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Plus, Smile, Frown, Meh, Heart, Zap, Cloud, Sun, Moon, Flame, AlertTriangle, ThumbsDown, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hexToRgb } from '@/lib/colors';
import { toast } from 'sonner';

type Emotion = { id: number; label: string; colorHex: string | null; iconName: string | null; categoryId: number | null };
type EmotionCategory = { id: number; label: string; colorHex: string; iconName: string };
type EmotionWithCategory = Emotion & { category?: EmotionCategory };

function getContrastTextColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#ffffff';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
}

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

interface EmotionFormProps {
  emotions: EmotionWithCategory[];
  categories?: EmotionCategory[];
  hasTodayEntry?: boolean;
  onSuccess?: () => void;
}

const contextTags = [
  'Travail', 'Famille', 'Santé', 'Sport', 'Sommeil', 
  'Relations', 'Finances', 'Loisirs', 'Météo', 'Actualités'
];

type Step = 'category' | 'emotion' | 'details';

export function EmotionForm({ emotions, onSuccess }: EmotionFormProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null);
  const [intensity, setIntensity] = useState([3]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Grouper les émotions par catégorie
  const groupedEmotions = emotions.reduce((acc, emotion) => {
    const categoryId = emotion.categoryId?.toString() ?? 'unknown';
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: emotion.category,
        emotions: [],
      };
    }
    acc[categoryId].emotions.push(emotion);
    return acc;
  }, {} as Record<string, { category?: EmotionCategory; emotions: EmotionWithCategory[] }>);

  const resetForm = () => {
    setStep('category');
    setSelectedCategory(null);
    setSelectedEmotion(null);
    setIntensity([3]);
    setSelectedTags([]);
    setNote('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmotion) return;
    setPending(true);
    setError(null);

    const res = await fetch('/api/entries', {
      method: 'POST',
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
      toast.success('Votre humeur a été enregistrée !');
      resetForm();
      setOpen(false);
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
      setSelectedCategory(null);
    } else if (step === 'details') {
      setStep('emotion');
      setSelectedEmotion(null);
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
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Ajouter une émotion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {step === 'category' && 'Comment vous sentez-vous ?'}
            {step === 'emotion' && (
              <span className="flex items-center gap-2">
                {selectedCategoryData?.category?.label}
              </span>
            )}
            {step === 'details' && (
              <span className="flex items-center gap-2">
                {selectedEmotionData?.label}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 'category' && 'Choisissez une catégorie d\'émotion'}
            {step === 'emotion' && 'Sélectionnez l\'émotion qui vous correspond'}
            {step === 'details' && 'Précisez l\'intensité et ajoutez une note'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Étape 1: Catégories */}
        {step === 'category' && (
          <div className="grid grid-cols-2 gap-3 pb-2">
            {Object.entries(groupedEmotions).map(([categoryId, group]) => {
              const categoryColor = group.category?.colorHex || '#888888';
              const CategoryIcon = iconMap[group.category?.iconName || 'meh'] || Meh;
              
              return (
                <button
                  key={categoryId}
                  type="button"
                  onClick={() => handleCategorySelect(Number(categoryId))}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
                  style={{ borderColor: categoryColor + '50' }}
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
          <div className="space-y-4 pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-1 -ml-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Retour
            </Button>
            <div className="grid grid-cols-3 gap-2">
              {selectedCategoryData.emotions.map((emotion) => {
                const emotionColor = emotion.colorHex || selectedCategoryData.category?.colorHex || '#888888';
                
                return (
                  <button
                    key={emotion.id}
                    type="button"
                    onClick={() => handleEmotionSelect(emotion.id)}
                    className="px-4 py-2 rounded-lg border-2 transition-all text-md font-semibold hover:scale-105 flex justify-center items-center"
                    style={{
                      color: getContrastTextColor(emotionColor),
                      borderColor: emotionColor,
                      backgroundColor: emotionColor,
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
          <form onSubmit={handleSubmit} className="space-y-4 pb-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-1 -ml-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Retour
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
              <Label>Contexte (optionnel)</Label>
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
              <Label htmlFor="note">Note privée (optionnelle)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Décrivez votre journée, vos pensées..."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                🔒 Votre note est chiffrée
              </p>
            </div>

            {/* Bouton submit */}
            <Button 
              type="submit" 
              disabled={pending}
              className="w-full"
              size="lg"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </form>
        )}

        {/* Indicateur d'étapes */}
        <div className="flex items-center justify-center gap-2 py-2">
          {['category', 'emotion', 'details'].map((s) => (
            <div
              key={s}
              className={cn(
                'h-2 rounded-full transition-all',
                step === s ? 'w-8 bg-primary' : 'w-2 bg-muted'
              )}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
