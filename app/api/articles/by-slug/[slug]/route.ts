import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const article = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
      with: {
        author: { columns: { id: true, email: true, nom: true, prenom: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 });
    }

    return NextResponse.json(article);
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Get article by slug error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
