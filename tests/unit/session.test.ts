import { describe, it, expect, beforeEach } from 'vitest';
import { SignJWT } from 'jose';
import {
  createSession,
  getSession,
  deleteSession,
  getSessionFromRequest,
} from '@/lib/auth/session';
import { clearTestCookies } from '../setup';

const fakeUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'user@test.com',
  passwordHash: 'x:y',
  nom: 'Doe',
  prenom: 'Jane',
  role: 'user' as const,
  isBanned: false,
  createdAt: new Date(),
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

function makeRequest(headers: Record<string, string> = {}) {
  return {
    headers: {
      get: (key: string) => headers[key.toLowerCase()] ?? null,
    },
  } as unknown as import('next/server').NextRequest;
}

describe('lib/auth/session', () => {
  beforeEach(() => {
    clearTestCookies();
  });

  it('createSession signs a valid JWT and getSession reads it', async () => {
    const token = await createSession(fakeUser);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const session = await getSession();
    expect(session?.userId).toBe(fakeUser.id);
    expect(session?.email).toBe(fakeUser.email);
    expect(session?.role).toBe('user');
  });

  it('deleteSession clears the cookie', async () => {
    await createSession(fakeUser);
    await deleteSession();
    expect(await getSession()).toBeNull();
  });

  it('getSessionFromRequest reads Bearer token', async () => {
    const token = await new SignJWT({
      userId: fakeUser.id,
      email: fakeUser.email,
      role: 'user',
      expiresAt: new Date(Date.now() + 86400_000).toISOString(),
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    const req = makeRequest({ authorization: `Bearer ${token}` });
    const session = await getSessionFromRequest(req);
    expect(session?.userId).toBe(fakeUser.id);
  });

  it('getSessionFromRequest returns null on invalid Bearer token', async () => {
    const req = makeRequest({ authorization: 'Bearer not-a-jwt' });
    expect(await getSessionFromRequest(req)).toBeNull();
  });

  it('getSessionFromRequest falls back to cookie when no Authorization header', async () => {
    await createSession(fakeUser);
    const req = makeRequest({});
    const session = await getSessionFromRequest(req);
    expect(session?.userId).toBe(fakeUser.id);
  });

  it('getSession returns null when cookie contains an invalid JWT', async () => {
    const { cookies } = await import('next/headers');
    const store = await cookies();
    (store as { set: (name: string, value: string) => void }).set('session', 'invalid-jwt-token');
    const result = await getSession();
    expect(result).toBeNull();
  });
});
