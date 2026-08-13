import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emotionCategories } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const categorySchema = z.object({
  label: z.string().min(1, 'Le label est requis').max(100),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hex invalide'),
  iconName: z.string().min(1, "L'icône est requise").max(50),
});

export async function GET() {
  try {
    const categories = await db.query.emotionCategories.findMany({
      with: { emotions: true },
      orderBy: [asc(emotionCategories.label)],
    });
    return NextResponse.json(categories);
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Get emotion categories error:', error);
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

    await db.insert(emotionCategories).values(validation.data);

    revalidatePath('/admin/emotions');
    revalidatePath('/dashboard');
    return NextResponse.json({ success: true });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
