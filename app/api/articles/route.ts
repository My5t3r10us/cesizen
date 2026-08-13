import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { articleSchema } from '@/lib/validation/schemas';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('publishedOnly') === 'true';

    if (publishedOnly) {
      const data = await db.query.articles.findMany({
        where: eq(articles.isPublished, true),
        with: {
          author: { columns: { id: true, email: true, nom: true, prenom: true } },
          category: true,
        },
        orderBy: [desc(articles.createdAt)],
      });
      return NextResponse.json(data);
    }

    const data = await db.query.articles.findMany({
      with: {
        author: { columns: { id: true, email: true, nom: true, prenom: true } },
        category: true,
      },
      orderBy: [desc(articles.createdAt)],
    });
    return NextResponse.json(data);
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Get articles error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const body = await request.json();

    const rawData = {
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt || null,
      coverImage: body.coverImage || null,
      categoryId: body.categoryId ? parseInt(body.categoryId) : null,
      isPublished: body.isPublished === true || body.isPublished === 'true',
    };

    const validationResult = articleSchema.safeParse(rawData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation échouée',
          fieldErrors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.slug, rawData.slug),
    });

    if (existingArticle) {
      return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 });
    }

    await db.insert(articles).values({
      title: rawData.title,
      slug: rawData.slug,
      content: rawData.content,
      excerpt: rawData.excerpt,
      coverImage: rawData.coverImage,
      categoryId: rawData.categoryId,
      isPublished: rawData.isPublished,
      authorId: session.userId,
    });

    revalidatePath('/admin/articles');
    revalidatePath('/conseils');
    return NextResponse.json({ success: true });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Create article error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
