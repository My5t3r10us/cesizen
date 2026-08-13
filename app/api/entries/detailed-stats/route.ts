import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { entries } from '@/lib/db/schema';
import { getSessionFromRequest } from '@/lib/auth/session';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (!startDateParam || !endDateParam) {
      return NextResponse.json({ error: 'Paramètres startDate et endDate requis' }, { status: 400 });
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    const userEntries = await db.query.entries.findMany({
      where: and(
        eq(entries.userId, session.userId),
        gte(entries.createdAt, startDate),
        lte(entries.createdAt, endDate)
      ),
      with: { emotion: { with: { category: true } } },
      orderBy: [entries.createdAt],
    });

    if (userEntries.length === 0) {
      return NextResponse.json({
        totalEntries: 0,
        averageIntensity: 0,
        mostFrequentEmotion: null,
        mostFrequentCategory: null,
        emotionDistribution: [],
        categoryDistribution: [],
        dailyAverages: [],
        weekdayDistribution: [],
        hourDistribution: [],
        streakDays: 0,
        contextTagsDistribution: [],
      });
    }

    const totalEntries = userEntries.length;
    const averageIntensity = userEntries.reduce((sum, e) => sum + e.intensity, 0) / totalEntries;

    const emotionCounts: Record<string, { count: number; label: string; colorHex: string }> = {};
    userEntries.forEach((entry) => {
      const emotionId = entry.emotionId.toString();
      if (!emotionCounts[emotionId]) {
        emotionCounts[emotionId] = {
          count: 0,
          /* v8 ignore next 2 */
          label: entry.emotion?.label || 'Inconnu',
          colorHex: entry.emotion?.colorHex || entry.emotion?.category?.colorHex || '#888888',
        };
      }
      emotionCounts[emotionId].count++;
    });
    const emotionDistribution = Object.entries(emotionCounts)
      .map(([id, data]) => ({ id, ...data, percentage: (data.count / totalEntries) * 100 }))
      .sort((a, b) => b.count - a.count);

    const categoryCounts: Record<string, { count: number; label: string; colorHex: string }> = {};
    userEntries.forEach((entry) => {
      /* v8 ignore next */
      const categoryId = entry.emotion?.categoryId?.toString() || 'unknown';
      if (!categoryCounts[categoryId]) {
        categoryCounts[categoryId] = {
          count: 0,
          /* v8 ignore next 2 */
          label: entry.emotion?.category?.label || 'Inconnu',
          colorHex: entry.emotion?.category?.colorHex || '#888888',
        };
      }
      categoryCounts[categoryId].count++;
    });
    const categoryDistribution = Object.entries(categoryCounts)
      .map(([id, data]) => ({ id, ...data, percentage: (data.count / totalEntries) * 100 }))
      .sort((a, b) => b.count - a.count);

    const entriesByDay: Record<string, typeof userEntries> = {};
    userEntries.forEach((entry) => {
      const date = entry.createdAt.toISOString().split('T')[0];
      if (!entriesByDay[date]) entriesByDay[date] = [];
      entriesByDay[date].push(entry);
    });
    const dailyAverages = Object.entries(entriesByDay).map(([date, dayEntries]) => ({
      date,
      averageIntensity: dayEntries.reduce((sum, e) => sum + e.intensity, 0) / dayEntries.length,
      count: dayEntries.length,
    }));

    const weekdays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
    userEntries.forEach((entry) => {
      weekdayCounts[new Date(entry.createdAt).getDay()]++;
    });
    const weekdayDistribution = weekdays.map((label, index) => ({
      label,
      count: weekdayCounts[index],
      percentage: (weekdayCounts[index] / totalEntries) * 100,
    }));

    const hourCounts = Array(24).fill(0);
    userEntries.forEach((entry) => {
      hourCounts[new Date(entry.createdAt).getHours()]++;
    });
    const hourDistribution = hourCounts.map((count, hour) => ({
      hour,
      label: `${hour}h`,
      count,
      percentage: (count / totalEntries) * 100,
    }));

    const sortedDates = Object.keys(entriesByDay).sort();
    let streakDays = 0;
    let currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        currentStreak++;
      } else {
        streakDays = Math.max(streakDays, currentStreak);
        currentStreak = 1;
      }
    }
    streakDays = Math.max(streakDays, currentStreak);

    const tagCounts: Record<string, number> = {};
    userEntries.forEach((entry) => {
      entry.contextTags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const contextTagsDistribution = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count, percentage: (count / totalEntries) * 100 }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalEntries,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      /* v8 ignore next 2 */
      mostFrequentEmotion: emotionDistribution[0] || null,
      mostFrequentCategory: categoryDistribution[0] || null,
      emotionDistribution,
      categoryDistribution,
      dailyAverages,
      weekdayDistribution,
      hourDistribution,
      streakDays,
      contextTagsDistribution,
    });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Get detailed stats error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
