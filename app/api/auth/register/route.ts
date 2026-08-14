import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { registerSchema } from '@/lib/validation/schemas';
import {
  recordApiLatency,
  recordBusinessOperation,
  reportApiError,
} from '@/lib/observability/api-telemetry';

export async function POST(request: NextRequest) {
  const context = { operation: 'auth.register', route: '/api/auth/register', method: 'POST' };
  const startedAt = Date.now();

  try {
    const body = await request.json();

    const validationResult = registerSchema.safeParse(body);
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

    const { email, password, nom, prenom } = validationResult.data;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      recordBusinessOperation(context, 'failure');
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ email, passwordHash, nom, prenom, role: 'user' })
      .returning();

    const token = await createSession(newUser);
    recordBusinessOperation({ ...context, role: newUser.role, userId: newUser.id });

    return NextResponse.json({ success: true, token });
  /* v8 ignore next 7 */
  } catch (error) {
    reportApiError(error, context);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  } finally {
    recordApiLatency(context, startedAt);
  }
}
