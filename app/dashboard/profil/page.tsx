import { getSession } from '@/lib/auth/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield } from 'lucide-react';
import { LogoutButton } from '@/components/layout/logout-button';
import { ProfileSettings } from '@/components/profile/profile-settings';

export default async function ProfilPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const getInitials = () => {
    if (session.prenom && session.nom) {
      return `${session.prenom[0]}${session.nom[0]}`.toUpperCase();
    }
    return session.email[0].toUpperCase();
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <User className="h-6 w-6 md:h-7 md:w-7 text-primary" />
          Mon Profil
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Gérez vos informations personnelles
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <Avatar className="h-12 w-12 md:h-16 md:w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg md:text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="text-base md:text-lg truncate">
                {session.prenom} {session.nom || ''}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant={session.role === 'admin' ? 'default' : 'secondary'}>
                  {session.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Mail className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-sm md:text-base truncate">{session.email}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Shield className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Sécurité</p>
              <p className="font-medium text-sm md:text-base">Vos notes sont chiffrées de bout en bout</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-base md:text-lg">Actions du compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <LogoutButton />
        </CardContent>
      </Card>

      <ProfileSettings
        initialUser={{
          userId: session.userId,
          email: session.email,
          role: session.role,
          nom: session.nom,
          prenom: session.prenom,
        }}
      />
    </div>
  );
}
