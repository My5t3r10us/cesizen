'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
  onSuccess?: () => void;
}

export function DeleteUserButton({ userId, userName, onSuccess }: DeleteUserButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    const result = await res.json();
    setIsLoading(false);

    if (result.success) {
      toast.success('Compte supprimé définitivement');
      setOpen(false);
      onSuccess?.();
    } else {
      toast.error(result.error || 'Erreur lors de la suppression');
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-destructive/40 text-destructive hover:bg-destructive/5"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Supprimer
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer le compte</DialogTitle>
            <DialogDescription className="pt-2">
              Vous êtes sur le point de supprimer définitivement le compte de{' '}
              <span className="font-semibold text-foreground">{userName}</span>.
              <br className="mb-2" />
              Cette action est <span className="font-semibold text-destructive">irréversible</span> — toutes les données associées (journal, entrées) seront perdues.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
