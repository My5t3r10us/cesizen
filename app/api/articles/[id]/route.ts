import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { articleSchema } from '@/lib/validation/schemas';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, id),
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
    console.error('Get article by id error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id: articleId } = await params;

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

    if (existingArticle && existingArticle.id !== articleId) {
      return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 });
    }

    await db
      .update(articles)
      .set({
        title: rawData.title,
        slug: rawData.slug,
        content: rawData.content,
        excerpt: rawData.excerpt,
        coverImage: rawData.coverImage,
        categoryId: rawData.categoryId,
        isPublished: rawData.isPublished,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, articleId));

    revalidatePath('/admin/articles');
    revalidatePath('/conseils');
    revalidatePath(`/conseils/${rawData.slug}`);
    return NextResponse.json({ success: true });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Update article error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id: articleId } = await params;

  try {
    await db.delete(articles).where(eq(articles.id, articleId));

    revalidatePath('/admin/articles');
    revalidatePath('/conseils');
    return NextResponse.json({ success: true });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
