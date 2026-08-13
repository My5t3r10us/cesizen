import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emotionCategories } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const categorySchema = z.object({
  label: z.string().min(1, 'Le label est requis').max(100),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hex invalide'),
  iconName: z.string().min(1, "L'icône est requise").max(50),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const category = await db.query.emotionCategories.findFirst({
      where: eq(emotionCategories.id, parseInt(id, 10)),
      with: { emotions: true },
    });

    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }

    return NextResponse.json(category);
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Get category by id error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation échouée',
          fieldErrors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await db
      .update(emotionCategories)
      .set(validation.data)
      .where(eq(emotionCategories.id, parseInt(id, 10)));

    revalidatePath('/admin/emotions');
    revalidatePath('/dashboard');
    return NextResponse.json({ success: true });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id } = await params;

  try {
    await db.delete(emotionCategories).where(eq(emotionCategories.id, parseInt(id, 10)));

    revalidatePath('/admin/emotions');
    revalidatePath('/dashboard');
    return NextResponse.json({ success: true });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
