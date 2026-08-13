import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emotions } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const emotionSchema = z.object({
  label: z.string().min(1, "Le label est requis").max(100),
  categoryId: z.number().int().positive('Catégorie requise'),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hex invalide').optional().nullable(),
  iconName: z.string().max(50).optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const emotion = await db.query.emotions.findFirst({
      where: eq(emotions.id, parseInt(id, 10)),
      with: { category: true },
    });

    if (!emotion) {
      return NextResponse.json({ error: 'Émotion non trouvée' }, { status: 404 });
    }

    return NextResponse.json(emotion);
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Get emotion by id error:', error);
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
    const validation = emotionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation échouée',
          fieldErrors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await db.update(emotions).set(validation.data).where(eq(emotions.id, parseInt(id, 10)));

    revalidatePath('/admin/emotions');
    revalidatePath('/dashboard');
    return NextResponse.json({ success: true });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Update emotion error:', error);
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
    await db.delete(emotions).where(eq(emotions.id, parseInt(id, 10)));

    revalidatePath('/admin/emotions');
    revalidatePath('/dashboard');
    return NextResponse.json({ success: true });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Delete emotion error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
