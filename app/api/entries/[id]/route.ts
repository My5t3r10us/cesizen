import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { entries } from '@/lib/db/schema';
import { getSessionFromRequest } from '@/lib/auth/session';
import { encryptNote, decryptNote } from '@/lib/security/encryption';
import { entrySchema } from '@/lib/validation/schemas';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { id: entryId } = await params;

  try {
    const entry = await db.query.entries.findFirst({
      where: and(eq(entries.id, entryId), eq(entries.userId, session.userId)),
      with: { emotion: true },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entrée non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      ...entry,
      note: entry.noteEncrypted ? await decryptNote(entry.noteEncrypted) : null,
      noteEncrypted: undefined,
    });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Get entry by id error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { id: entryId } = await params;

  try {
    const body = await request.json();

    const rawData = {
      emotionId: parseInt(body.emotionId),
      intensity: parseInt(body.intensity),
      note: body.note || undefined,
      contextTags: body.contextTags || [],
    };

    const validationResult = entrySchema.safeParse(rawData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation échouée',
          fieldErrors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existingEntry = await db.query.entries.findFirst({
      where: and(eq(entries.id, entryId), eq(entries.userId, session.userId)),
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Entrée non trouvée' }, { status: 404 });
    }

    const { emotionId, intensity, note, contextTags } = validationResult.data;
    const noteEncrypted = note ? await encryptNote(note) : null;

    await db
      .update(entries)
      /* v8 ignore next */
      .set({ emotionId, intensity, noteEncrypted, contextTags: contextTags || [] })
      .where(eq(entries.id, entryId));

    revalidatePath('/dashboard');
    return NextResponse.json({ success: true });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Update entry error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { id: entryId } = await params;

  try {
    await db.delete(entries).where(
      and(eq(entries.id, entryId), eq(entries.userId, session.userId))
    );

    revalidatePath('/dashboard');
    return NextResponse.json({ success: true });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Delete entry error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
