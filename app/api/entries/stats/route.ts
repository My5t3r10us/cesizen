import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { entries } from '@/lib/db/schema';
import { getSessionFromRequest } from '@/lib/auth/session';
import { eq, and, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userEntries = await db.query.entries.findMany({
      where: and(eq(entries.userId, session.userId), gte(entries.createdAt, thirtyDaysAgo)),
      with: { emotion: true },
      orderBy: [entries.createdAt],
    });

    const entriesByDay = userEntries.reduce(
      (acc, entry) => {
        const date = entry.createdAt.toISOString().split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
        return acc;
      },
      {} as Record<string, typeof userEntries>
    );

    const dailyAverages = Object.entries(entriesByDay).map(([date, dayEntries]) => ({
      date,
      averageIntensity: dayEntries.reduce((sum, e) => sum + e.intensity, 0) / dayEntries.length,
      count: dayEntries.length,
    }));

    return NextResponse.json({
      totalEntries: userEntries.length,
      dailyAverages,
      recentEntries: userEntries.slice(-7),
    });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Get entries stats error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
