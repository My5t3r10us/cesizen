'use client';

import { useEffect, useState, useCallback } from 'react';
import { EntryCard } from './entry-card';

export function RecentEntries() {
  const [entries, setEntries] = useState<unknown[]>([]);
  const [emotions, setEmotions] = useState<unknown[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    Promise.all([
      fetch('/api/entries').then(r => r.json()),
      fetch('/api/emotions').then(r => r.json()),
    ]).then(([entriesData, emotionsData]) => {
      setEntries(Array.isArray(entriesData) ? entriesData.slice(0, 10) : []);
      setEmotions(Array.isArray(emotionsData) ? emotionsData : []);
    });
  }, [refreshKey]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Aucune entrée pour le moment.</p>
        <p className="text-sm mt-1">Commencez par enregistrer votre première humeur !</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(entries as Parameters<typeof EntryCard>[0]['entry'][]).map((entry) => (
        <EntryCard key={(entry as {id: string}).id} entry={entry as Parameters<typeof EntryCard>[0]['entry']} emotions={emotions as Parameters<typeof EntryCard>[0]['emotions']} onSuccess={refresh} />
      ))}
    </div>
  );
}
