'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmotionForm } from '@/components/dashboard/emotion-form';
import { RecentEntries } from '@/components/dashboard/recent-entries';
import { MoodChart } from '@/components/dashboard/mood-chart';
import { Sun, TrendingUp, Calendar } from 'lucide-react';

type Emotion = { id: number; label: string; colorHex: string | null; iconName: string | null; categoryId: number | null; category?: { id: number; label: string; colorHex: string; iconName: string } };
type Entry = { id: string };
type Stats = { totalEntries: number; dailyAverages: { date: string; averageIntensity: number; count: number }[]; recentEntries: unknown[] };

export default function DashboardPage() {
  const [session, setSession] = useState<{ prenom?: string | null } | null>(null);
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayEntries, setTodayEntries] = useState<Entry[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/emotions').then(r => r.json()),
      fetch('/api/entries/stats').then(r => r.json()),
      fetch(`/api/entries?startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`).then(r => r.json()),
    ]).then(([me, emotionsData, statsData, todayData]) => {
      setSession(me ?? null);
      setEmotions(Array.isArray(emotionsData) ? emotionsData : []);
      setStats(statsData ?? null);
      setTodayEntries(Array.isArray(todayData) ? todayData : []);
    });
  }, [refreshKey]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };


  return (
    <div className="space-y-6">
      {/* Header de bienvenue */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            {greeting()}, {session?.prenom || 'cher utilisateur'} 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Comment vous sentez-vous aujourd&apos;hui ?
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </div>
      </div>

      {/* Météo du jour - Bouton d'ajout d'émotion */}
      <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-accent/5">
        <CardContent className="px-4 md:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 rounded-full bg-primary/10">
                <Sun className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base md:text-lg">Météo du jour</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {todayEntries.length > 0 
                    ? `${todayEntries.length} entrée${todayEntries.length > 1 ? 's' : ''} aujourd'hui`
                    : 'Aucune entrée aujourd\'hui'}
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <EmotionForm emotions={emotions} hasTodayEntry={todayEntries.length > 0} onSuccess={refresh} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className='pt-0'>
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="text-xl md:text-2xl font-bold text-primary">{stats?.totalEntries || 0}</div>
            <p className="text-xs md:text-sm text-muted-foreground">Entrées ce mois</p>
          </CardContent>
        </Card>
        <Card  className='pt-0'>
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="text-xl md:text-2xl font-bold text-primary">{todayEntries.length}</div>
            <p className="text-xs md:text-sm text-muted-foreground">Entrées aujourd&apos;hui</p>
          </CardContent>
        </Card>
        <Card  className='pt-0'>
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="text-xl md:text-2xl font-bold text-primary">
              {stats?.dailyAverages?.length || 0}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Jours actifs</p>
          </CardContent>
        </Card>
        <Card  className='pt-0'>
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
              <span className="text-xl md:text-2xl font-bold text-primary">
                {stats?.dailyAverages?.length 
                  ? Math.round(stats.dailyAverages.reduce((a, b) => a + b.averageIntensity, 0) / stats.dailyAverages.length * 10) / 10
                  : '-'}
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Intensité moyenne</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique d'évolution */}
      {stats?.dailyAverages && stats.dailyAverages.length > 0 && (
        <Card>
          <CardHeader className="pb-2 md:pb-6">
            <CardTitle className="text-base md:text-lg">Évolution de votre humeur</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Tendances des 30 derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            <MoodChart data={stats.dailyAverages} />
          </CardContent>
        </Card>
      )}

      {/* Entrées récentes */}
      <Card>
        <CardHeader className="pb-2 md:pb-6">
          <CardTitle className="text-base md:text-lg">Entrées récentes</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Vos dernières humeurs enregistrées
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <RecentEntries />
        </CardContent>
      </Card>
    </div>
  );
}
