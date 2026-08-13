import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const allUsers = await db.query.users.findMany({
      columns: { id: true, role: true, isBanned: true, createdAt: true },
    });

    const totalUsers = allUsers.length;
    const bannedUsers = allUsers.filter((u) => u.isBanned).length;
    const admins = allUsers.filter((u) => u.role === 'admin').length;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = allUsers.filter((u) => u.createdAt >= oneWeekAgo).length;

    const allArticles = await db.query.articles.findMany({
      columns: { id: true, isPublished: true },
    });

    const totalArticles = allArticles.length;
    const publishedArticles = allArticles.filter((a) => a.isPublished).length;

    return NextResponse.json({
      totalUsers,
      bannedUsers,
      admins,
      newUsersThisWeek,
      totalArticles,
      publishedArticles,
    });
  /* v8 ignore next 4 */
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
