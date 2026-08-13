'use client';

import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MoodChartProps {
  data: {
    date: string;
    averageIntensity: number;
    count: number;
  }[];
}

export function MoodChart({ data }: MoodChartProps) {
  const chartData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'dd/MM', { locale: fr }),
    fullDate: format(parseISO(item.date), 'EEEE d MMMM', { locale: fr }),
    intensity: Math.round(item.averageIntensity * 10) / 10,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8A9A5B" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8A9A5B" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EBE0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#5A6B5A' }}
            tickLine={false}
            axisLine={{ stroke: '#D4DBC8' }}
          />
          <YAxis 
            domain={[0, 10]} 
            tick={{ fontSize: 12, fill: '#5A6B5A' }}
            tickLine={false}
            axisLine={{ stroke: '#D4DBC8' }}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 rounded-lg shadow-lg border border-border">
                    <p className="font-medium text-sm capitalize">{data.fullDate}</p>
                    <p className="text-primary font-bold">
                      Intensité: {data.intensity}/10
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {data.count} entrée(s)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="intensity"
            stroke="#8A9A5B"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorIntensity)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
