'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, ShieldAlert, TrendingUp } from 'lucide-react';
import Link from 'next/link';

type AdminStats = {
  totalUsers: number;
  bannedUsers: number;
  admins: number;
  newUsersThisWeek: number;
  totalArticles: number;
  publishedArticles: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Tableau de bord Admin
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Vue d&apos;ensemble de l&apos;application CESIZen
        </p>
      </div>

      {/* Warning Box */}
      <div className="p-3 md:p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
        <p className="text-destructive text-xs md:text-sm flex items-start md:items-center gap-2">
          <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5 md:mt-0" />
          <span>Cette zone est réservée aux administrateurs. Les notes des utilisateurs sont chiffrées et inaccessibles.</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <Card className='pt-0'>
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span className="text-xl md:text-2xl font-bold">{stats?.totalUsers || 0}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Utilisateurs totaux</p>
          </CardContent>
        </Card>
        
        <Card className='pt-0'>
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
              <span className="text-xl md:text-2xl font-bold">{stats?.newUsersThisWeek || 0}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Nouveaux cette semaine</p>
          </CardContent>
        </Card>
        
        <Card className='pt-0'>
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 md:h-5 md:w-5 text-accent" />
              <span className="text-xl md:text-2xl font-bold">{stats?.publishedArticles || 0}/{stats?.totalArticles || 0}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Articles publiés</p>
          </CardContent>
        </Card>
        
        <Card className='pt-0'>
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 md:h-5 md:w-5 text-destructive" />
              <span className="text-xl md:text-2xl font-bold">{stats?.bannedUsers || 0}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Utilisateurs bannis</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card className='gap-0'>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-base md:text-lg">Gestion des articles</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Créez et gérez les articles de conseils
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link 
              href="/admin/articles" 
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
            >
              <FileText className="h-4 w-4" />
              Accéder aux articles →
            </Link>
          </CardContent>
        </Card>

        <Card className='gap-0'>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-base md:text-lg">Gestion des utilisateurs</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Gérez les comptes et les bannissements
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link 
              href="/admin/users" 
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
            >
              <Users className="h-4 w-4" />
              Accéder aux utilisateurs →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
