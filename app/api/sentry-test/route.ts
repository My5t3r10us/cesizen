import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const environment =
    process.env.SENTRY_ENVIRONMENT ?? process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;

  if (
    environment !== 'staging' ||
    process.env.SENTRY_TEST_ROUTE_ENABLED !== 'true'
  ) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await getSessionFromRequest(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  throw new Error('Intentional Sentry test error');
}
