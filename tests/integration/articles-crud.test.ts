import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  GET as articleByIdGET,
  PUT as articleByIdPUT,
  DELETE as articleByIdDELETE,
} from '@/app/api/articles/[id]/route';
import { buildRequest, readJson } from '../helpers/request';
import { resetDb, seedArticleCategory } from '../helpers/db';
import { createTestUser } from '../helpers/auth';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import * as sessionModule from '@/lib/auth/session';

type Article = { id: string; title: string; slug: string; isPublished: boolean };

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

describe('Articles CRUD API (/api/articles/[id])', () => {
  beforeEach(async () => {
    await resetDb();
    vi.restoreAllMocks();
  });

  it('GET returns 404 when article does not exist', async () => {
    const res = await articleByIdGET(
      buildRequest('/api/articles/00000000-0000-0000-0000-000000000000'),
      { params: Promise.resolve({ id: '00000000-0000-0000-0000-000000000000' }) }
    );
    expect(res.status).toBe(404);
  });

  it('GET returns the article when it exists', async () => {
    const admin = await createTestUser({ role: 'admin' });
    const [article] = await db
      .insert(articles)
      .values({ title: 'Hello', slug: 'hello', content: 'Body', isPublished: true, authorId: admin.user.id })
      .returning();

    const res = await articleByIdGET(
      buildRequest(`/api/articles/${article.id}`),
      { params: Promise.resolve({ id: article.id }) }
    );
    const { status, body } = await readJson<Article>(res);
    expect(status).toBe(200);
    expect(body.title).toBe('Hello');
    expect(body.slug).toBe('hello');
  });

  it('PUT returns 403 without admin session', async () => {
    vi.spyOn(sessionModule, 'getSession').mockResolvedValue(null);
    const res = await articleByIdPUT(
      buildRequest('/api/articles/some-id', {
        method: 'PUT',
        body: { title: 't', slug: 's', content: 'x', isPublished: true },
      }),
      { params: Promise.resolve({ id: 'some-id' }) }
    );
    expect(res.status).toBe(403);
  });

  it('PUT returns 400 on validation error', async () => {
    const admin = await createTestUser({ role: 'admin' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await articleByIdPUT(
      buildRequest('/api/articles/some-id', {
        method: 'PUT',
        body: { title: '', slug: '', content: '' },
      }),
      { params: Promise.resolve({ id: 'some-id' }) }
    );
    const { status, body } = await readJson<{ fieldErrors: Record<string, string[]> }>(res);
    expect(status).toBe(400);
    expect(body.fieldErrors).toBeDefined();
  });

  it('PUT returns 409 when slug conflicts with another article', async () => {
    const admin = await createTestUser({ role: 'admin' });
    mockAdminSession(admin.user.id, admin.user.email);

    await db
      .insert(articles)
      .values({ title: 'Art1', slug: 'art1', content: 'x', isPublished: true, authorId: admin.user.id });
    const [art2] = await db
      .insert(articles)
      .values({ title: 'Art2', slug: 'art2', content: 'x', isPublished: true, authorId: admin.user.id })
      .returning();

    const res = await articleByIdPUT(
      buildRequest(`/api/articles/${art2.id}`, {
        method: 'PUT',
        body: { title: 'Art2 Updated', slug: 'art1', content: 'x', isPublished: true },
      }),
      { params: Promise.resolve({ id: art2.id }) }
    );
    expect(res.status).toBe(409);
  });

  it('PUT updates the article successfully', async () => {
    const admin = await createTestUser({ role: 'admin' });
    mockAdminSession(admin.user.id, admin.user.email);

    const [article] = await db
      .insert(articles)
      .values({ title: 'Original', slug: 'original', content: 'x', isPublished: false, authorId: admin.user.id })
      .returning();

    const res = await articleByIdPUT(
      buildRequest(`/api/articles/${article.id}`, {
        method: 'PUT',
        body: { title: 'Updated', slug: 'original', content: 'new content', isPublished: true },
      }),
      { params: Promise.resolve({ id: article.id }) }
    );
    const { status, body } = await readJson<{ success: boolean }>(res);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('DELETE returns 403 without admin session', async () => {
    vi.spyOn(sessionModule, 'getSession').mockResolvedValue(null);
    const res = await articleByIdDELETE(
      buildRequest('/api/articles/some-id', { method: 'DELETE' }),
      { params: Promise.resolve({ id: 'some-id' }) }
    );
    expect(res.status).toBe(403);
  });

  it('DELETE removes the article successfully', async () => {
    const admin = await createTestUser({ role: 'admin' });
    mockAdminSession(admin.user.id, admin.user.email);

    const [article] = await db
      .insert(articles)
      .values({ title: 'ToDelete', slug: 'to-delete', content: 'x', isPublished: false, authorId: admin.user.id })
      .returning();

    const res = await articleByIdDELETE(
      buildRequest(`/api/articles/${article.id}`, { method: 'DELETE' }),
      { params: Promise.resolve({ id: article.id }) }
    );
    const { status, body } = await readJson<{ success: boolean }>(res);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('PUT with same slug as itself succeeds (no conflict)', async () => {
    const admin = await createTestUser({ role: 'admin' });
    mockAdminSession(admin.user.id, admin.user.email);
    const cat = await seedArticleCategory();

    const [article] = await db
      .insert(articles)
      .values({ title: 'Same Slug', slug: 'same-slug', content: 'x', isPublished: true, authorId: admin.user.id, categoryId: cat.id })
      .returning();

    const res = await articleByIdPUT(
      buildRequest(`/api/articles/${article.id}`, {
        method: 'PUT',
        body: { title: 'Same Slug Updated', slug: 'same-slug', content: 'updated', isPublished: true, categoryId: String(cat.id) },
      }),
      { params: Promise.resolve({ id: article.id }) }
    );
    expect(res.status).toBe(200);
  });
});
