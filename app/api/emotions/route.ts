import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emotions } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const allEmotions = await db.query.emotions.findMany({
      with: { category: true },
      orderBy: [asc(emotions.label)],
    });
    return NextResponse.json(allEmotions);
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Get emotions error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
