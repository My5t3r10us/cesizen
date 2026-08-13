import { NextRequest, NextResponse } from 'next/server';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { createSession, getSessionFromRequest } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import { profileUpdateSchema } from '@/lib/validation/schemas';

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validationResult = profileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation echouee',
          fieldErrors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, nom, prenom, currentPassword } = validationResult.data;
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouve' }, { status: 404 });
    }

    const emailChanged = email !== user.email;
    if (emailChanged && !currentPassword) {
      return NextResponse.json(
        {
          error: 'Le mot de passe actuel est requis pour modifier l\'email',
          fieldErrors: { currentPassword: ['Le mot de passe actuel est requis'] },
        },
        { status: 400 }
      );
    }

    if (emailChanged && currentPassword && !verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json(
        {
          error: 'Mot de passe actuel incorrect',
          fieldErrors: { currentPassword: ['Mot de passe actuel incorrect'] },
        },
        { status: 401 }
      );
    }

    if (emailChanged) {
      const existingUser = await db.query.users.findFirst({
        where: and(eq(users.email, email), ne(users.id, user.id)),
      });

      if (existingUser) {
        return NextResponse.json(
          {
            error: 'Un compte avec cet email existe deja',
            fieldErrors: { email: ['Un compte avec cet email existe deja'] },
          },
          { status: 409 }
        );
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        email,
        nom: nom || null,
        prenom: prenom || null,
      })
      .where(eq(users.id, user.id))
      .returning();

    const token = await createSession(updatedUser);

    return NextResponse.json({
      success: true,
      token,
      user: {
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        nom: updatedUser.nom,
        prenom: updatedUser.prenom,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
