'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfWeek, startOfQuarter, startOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CalendarIcon, 
  TrendingUp, 
  Activity, 
  Heart, 
  Flame, 
  Clock, 
  Calendar as CalendarDays,
  Tag,
  BarChart3,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MoodChart } from './mood-chart';

type DateRange = {
  from: Date;
  to: Date;
};

type Stats = {
  totalEntries: number;
  averageIntensity: number;
  streakDays: number;
  mostFrequentEmotion: { id: string; label: string; colorHex: string; count: number; percentage: number } | null;
  mostFrequentCategory: { id: string; label: string; colorHex: string; count: number; percentage: number } | null;
  emotionDistribution: { id: string; label: string; colorHex: string; count: number; percentage: number }[];
  categoryDistribution: { id: string; label: string; colorHex: string; count: number; percentage: number }[];
  dailyAverages: { date: string; averageIntensity: number; count: number }[];
  weekdayDistribution: { label: string; count: number; averageIntensity: number; percentage: number }[];
  hourDistribution: { hour: number; label: string; count: number; averageIntensity: number; percentage: number }[];
  contextTagsDistribution: { tag: string; count: number }[];
} | null;

const presetRanges = [
  { label: 'Cette semaine', getValue: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: new Date() }) },
  { label: 'Ce mois', getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: 'Ce trimestre', getValue: () => ({ from: startOfQuarter(new Date()), to: new Date() }) },
  { label: 'Cette année', getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
  { label: 'Mois dernier', getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
];

export function StatsView() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [stats, setStats] = useState<Stats>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const res = await fetch(
        `/api/entries/detailed-stats?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
      );
      const result = await res.json();
      setStats(result ?? null);
      setLoading(false);
    }
    fetchStats();
  }, [dateRange]);

  const applyPreset = (preset: typeof presetRanges[0]) => {
    setDateRange(preset.getValue());
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur de dates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Période d&apos;analyse
          </CardTitle>
          <CardDescription>
            Sélectionnez une période pour afficher vos statistiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {presetRanges.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Date pickers */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Date de début</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateRange.from && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        format(dateRange.from, 'dd MMMM yyyy', { locale: fr })
                      ) : (
                        'Sélectionner'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange((prev) => ({ ...prev, from: date }))}
                      disabled={(date) => date > dateRange.to || date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Date de fin</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateRange.to && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? (
                        format(dateRange.to, 'dd MMMM yyyy', { locale: fr })
                      ) : (
                        'Sélectionner'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange((prev) => ({ ...prev, to: date }))}
                      disabled={(date) => date < dateRange.from || date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !stats || stats.totalEntries === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aucune entrée sur cette période.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Commencez à enregistrer vos émotions pour voir vos statistiques !
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className='pt-0'>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{stats.totalEntries}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Entrées totales</p>
              </CardContent>
            </Card>
            <Card className='pt-0'>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">{stats.averageIntensity}/5</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Intensité moyenne</p>
              </CardContent>
            </Card>
            <Card className='pt-0'>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold">{stats.streakDays}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Jours consécutifs max</p>
              </CardContent>
            </Card>
            <Card className='pt-0'>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold">{stats.dailyAverages.length}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Jours actifs</p>
              </CardContent>
            </Card>
          </div>

          {/* Émotion et catégorie les plus fréquentes */}
          <div className="grid md:grid-cols-2 gap-4">
            {stats.mostFrequentEmotion && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Émotion la plus fréquente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stats.mostFrequentEmotion.colorHex }}
                    />
                    <span className="font-semibold text-lg">{stats.mostFrequentEmotion.label}</span>
                    <Badge variant="secondary">
                      {stats.mostFrequentEmotion.count} fois ({Math.round(stats.mostFrequentEmotion.percentage)}%)
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
            {stats.mostFrequentCategory && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Catégorie dominante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stats.mostFrequentCategory.colorHex }}
                    />
                    <span className="font-semibold text-lg">{stats.mostFrequentCategory.label}</span>
                    <Badge variant="secondary">
                      {stats.mostFrequentCategory.count} fois ({Math.round(stats.mostFrequentCategory.percentage)}%)
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Graphique d'évolution */}
          {stats.dailyAverages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Évolution de l&apos;intensité
                </CardTitle>
                <CardDescription>
                  Moyenne quotidienne sur la période
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MoodChart data={stats.dailyAverages} />
              </CardContent>
            </Card>
          )}

          {/* Distribution par catégorie */}
          {stats.categoryDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribution par catégorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.categoryDistribution.map((cat) => (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.colorHex }}
                          />
                          <span>{cat.label}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {cat.count} ({Math.round(cat.percentage)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.colorHex,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Distribution par émotion */}
          {stats.emotionDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Top émotions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stats.emotionDistribution.slice(0, 10).map((emotion) => (
                    <Badge
                      key={emotion.id}
                      variant="secondary"
                      className="text-sm py-1 px-3"
                      style={{
                        backgroundColor: emotion.colorHex + '20',
                        borderColor: emotion.colorHex,
                      }}
                    >
                      {emotion.label} ({emotion.count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Distribution par jour de la semaine */}
          {stats.weekdayDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Activité par jour de la semaine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {stats.weekdayDistribution.map((day) => (
                    <div key={day.label} className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        {day.label.slice(0, 3)}
                      </div>
                      <div
                        className="mx-auto rounded-lg transition-all"
                        style={{
                          width: '100%',
                          height: `${Math.max(20, day.percentage * 2)}px`,
                          backgroundColor: day.count > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                          opacity: day.count > 0 ? 0.3 + (day.percentage / 100) * 0.7 : 0.3,
                        }}
                      />
                      <div className="text-sm font-medium mt-1">{day.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Distribution par heure */}
          {stats.hourDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Activité par heure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-24">
                  {stats.hourDistribution.map((hour) => (
                    <div
                      key={hour.hour}
                      className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t"
                      style={{
                        height: `${Math.max(4, hour.percentage * 4)}px`,
                        backgroundColor: hour.count > 0 ? 'hsl(var(--primary))' : undefined,
                        opacity: hour.count > 0 ? 0.3 + (hour.percentage / 100) * 0.7 : 0.2,
                      }}
                      title={`${hour.label}: ${hour.count} entrées`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0h</span>
                  <span>6h</span>
                  <span>12h</span>
                  <span>18h</span>
                  <span>23h</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags de contexte */}
          {stats.contextTagsDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Contextes les plus fréquents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stats.contextTagsDistribution.map((item) => (
                    <Badge key={item.tag} variant="outline" className="text-sm">
                      {item.tag} ({item.count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
