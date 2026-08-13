'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EntryCard } from './entry-card';

interface JournalEntry {
  id: string;
  emotionId: number;
  intensity: number;
  note: string | null;
  contextTags: string[] | null;
  createdAt: Date;
  emotion: {
    id: number;
    label: string;
    colorHex: string | null;
    iconName: string | null;
    categoryId: number;
  } | null;
}

type EmotionWithCategory = {
  id: number;
  label: string;
  colorHex?: string | null;
  iconName?: string | null;
  categoryId: number;
  category?: {
    id: number;
    label: string;
    colorHex: string;
    iconName: string;
    createdAt: Date;
  } | null;
};

interface JournalCalendarProps {
  entries: JournalEntry[];
  emotions: EmotionWithCategory[];
  onSuccess?: () => void;
}

export function JournalCalendar({ entries, emotions, onSuccess }: JournalCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Trouver les dates avec des entrées
  const datesWithEntries = entries.map(entry => new Date(entry.createdAt));
  
  // Entrées pour la date sélectionnée
  const selectedEntries = selectedDate 
    ? entries.filter(entry => isSameDay(new Date(entry.createdAt), selectedDate))
    : [];

  // Modifier le style des jours avec des entrées
  const modifiers = {
    hasEntry: datesWithEntries,
  };

  const modifiersStyles = {
    hasEntry: {
      backgroundColor: 'rgba(138, 154, 91, 0.2)',
      borderRadius: '50%',
    },
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={fr}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="rounded-md border"
        />
      </div>

      <div>
        <h3 className="font-semibold mb-4">
          {selectedDate 
            ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })
            : 'Sélectionnez une date'}
        </h3>

        {selectedEntries.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucune entrée pour cette date.
          </p>
        ) : (
          <div className="space-y-4">
            {selectedEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} emotions={emotions} onSuccess={onSuccess} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
