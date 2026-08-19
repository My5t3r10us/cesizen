import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { loginSchema } from '@/lib/validation/schemas';
import {
  recordApiLatency,
  recordBusinessOperation,
  reportApiError,
} from '@/lib/observability/api-telemetry';

export async function POST(request: NextRequest) {
  const context = { operation: 'auth.login', route: '/api/auth/login', method: 'POST' };
  const startedAt = Date.now();

  try {
    const body = await request.json();

    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      recordBusinessOperation(context, 'failure');
      return NextResponse.json(
        {
          error: 'Validation échouée',
          fieldErrors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      recordBusinessOperation(context, 'failure');
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    if (user.isBanned) {
      recordBusinessOperation(context, 'failure');
      return NextResponse.json(
        { error: "Votre compte a été suspendu. Contactez l'administrateur." },
        { status: 403 }
      );
    }

    const isValidPassword = verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      recordBusinessOperation(context, 'failure');
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const token = await createSession(user);
    recordBusinessOperation({ ...context, role: user.role, userId: user.id });

    return NextResponse.json({ success: true, token });
  /* v8 ignore next 7 */
  } catch (error) {
    reportApiError(error, context);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  } finally {
    recordApiLatency(context, startedAt);
  }
}
