import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { articles, users } from '@/lib/db/schema';
import { deleteSession, getSessionFromRequest } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import { deleteAccountSchema } from '@/lib/validation/schemas';

export async function DELETE(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validationResult = deleteAccountSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation echouee',
          fieldErrors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouve' }, { status: 404 });
    }

    if (!verifyPassword(validationResult.data.currentPassword, user.passwordHash)) {
      return NextResponse.json(
        {
          error: 'Mot de passe actuel incorrect',
          fieldErrors: { currentPassword: ['Mot de passe actuel incorrect'] },
        },
        { status: 401 }
      );
    }

    await db.transaction(async (tx) => {
      await tx.delete(articles).where(eq(articles.authorId, user.id));
      await tx.delete(users).where(eq(users.id, user.id));
    });

    await deleteSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
