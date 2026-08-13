'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Ban, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BanUserButtonProps {
  userId: string;
  isBanned: boolean;
  onSuccess?: () => void;
}

export function BanUserButton({ userId, isBanned, onSuccess }: BanUserButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleBan = async () => {
    setIsLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggleBan' }),
    });
    const result = await res.json();
    setIsLoading(false);
    
    if (result.success) {
      toast.success(isBanned ? 'Utilisateur débanni' : 'Utilisateur banni');
      onSuccess?.();
    } else {
      toast.error(result.error || 'Erreur');
    }
  };

  return (
    <Button 
      variant={isBanned ? 'outline' : 'destructive'} 
      size="sm"
      onClick={handleToggleBan}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isBanned ? (
        <>
          <CheckCircle className="h-4 w-4 mr-1" />
          Débannir
        </>
      ) : (
        <>
          <Ban className="h-4 w-4 mr-1" />
          Bannir
        </>
      )}
    </Button>
  );
}
