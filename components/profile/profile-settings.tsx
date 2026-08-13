'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Cookie, Loader2, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { openCookiePreferences } from '@/components/cookies/cookie-consent';

type FieldErrors = Record<string, string[] | undefined>;

interface ProfileUser {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  nom?: string | null;
  prenom?: string | null;
}

interface ProfileSettingsProps {
  initialUser: ProfileUser;
}

async function readApiResult(res: Response) {
  return res.json().catch(() => ({ error: 'Une erreur est survenue' }));
}

export function ProfileSettings({ initialUser }: ProfileSettingsProps) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [profileErrors, setProfileErrors] = useState<FieldErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<FieldErrors>({});
  const [deleteErrors, setDeleteErrors] = useState<FieldErrors>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prenom: formData.get('prenom') || undefined,
        nom: formData.get('nom') || undefined,
        email: formData.get('email'),
        currentPassword: formData.get('currentPassword') || undefined,
      }),
    });
    const result = await readApiResult(res);
    setSavingProfile(false);

    if (res.ok && result.success) {
      setUser(result.user);
      const currentPasswordInput = form.elements.namedItem('currentPassword');
      if (currentPasswordInput instanceof HTMLInputElement) {
        currentPasswordInput.value = '';
      }
      toast.success('Profil mis a jour');
      router.refresh();
      return;
    }

    setProfileErrors(result.fieldErrors ?? {});
    toast.error(result.error ?? 'Erreur lors de la mise a jour du profil');
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);
    const res = await fetch('/api/auth/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
        confirmNewPassword: formData.get('confirmNewPassword'),
      }),
    });
    const result = await readApiResult(res);
    setSavingPassword(false);

    if (res.ok && result.success) {
      form.reset();
      toast.success('Mot de passe mis a jour');
      return;
    }

    setPasswordErrors(result.fieldErrors ?? {});
    toast.error(result.error ?? 'Erreur lors du changement de mot de passe');
  }

  async function handleDeleteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeletingAccount(true);
    setDeleteErrors({});

    const formData = new FormData(event.currentTarget);
    const res = await fetch('/api/auth/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: formData.get('currentPassword'),
      }),
    });
    const result = await readApiResult(res);
    setDeletingAccount(false);

    if (res.ok && result.success) {
      toast.success('Compte supprime definitivement');
      setDeleteDialogOpen(false);
      router.push('/');
      router.refresh();
      return;
    }

    setDeleteErrors(result.fieldErrors ?? {});
    toast.error(result.error ?? 'Erreur lors de la suppression du compte');
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-base md:text-lg">Modifier mes informations</CardTitle>
          <CardDescription>
            Mettez a jour les informations affichees sur votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prenom</Label>
                <Input id="prenom" name="prenom" defaultValue={user.prenom ?? ''} />
                {profileErrors.prenom?.[0] ? (
                  <p className="text-sm text-destructive">{profileErrors.prenom[0]}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" name="nom" defaultValue={user.nom ?? ''} />
                {profileErrors.nom?.[0] ? (
                  <p className="text-sm text-destructive">{profileErrors.nom[0]}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={user.email} required />
              {profileErrors.email?.[0] ? (
                <p className="text-sm text-destructive">{profileErrors.email[0]}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-current-password">Mot de passe actuel</Label>
              <Input
                id="profile-current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
              />
              {profileErrors.currentPassword?.[0] ? (
                <p className="text-sm text-destructive">{profileErrors.currentPassword[0]}</p>
              ) : null}
            </div>

            <Button type="submit" disabled={savingProfile} className="w-full sm:w-auto">
              {savingProfile ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-base md:text-lg">Changer mon mot de passe</CardTitle>
          <CardDescription>
            Utilisez les memes regles que lors de la creation du compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
              />
              {passwordErrors.currentPassword?.[0] ? (
                <p className="text-sm text-destructive">{passwordErrors.currentPassword[0]}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                />
                {passwordErrors.newPassword?.[0] ? (
                  <p className="text-sm text-destructive">{passwordErrors.newPassword[0]}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirmation</Label>
                <Input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                />
                {passwordErrors.confirmNewPassword?.[0] ? (
                  <p className="text-sm text-destructive">{passwordErrors.confirmNewPassword[0]}</p>
                ) : null}
              </div>
            </div>

            <Button type="submit" disabled={savingPassword} className="w-full sm:w-auto">
              {savingPassword ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Mettre a jour
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-base md:text-lg">Preferences</CardTitle>
          <CardDescription>
            Vous pouvez refaire votre choix concernant les cookies obligatoires.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={openCookiePreferences}
            className="w-full justify-start sm:w-auto"
          >
            <Cookie className="mr-2 h-4 w-4" />
            Refaire le choix des cookies
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-base md:text-lg text-destructive">Zone dangereuse</CardTitle>
          <CardDescription>
            La suppression du compte efface definitivement vos donnees associees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer mon compte
          </Button>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer le compte ?</DialogTitle>
            <DialogDescription>
              Cette action est irreversible. Toutes les donnees reliees a votre compte seront supprimees.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeleteSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-current-password">Mot de passe actuel</Label>
              <Input
                id="delete-current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
              />
              {deleteErrors.currentPassword?.[0] ? (
                <p className="text-sm text-destructive">{deleteErrors.currentPassword[0]}</p>
              ) : null}
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deletingAccount}
              >
                Annuler
              </Button>
              <Button type="submit" variant="destructive" disabled={deletingAccount}>
                {deletingAccount ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Supprimer definitivement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
