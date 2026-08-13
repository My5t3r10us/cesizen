import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { POST as registerPOST } from '@/app/api/auth/register/route';
import { POST as loginPOST } from '@/app/api/auth/login/route';
import { POST as logoutPOST } from '@/app/api/auth/logout/route';
import { GET as meGET } from '@/app/api/auth/me/route';
import { PATCH as profilePATCH } from '@/app/api/auth/profile/route';
import { PATCH as passwordPATCH } from '@/app/api/auth/password/route';
import { DELETE as accountDELETE } from '@/app/api/auth/account/route';
import { db } from '@/lib/db';
import { articles, entries, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { buildRequest, readJson } from '../helpers/request';
import { resetDb, seedEmotion } from '../helpers/db';
import { createTestUser } from '../helpers/auth';
import { clearTestCookies } from '../setup';

describe('Auth API', () => {
  beforeAll(async () => {
    await resetDb();
  });

  beforeEach(async () => {
    clearTestCookies();
    await resetDb();
  });

  describe('POST /api/auth/register', () => {
    it('creates a user and returns token', async () => {
      const req = buildRequest('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'new@test.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          nom: 'Doe',
          prenom: 'Jane',
        },
      });
      const res = await registerPOST(req);
      const { status, body } = await readJson<{ success: boolean; token: string }>(res);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    });

    it('rejects invalid input with 400 + fieldErrors', async () => {
      const req = buildRequest('/api/auth/register', {
        method: 'POST',
        body: { email: 'bad', password: 'short', confirmPassword: 'short' },
      });
      const res = await registerPOST(req);
      const { status, body } = await readJson<{ fieldErrors: Record<string, string[]> }>(res);
      expect(status).toBe(400);
      expect(body.fieldErrors).toBeDefined();
    });

    it('rejects duplicate email with 409', async () => {
      await createTestUser({ email: 'dup@test.com' });
      const req = buildRequest('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'dup@test.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        },
      });
      const res = await registerPOST(req);
      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('rejects invalid input with 400 + fieldErrors', async () => {
      const req = buildRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'not-an-email', password: 'x' },
      });
      const res = await loginPOST(req);
      const { status, body } = await readJson<{ fieldErrors: Record<string, string[]> }>(res);
      expect(status).toBe(400);
      expect(body.fieldErrors).toBeDefined();
    });

    it('authenticates an existing user', async () => {
      await createTestUser({ email: 'log@test.com', password: 'Password123' });
      const req = buildRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'log@test.com', password: 'Password123' },
      });
      const res = await loginPOST(req);
      const { status, body } = await readJson<{ success: boolean; token: string }>(res);
      expect(status).toBe(200);
      expect(body.token).toBeTruthy();
    });

    it('rejects wrong password with 401', async () => {
      await createTestUser({ email: 'log2@test.com', password: 'Password123' });
      const req = buildRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'log2@test.com', password: 'WrongPass1' },
      });
      const res = await loginPOST(req);
      expect(res.status).toBe(401);
    });

    it('rejects banned user with 403', async () => {
      await createTestUser({ email: 'ban@test.com', password: 'Password123', isBanned: true });
      const req = buildRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'ban@test.com', password: 'Password123' },
      });
      const res = await loginPOST(req);
      expect(res.status).toBe(403);
    });

    it('rejects unknown email with 401', async () => {
      const req = buildRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'nobody@test.com', password: 'Password123' },
      });
      const res = await loginPOST(req);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns null without token', async () => {
      const req = buildRequest('/api/auth/me');
      const res = await meGET(req);
      const { body } = await readJson(res);
      expect(body).toBeNull();
    });

    it('returns session with valid Bearer', async () => {
      const { user, token } = await createTestUser({ email: 'me@test.com' });
      const req = buildRequest('/api/auth/me', { token });
      const res = await meGET(req);
      const { body } = await readJson<{ userId: string; email: string }>(res);
      expect(body.userId).toBe(user.id);
      expect(body.email).toBe(user.email);
    });
  });

  describe('PATCH /api/auth/profile', () => {
    it('updates first name, last name, and email', async () => {
      const { user, token } = await createTestUser({
        email: 'profile@test.com',
        password: 'Password123',
      });
      const res = await profilePATCH(
        buildRequest('/api/auth/profile', {
          method: 'PATCH',
          token,
          body: {
            email: 'updated@test.com',
            nom: 'Updated',
            prenom: 'User',
            currentPassword: 'Password123',
          },
        })
      );
      const { status, body } = await readJson<{
        success: boolean;
        token: string;
        user: { userId: string; email: string; nom: string; prenom: string };
      }>(res);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.user.userId).toBe(user.id);
      expect(body.user.email).toBe('updated@test.com');
      expect(body.user.nom).toBe('Updated');
      expect(body.user.prenom).toBe('User');
      expect(body.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    });

    it('rejects duplicate email with 409', async () => {
      await createTestUser({ email: 'taken@test.com' });
      const { token } = await createTestUser({
        email: 'owner@test.com',
        password: 'Password123',
      });

      const res = await profilePATCH(
        buildRequest('/api/auth/profile', {
          method: 'PATCH',
          token,
          body: {
            email: 'taken@test.com',
            nom: 'Owner',
            prenom: 'User',
            currentPassword: 'Password123',
          },
        })
      );

      expect(res.status).toBe(409);
    });

    it('requires current password when changing email', async () => {
      const { token } = await createTestUser({
        email: 'needs-password@test.com',
        password: 'Password123',
      });

      const res = await profilePATCH(
        buildRequest('/api/auth/profile', {
          method: 'PATCH',
          token,
          body: {
            email: 'needs-password-updated@test.com',
            nom: 'User',
            prenom: 'Test',
          },
        })
      );

      expect(res.status).toBe(400);
    });

    it('rejects unauthenticated requests', async () => {
      const res = await profilePATCH(
        buildRequest('/api/auth/profile', {
          method: 'PATCH',
          body: { email: 'noauth@test.com' },
        })
      );

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/auth/password', () => {
    it('rejects wrong current password with 401', async () => {
      const { token } = await createTestUser({
        email: 'wrong-current@test.com',
        password: 'Password123',
      });

      const res = await passwordPATCH(
        buildRequest('/api/auth/password', {
          method: 'PATCH',
          token,
          body: {
            currentPassword: 'WrongPass1',
            newPassword: 'NewPassword123',
            confirmNewPassword: 'NewPassword123',
          },
        })
      );

      expect(res.status).toBe(401);
    });

    it('changes password and allows login with the new password', async () => {
      await createTestUser({
        email: 'change-password@test.com',
        password: 'Password123',
      });
      const loginRes = await loginPOST(
        buildRequest('/api/auth/login', {
          method: 'POST',
          body: { email: 'change-password@test.com', password: 'Password123' },
        })
      );
      const { body: loginBody } = await readJson<{ token: string }>(loginRes);

      const res = await passwordPATCH(
        buildRequest('/api/auth/password', {
          method: 'PATCH',
          token: loginBody.token,
          body: {
            currentPassword: 'Password123',
            newPassword: 'NewPassword123',
            confirmNewPassword: 'NewPassword123',
          },
        })
      );
      expect(res.status).toBe(200);

      const oldLoginRes = await loginPOST(
        buildRequest('/api/auth/login', {
          method: 'POST',
          body: { email: 'change-password@test.com', password: 'Password123' },
        })
      );
      expect(oldLoginRes.status).toBe(401);

      const newLoginRes = await loginPOST(
        buildRequest('/api/auth/login', {
          method: 'POST',
          body: { email: 'change-password@test.com', password: 'NewPassword123' },
        })
      );
      expect(newLoginRes.status).toBe(200);
    });
  });

  describe('DELETE /api/auth/account', () => {
    it('deletes the account and related entries and articles', async () => {
      const { user, token } = await createTestUser({
        email: 'delete-me@test.com',
        password: 'Password123',
        role: 'admin',
      });
      const { emotion } = await seedEmotion();

      await db.insert(entries).values({
        userId: user.id,
        emotionId: emotion.id,
        intensity: 6,
      });
      await db.insert(articles).values({
        title: 'Owned Article',
        slug: 'owned-article',
        content: 'Body',
        isPublished: true,
        authorId: user.id,
      });

      const res = await accountDELETE(
        buildRequest('/api/auth/account', {
          method: 'DELETE',
          token,
          body: { currentPassword: 'Password123' },
        })
      );
      expect(res.status).toBe(200);

      const deletedUser = await db.query.users.findFirst({ where: eq(users.id, user.id) });
      const deletedEntries = await db.query.entries.findMany({ where: eq(entries.userId, user.id) });
      const deletedArticles = await db.query.articles.findMany({ where: eq(articles.authorId, user.id) });

      expect(deletedUser).toBeUndefined();
      expect(deletedEntries).toHaveLength(0);
      expect(deletedArticles).toHaveLength(0);

      const loginRes = await loginPOST(
        buildRequest('/api/auth/login', {
          method: 'POST',
          body: { email: 'delete-me@test.com', password: 'Password123' },
        })
      );
      expect(loginRes.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('returns success', async () => {
      const res = await logoutPOST();
      const { status, body } = await readJson<{ success: boolean }>(res);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
    });
  });
});
