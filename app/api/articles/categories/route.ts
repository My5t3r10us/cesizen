import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { articleCategories } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { reportApiError } from '@/lib/observability/api-telemetry';

export async function GET() {
  try {
    const categories = await db.query.articleCategories.findMany({
      orderBy: [asc(articleCategories.label)],
    });
    return NextResponse.json(categories);
  /* v8 ignore next 4 */
  } catch (error) {
    reportApiError(error, {
      operation: 'articles.categories.list',
      route: '/api/articles/categories',
      method: 'GET',
    });
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
