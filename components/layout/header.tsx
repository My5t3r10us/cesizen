'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, LogOut, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  user?: {
    email: string;
    nom?: string | null;
    prenom?: string | null;
    role: 'user' | 'admin';
  };
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const getInitials = () => {
    if (user?.prenom && user?.nom) {
      return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const isDashboard = pathname.startsWith('/dashboard');
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg text-primary">CESIZen</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/conseils" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname.startsWith('/conseils') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Conseils
          </Link>
          {user ? (
            <>
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Mon Espace
              </Link>
              <Link 
                href="/dashboard/statistiques" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === '/dashboard/statistiques' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Statistiques
              </Link>
              {user.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Administration
                </Link>
              )}
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {/* Mobile menu button - only show on pages without bottom nav */}
          {!isDashboard && !isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="user-menu-trigger">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-0.5 leading-none">
                    {user.prenom && user.nom && (
                      <p className="font-medium text-sm">{user.prenom} {user.nom}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profil" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Mon Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/register">S&apos;inscrire</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && !isDashboard && !isAdmin && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 space-y-3">
            <Link 
              href="/conseils" 
              className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith('/conseils') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Conseils
            </Link>
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/dashboard' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mon Espace
                </Link>
                <Link 
                  href="/dashboard/statistiques" 
                  className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/dashboard/statistiques' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Statistiques
                </Link>
                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith('/admin') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Administration
                  </Link>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <Link 
                  href="/login" 
                  className="block py-2 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="block py-2 px-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
