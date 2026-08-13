import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  GET as emotionByIdGET,
  PUT as emotionByIdPUT,
  DELETE as emotionByIdDELETE,
} from '@/app/api/emotions/[id]/route';
import {
  GET as emotionCatByIdGET,
  PUT as emotionCatByIdPUT,
  DELETE as emotionCatByIdDELETE,
} from '@/app/api/emotions/categories/[id]/route';
import { buildRequest, readJson } from '../helpers/request';
import { resetDb, seedEmotion } from '../helpers/db';
import { createTestUser } from '../helpers/auth';
import { db } from '@/lib/db';
import { emotionCategories } from '@/lib/db/schema';
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

describe('Emotions CRUD API (/api/emotions/[id])', () => {
  beforeEach(async () => {
    await resetDb();
    vi.restoreAllMocks();
  });

  it('GET returns 404 when emotion does not exist', async () => {
    const res = await emotionByIdGET(
      buildRequest('/api/emotions/9999'),
      { params: Promise.resolve({ id: '9999' }) }
    );
    expect(res.status).toBe(404);
  });

  it('GET returns the emotion when it exists', async () => {
    const { emotion } = await seedEmotion();
    const res = await emotionByIdGET(
      buildRequest(`/api/emotions/${emotion.id}`),
      { params: Promise.resolve({ id: String(emotion.id) }) }
    );
    const { status, body } = await readJson<{ id: number; label: string }>(res);
    expect(status).toBe(200);
    expect(body.label).toBe('Heureux');
  });

  it('PUT returns 403 without admin session', async () => {
    vi.spyOn(sessionModule, 'getSession').mockResolvedValue(null);
    const res = await emotionByIdPUT(
      buildRequest('/api/emotions/1', { method: 'PUT', body: { label: 'X', categoryId: 1 } }),
      { params: Promise.resolve({ id: '1' }) }
    );
    expect(res.status).toBe(403);
  });

  it('PUT returns 400 on validation error', async () => {
    const admin = await createTestUser({ role: 'admin' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await emotionByIdPUT(
      buildRequest('/api/emotions/1', {
        method: 'PUT',
        body: { label: '', categoryId: 'not-a-number' },
      }),
      { params: Promise.resolve({ id: '1' }) }
    );
    const { status, body } = await readJson<{ fieldErrors: Record<string, string[]> }>(res);
    expect(status).toBe(400);
    expect(body.fieldErrors).toBeDefined();
  });

  it('PUT updates the emotion successfully', async () => {
    const admin = await createTestUser({ role: 'admin' });
    mockAdminSession(admin.user.id, admin.user.email);
    const { emotion, category } = await seedEmotion();

    const res = await emotionByIdPUT(
      buildRequest(`/api/emotions/${emotion.id}`, {
        method: 'PUT',
        body: { label: 'Très heureux', categoryId: category.id },
      }),
      { params: Promise.resolve({ id: String(emotion.id) }) }
    );
    const { status, body } = await readJson<{ success: boolean }>(res);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('DELETE returns 403 without admin session', async () => {
    vi.spyOn(sessionModule, 'getSession').mockResolvedValue(null);
    const res = await emotionByIdDELETE(
      buildRequest('/api/emotions/1', { method: 'DELETE' }),
      { params: Promise.resolve({ id: '1' }) }
    );
    expect(res.status).toBe(403);
  });

  it('DELETE removes the emotion successfully', async () => {
    const admin = await createTestUser({ role: 'admin' });
    mockAdminSession(admin.user.id, admin.user.email);
    const { emotion } = await seedEmotion();

    const res = await emotionByIdDELETE(
      buildRequest(`/api/emotions/${emotion.id}`, { method: 'DELETE' }),
      { params: Promise.resolve({ id: String(emotion.id) }) }
    );
    const { status, body } = await readJson<{ success: boolean }>(res);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });
});

describe('Emotion Categories CRUD API (/api/emotions/categories/[id])', () => {
  beforeEach(async () => {
    await resetDb();
    vi.restoreAllMocks();
  });

  it('GET returns 404 when category does not exist', async () => {
    const res = await emotionCatByIdGET(
      buildRequest('/api/emotions/categories/9999'),
      { params: Promise.resolve({ id: '9999' }) }
    );
    expect(res.status).toBe(404);
  });

  it('GET returns the category when it exists', async () => {
    const [cat] = await db
      .insert(emotionCategories)
      .values({ label: 'Tristesse', colorHex: '#0000FF', iconName: 'sad' })
      .returning();

    const res = await emotionCatByIdGET(
      buildRequest(`/api/emotions/categories/${cat.id}`),
      { params: Promise.resolve({ id: String(cat.id) }) }
    );
    const { status, body } = await readJson<{ id: number; label: string }>(res);
    expect(status).toBe(200);
    expect(body.label).toBe('Tristesse');
  });

  it('PUT returns 403 without admin session', async () => {
    vi.spyOn(sessionModule, 'getSession').mockResolvedValue(null);
    const res = await emotionCatByIdPUT(
      buildRequest('/api/emotions/categories/1', {
        method: 'PUT',
        body: { label: 'X', colorHex: '#FF0000', iconName: 'icon' },
      }),
      { params: Promise.resolve({ id: '1' }) }
    );
    expect(res.status).toBe(403);
  });

  it('PUT returns 400 on validation error', async () => {
    const admin = await createTestUser({ role: 'admin' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await emotionCatByIdPUT(
      buildRequest('/api/emotions/categories/1', {
        method: 'PUT',
        body: { label: '', colorHex: 'bad-color', iconName: '' },
      }),
      { params: Promise.resolve({ id: '1' }) }
    );
    const { status, body } = await readJson<{ fieldErrors: Record<string, string[]> }>(res);
    expect(status).toBe(400);
    expect(body.fieldErrors).toBeDefined();
  });

  it('PUT updates the category successfully', async () => {
    const admin = await createTestUser({ role: 'admin' });
    mockAdminSession(admin.user.id, admin.user.email);

    const [cat] = await db
      .insert(emotionCategories)
      .values({ label: 'Joie', colorHex: '#FFD700', iconName: 'smile' })
      .returning();

    const res = await emotionCatByIdPUT(
      buildRequest(`/api/emotions/categories/${cat.id}`, {
        method: 'PUT',
        body: { label: 'Grande Joie', colorHex: '#FFD700', iconName: 'smile' },
      }),
      { params: Promise.resolve({ id: String(cat.id) }) }
    );
    const { status, body } = await readJson<{ success: boolean }>(res);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('DELETE returns 403 without admin session', async () => {
    vi.spyOn(sessionModule, 'getSession').mockResolvedValue(null);
    const res = await emotionCatByIdDELETE(
      buildRequest('/api/emotions/categories/1', { method: 'DELETE' }),
      { params: Promise.resolve({ id: '1' }) }
    );
    expect(res.status).toBe(403);
  });

  it('DELETE removes the category successfully', async () => {
    const admin = await createTestUser({ role: 'admin' });
    mockAdminSession(admin.user.id, admin.user.email);

    const [cat] = await db
      .insert(emotionCategories)
      .values({ label: 'Colère', colorHex: '#FF0000', iconName: 'angry' })
      .returning();

    const res = await emotionCatByIdDELETE(
      buildRequest(`/api/emotions/categories/${cat.id}`, { method: 'DELETE' }),
      { params: Promise.resolve({ id: String(cat.id) }) }
    );
    const { status, body } = await readJson<{ success: boolean }>(res);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });
});
