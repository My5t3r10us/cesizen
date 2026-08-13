import { db } from '@/lib/db';
import { users, type User } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createTestUser(opts: {
  email?: string;
  password?: string;
  role?: 'user' | 'admin';
  isBanned?: boolean;
} = {}): Promise<{ user: User; token: string; password: string }> {
  const email = opts.email ?? `user-${Date.now()}-${Math.random()}@test.com`;
  const password = opts.password ?? 'Password123';
  const passwordHash = hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      nom: 'Test',
      prenom: 'User',
      role: opts.role ?? 'user',
      isBanned: opts.isBanned ?? false,
    })
    .returning();

  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    nom: user.nom,
    prenom: user.prenom,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);

  return { user, token, password };
}
