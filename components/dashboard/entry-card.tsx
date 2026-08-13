'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Smile, Frown, Meh, Heart, Zap, Cloud, Sun, Moon, Flame, AlertTriangle, ThumbsDown, MoreVertical, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { EditEntryDialog } from './edit-entry-dialog';

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

interface EntryCardProps {
  entry: {
    id: string;
    emotionId: number;
    intensity: number;
    note?: string | null;
    contextTags?: string[] | null;
    createdAt: Date;
    emotion?: {
      id: number;
      label: string;
      colorHex?: string | null;
      iconName?: string | null;
      categoryId: number;
    } | null;
  };
  emotions: Array<{
    id: number;
    label: string;
    colorHex?: string | null;
    iconName?: string | null;
    categoryId: number;
    category?: {
      id: number;
      label: string;
      colorHex: string;
      iconName: string;
      createdAt: Date;
    } | null;
  }>;
  onSuccess?: () => void;
}

export function EntryCard({ entry, emotions, onSuccess }: EntryCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const Icon = iconMap[entry.emotion?.iconName || 'meh'] || Meh;
  const emotionColor = entry.emotion?.colorHex || '#8A9A5B';

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await fetch(`/api/entries/${entry.id}`, { method: 'DELETE' });
    const result = await res.json();
    setIsDeleting(false);
    
    if (result.success) {
      toast.success('Entrée supprimée');
      setShowDeleteDialog(false);
      onSuccess?.();
    } else {
      toast.error(result.error || 'Erreur lors de la suppression');
    }
  };

  return (
    <>
      <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition group">
        <div 
          className="p-2 rounded-full shrink-0"
          style={{ backgroundColor: `${emotionColor}20` }}
        >
          <Icon 
            className="h-5 w-5" 
            style={{ color: emotionColor }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{entry.emotion?.label || 'Émotion'}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(entry.createdAt), { 
                  addSuffix: true, 
                  locale: fr 
                })}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              Intensité: {entry.intensity}/5
            </Badge>
            {entry.contextTags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          {entry.note && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {entry.note}
            </p>
          )}
        </div>
      </div>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette entrée ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. L&apos;entrée sera définitivement supprimée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <EditEntryDialog 
        entry={entry}
        emotions={emotions}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={onSuccess}
      />
    </>
  );
}
