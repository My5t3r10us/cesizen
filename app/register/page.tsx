'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Leaf, Loader2 } from 'lucide-react';

type AuthState = { error?: string; fieldErrors?: Record<string, string[]> };

export default function RegisterPage() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({});
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setState({});
    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        nom: formData.get('nom') || undefined,
        prenom: formData.get('prenom') || undefined,
      }),
    });
    const result = await res.json();
    setPending(false);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setState({ error: result.error, fieldErrors: result.fieldErrors });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-secondary/30 to-background p-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>
            Rejoignez CESIZen et prenez soin de votre bien-être
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {state.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {state.error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  type="text"
                  id="prenom"
                  name="prenom"
                  placeholder="Jean"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input
                  type="text"
                  id="nom"
                  name="nom"
                  placeholder="Dupont"
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                type="email"
                id="email"
                name="email"
                required
                placeholder="votre@email.com"
                className="h-11"
              />
              {state.fieldErrors?.email && (
                <p className="text-sm text-destructive">{state.fieldErrors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                type="password"
                id="password"
                name="password"
                required
                placeholder="••••••••"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
              </p>
              {state.fieldErrors?.password && (
                <p className="text-sm text-destructive">{state.fieldErrors.password[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                placeholder="••••••••"
                className="h-11"
              />
              {state.fieldErrors?.confirmPassword && (
                <p className="text-sm text-destructive">{state.fieldErrors.confirmPassword[0]}</p>
              )}
            </div>

            <Button type="submit" disabled={pending} className="w-full h-11">
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inscription...
                </>
              ) : (
                'S\'inscrire'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </p>
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition inline-block">
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
