import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id: userId } = await params;

  if (userId === session.userId) {
    return NextResponse.json(
      { error: 'Vous ne pouvez pas modifier votre propre compte' },
      { status: 400 }
    );
  }

  try {
    const { action } = await request.json();

    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    if (action === 'toggleBan') {
      if (user.role === 'admin') {
        return NextResponse.json(
          { error: 'Vous ne pouvez pas bannir un administrateur' },
          { status: 400 }
        );
      }
      await db.update(users).set({ isBanned: !user.isBanned }).where(eq(users.id, userId));
    } else if (action === 'toggleRole') {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      await db.update(users).set({ role: newRole }).where(eq(users.id, userId));
    } else {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
    }

    revalidatePath('/admin/users');
    return NextResponse.json({ success: true });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Patch user error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id: userId } = await params;

  if (userId === session.userId) {
    return NextResponse.json(
      { error: 'Vous ne pouvez pas supprimer votre propre compte' },
      { status: 400 }
    );
  }

  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer un administrateur' },
        { status: 400 }
      );
    }

    await db.delete(users).where(eq(users.id, userId));

    revalidatePath('/admin/users');
    return NextResponse.json({ success: true });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
