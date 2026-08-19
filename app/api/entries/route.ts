import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { entries } from '@/lib/db/schema';
import { getSessionFromRequest } from '@/lib/auth/session';
import { encryptNote, decryptNote } from '@/lib/security/encryption';
import { entrySchema } from '@/lib/validation/schemas';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import {
  recordApiLatency,
  recordBusinessOperation,
  reportApiError,
} from '@/lib/observability/api-telemetry';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const context = {
    operation: 'entries.list',
    route: '/api/entries',
    method: 'GET',
    role: session.role,
    userId: session.userId,
  };
  const startedAt = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let whereClause = eq(entries.userId, session.userId);

    if (startDateParam && endDateParam) {
      whereClause = and(
        eq(entries.userId, session.userId),
        gte(entries.createdAt, new Date(startDateParam)),
        lte(entries.createdAt, new Date(endDateParam))
      )!;
    }

    const userEntries = await db.query.entries.findMany({
      where: whereClause,
      with: { emotion: true },
      orderBy: [desc(entries.createdAt)],
    });

    const decryptedEntries = await Promise.all(
      userEntries.map(async (entry) => ({
        ...entry,
        note: entry.noteEncrypted ? await decryptNote(entry.noteEncrypted) : null,
        noteEncrypted: undefined,
      }))
    );

    return NextResponse.json(decryptedEntries);
  /* v8 ignore next 4 */
  } catch (error) {
    reportApiError(error, context);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  } finally {
    recordApiLatency(context, startedAt);
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const context = {
    operation: 'entries.create',
    route: '/api/entries',
    method: 'POST',
    role: session.role,
    userId: session.userId,
  };
  const startedAt = Date.now();

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

    const { emotionId, intensity, note, contextTags } = validationResult.data;
    const noteEncrypted = note ? await encryptNote(note) : null;

    await db.insert(entries).values({
      userId: session.userId,
      emotionId,
      intensity,
      noteEncrypted,
      /* v8 ignore next */
      contextTags: contextTags || [],
    });

    revalidatePath('/dashboard');
    recordBusinessOperation(context);
    return NextResponse.json({ success: true });
  /* v8 ignore next 4 */
  } catch (error) {
    reportApiError(error, context);
    return NextResponse.json({ error: "Une erreur est survenue lors de l'enregistrement" }, { status: 500 });
  } finally {
    recordApiLatency(context, startedAt);
  }
}
