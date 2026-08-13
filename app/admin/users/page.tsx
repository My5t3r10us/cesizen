'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BanUserButton } from '@/components/admin/ban-user-button';
import { PromoteUserButton } from '@/components/admin/promote-user-button';
import { DeleteUserButton } from '@/components/admin/delete-user-button';

type User = {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  role: 'user' | 'admin';
  isBanned: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []));
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 md:h-7 md:w-7 text-primary" />
          Utilisateurs
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Gérez les comptes utilisateurs
        </p>
      </div>

      {/* Warning about privacy */}
      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
        <p className="text-primary text-sm flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          Les notes des utilisateurs sont chiffrées et techniquement inaccessibles aux administrateurs.
        </p>
      </div>

      {/* Users list */}
      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id} className={user.isBanned ? 'border-destructive/50 bg-destructive/5 py-2' : 'py-2'}>
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold truncate">
                      {user.prenom} {user.nom || user.email}
                    </span>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    {user.isBanned && (
                      <Badge variant="destructive">Banni</Badge>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inscrit le {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: fr })}
                  </p>
                </div>
                
                <div className="self-end sm:self-center flex gap-2">
                  <PromoteUserButton userId={user.id} isAdmin={user.role === 'admin'} onSuccess={refresh} />
                  {user.role !== 'admin' && (
                    <BanUserButton userId={user.id} isBanned={user.isBanned} onSuccess={refresh} />
                  )}
                  {user.role !== 'admin' && (
                    <DeleteUserButton
                      userId={user.id}
                      userName={`${user.prenom ?? ''} ${user.nom ?? user.email}`.trim()}
                      onSuccess={refresh}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
