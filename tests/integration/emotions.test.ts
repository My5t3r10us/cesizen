import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET as emotionsGET } from '@/app/api/emotions/route';
import {
  GET as categoriesGET,
  POST as categoriesPOST,
} from '@/app/api/emotions/categories/route';
import { buildRequest, readJson } from '../helpers/request';
import { resetDb, seedEmotion } from '../helpers/db';
import { createTestUser } from '../helpers/auth';
import * as sessionModule from '@/lib/auth/session';

function mockAdminSession(userId: string, email: string) {
  vi.spyOn(sessionModule, 'getSession').mockResolvedValue({
    userId,
    email,
    role: 'admin',
    nom: 'Admin',
    prenom: 'Root',
    expiresAt: new Date(Date.now() + 86400_000),
  });
}

describe('Emotions API', () => {
  beforeEach(async () => {
    await resetDb();
    vi.restoreAllMocks();
  });

  describe('GET /api/emotions', () => {
    it('returns an empty array when no emotions exist', async () => {
      const res = await emotionsGET();
      const { status, body } = await readJson<unknown[]>(res);
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(0);
    });

    it('returns emotions after seeding', async () => {
      await seedEmotion();
      const res = await emotionsGET();
      const { status, body } = await readJson<unknown[]>(res);
      expect(status).toBe(200);
      expect(body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/emotions/categories', () => {
    it('returns an empty array when no categories exist', async () => {
      const res = await categoriesGET();
      const { status, body } = await readJson<unknown[]>(res);
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

    it('returns categories with emotions after seeding', async () => {
      await seedEmotion();
      const res = await categoriesGET();
      const { status, body } = await readJson<unknown[]>(res);
      expect(status).toBe(200);
      expect(body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/emotions/categories', () => {
    it('returns 403 without admin session', async () => {
      vi.spyOn(sessionModule, 'getSession').mockResolvedValue(null);
      const req = buildRequest('/api/emotions/categories', {
        method: 'POST',
        body: { label: 'Test', colorHex: '#FFFFFF', iconName: 'smile' },
      });
      const res = await categoriesPOST(req);
      expect(res.status).toBe(403);
    });

    it('returns 400 on validation error for admin', async () => {
      const admin = await createTestUser({ role: 'admin' });
      mockAdminSession(admin.user.id, admin.user.email);

      const req = buildRequest('/api/emotions/categories', {
        method: 'POST',
        body: { label: '', colorHex: 'invalid', iconName: '' },
      });
      const res = await categoriesPOST(req);
      const { status, body } = await readJson<{ fieldErrors: Record<string, string[]> }>(res);
      expect(status).toBe(400);
      expect(body.fieldErrors).toBeDefined();
    });

    it('creates category successfully for admin', async () => {
      const admin = await createTestUser({ role: 'admin' });
      mockAdminSession(admin.user.id, admin.user.email);

      const req = buildRequest('/api/emotions/categories', {
        method: 'POST',
        body: { label: 'Peur', colorHex: '#800080', iconName: 'fear' },
      });
      const res = await categoriesPOST(req);
      const { status, body } = await readJson<{ success: boolean }>(res);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
    });
  });
});
