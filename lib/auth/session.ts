import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { User } from '@/lib/db/schema';

/* v8 ignore next */
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-in-production');

export interface SessionPayload {
  userId: string; // UUID
  email: string;
  role: 'user' | 'admin';
  nom?: string | null;
  prenom?: string | null;
  expiresAt: Date;
}

export async function createSession(user: User): Promise<string> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    nom: user.nom,
    prenom: user.prenom,
    expiresAt: expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

/**
 * Lit la session depuis un Bearer token (mobile) ou le cookie (web).
 * Non-breaking : si aucun header Authorization, retombe sur getSession().
 */
export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const { payload } = await jwtVerify(token, secretKey);
      return payload as unknown as SessionPayload;
    } catch {
      return null;
    }
  }
  return getSession();
}
