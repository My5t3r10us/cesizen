'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldMinus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PromoteUserButtonProps {
  userId: string;
  isAdmin: boolean;
  onSuccess?: () => void;
}

export function PromoteUserButton({ userId, isAdmin, onSuccess }: PromoteUserButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggleRole' }),
    });
    const result = await res.json();
    setIsLoading(false);

    if (result.success) {
      toast.success(isAdmin ? 'Droits admin retirés' : 'Utilisateur promu administrateur');
      onSuccess?.();
    } else {
      toast.error(result.error || 'Erreur');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={isAdmin ? 'border-orange-300 text-orange-600 hover:bg-orange-50' : 'border-primary/40 text-primary hover:bg-primary/5'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isAdmin ? (
        <>
          <ShieldMinus className="h-4 w-4 mr-1" />
          Rétrograder
        </>
      ) : (
        <>
          <ShieldCheck className="h-4 w-4 mr-1" />
          Promouvoir admin
        </>
      )}
    </Button>
  );
}
