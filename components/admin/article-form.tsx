'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from './rich-text-editor';
import { cn } from '@/lib/utils';

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  categoryId?: number | null;
  isPublished: boolean;
};

type ArticleCategory = {
  id: number;
  label: string;
  slug: string;
  colorHex: string;
};

interface ArticleFormProps {
  article?: Article;
  categories?: ArticleCategory[];
}

type Step = 'info' | 'content';

export function ArticleForm({ article, categories = [] }: ArticleFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('info');
  const [title, setTitle] = useState(article?.title || '');
  const [slug, setSlug] = useState(article?.slug || '');
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [coverImage, setCoverImage] = useState(article?.coverImage || '');
  const [categoryId, setCategoryId] = useState<string>(article?.categoryId?.toString() || '');
  const [content, setContent] = useState(article?.content || '');
  const [isPublished, setIsPublished] = useState(article?.isPublished || false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!article) {
      const generatedSlug = newTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = async () => {
    setPending(true);
    setError(null);
    setFieldErrors({});

    const body = { title, slug, excerpt, coverImage, categoryId: categoryId || null, content, isPublished };

    const res = await fetch(
      article ? `/api/articles/${article.id}` : '/api/articles',
      {
        method: article ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    const result = await res.json();
    setPending(false);

    if (result.success) {
      toast.success(article ? 'Article mis à jour !' : 'Article créé !');
      router.push('/admin/articles');
    } else {
      setError(result.error || 'Une erreur est survenue');
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
    }
  };

  const canProceedToContent = title.trim() && slug.trim();

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Indicateur d'étapes */}
      <div className="flex items-center justify-center gap-2 py-4">
        {['info', 'content'].map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                step === s
                  ? 'bg-primary border-primary text-primary-foreground font-bold'
                  : 'border-muted-foreground/30 text-muted-foreground'
              )}
            >
              {index + 1}
            </div>
            {index < 1 && (
              <div className={cn(
                'w-20 h-0.5 mx-2',
                step === 'content' ? 'bg-primary' : 'bg-muted-foreground/30'
              )} />
            )}
          </div>
        ))}
      </div>

      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold">
          {step === 'info' && 'Informations de l\'article'}
          {step === 'content' && 'Rédaction du contenu'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {step === 'info' && 'Renseignez les informations principales'}
          {step === 'content' && 'Rédigez le contenu de votre article'}
        </p>
      </div>

      {/* Étape 1: Informations */}
      {step === 'info' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
        <Input
          type="text"
          id="title"
          name="title"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Comment gérer son stress au quotidien"
          className="h-11"
        />
        {fieldErrors.title && (
          <p className="text-sm text-destructive">{fieldErrors.title[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL) *</Label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground whitespace-nowrap">/conseils/</span>
          <Input
            type="text"
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="gerer-stress-quotidien"
            className="h-11"
          />
        </div>
        {fieldErrors.slug && (
          <p className="text-sm text-destructive">{fieldErrors.slug[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Catégorie</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverImage">Image de couverture (URL)</Label>
          <Input
            type="url"
            id="coverImage"
            name="coverImage"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Résumé (optionnel)</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Un court résumé de l'article..."
          rows={2}
        />
      </div>

          <div className="flex items-center gap-3">
            <Switch
              id="isPublished"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <Label htmlFor="isPublished" className="cursor-pointer">
              Publier l&apos;article
            </Label>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              onClick={() => setStep('content')}
              disabled={!canProceedToContent}
              className="w-full"
            >
              Suivant : Rédiger le contenu
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Étape 2: Contenu */}
      {step === 'content' && (
        <div className="space-y-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStep('info')}
            className="gap-1 -ml-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux informations
          </Button>

          <div className="space-y-2">
            <Label>Contenu de l&apos;article *</Label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Commencez à rédiger votre article..."
            />
            {fieldErrors.content && (
              <p className="text-sm text-destructive">{fieldErrors.content[0]}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" onClick={handleSubmit} disabled={pending || !content.trim()}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {article ? 'Mise à jour...' : 'Création...'}
                </>
              ) : (
                article ? 'Mettre à jour l\'article' : 'Créer l\'article'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
