import { StatsView } from '@/components/dashboard/stats-view';
import { BarChart3 } from 'lucide-react';

export default function StatistiquesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 md:h-7 md:w-7 text-primary" />
          Statistiques
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Analysez vos tendances émotionnelles sur la période de votre choix
        </p>
      </div>

      <StatsView />
    </div>
  );
}
