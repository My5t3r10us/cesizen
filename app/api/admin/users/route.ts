import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { desc } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const allUsers = await db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        isBanned: true,
        createdAt: true,
      },
      orderBy: [desc(users.createdAt)],
    });

    return NextResponse.json(allUsers);
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
