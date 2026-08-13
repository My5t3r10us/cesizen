import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  GET as articlesGET,
  POST as articlesPOST,
} from '@/app/api/articles/route';
import { GET as bySlugGET } from '@/app/api/articles/by-slug/[slug]/route';
import { GET as categoriesGET } from '@/app/api/articles/categories/route';
import { buildRequest, readJson } from '../helpers/request';
import { resetDb, seedArticleCategory } from '../helpers/db';
import { createTestUser } from '../helpers/auth';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
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

type Article = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  authorId: string;
};

describe('Articles API', () => {
  beforeEach(async () => {
    await resetDb();
    vi.restoreAllMocks();
  });

  it('GET /api/articles returns all articles by default', async () => {
    const admin = await createTestUser({ role: 'admin' });
    const cat = await seedArticleCategory();
    await db.insert(articles).values([
      { title: 'Pub', slug: 'pub', content: 'x', isPublished: true, authorId: admin.user.id, categoryId: cat.id },
      { title: 'Draft', slug: 'draft', content: 'x', isPublished: false, authorId: admin.user.id, categoryId: cat.id },
    ]);

    const res = await articlesGET(buildRequest('/api/articles'));
    const { body } = await readJson<Article[]>(res);
    expect(body).toHaveLength(2);
  });

  it('GET /api/articles?publishedOnly=true filters drafts', async () => {
    const admin = await createTestUser({ role: 'admin' });
    await db.insert(articles).values([
      { title: 'Pub', slug: 'pub', content: 'x', isPublished: true, authorId: admin.user.id },
      { title: 'Draft', slug: 'draft', content: 'x', isPublished: false, authorId: admin.user.id },
    ]);

    const res = await articlesGET(
      buildRequest('/api/articles', { query: { publishedOnly: 'true' } })
    );
    const { body } = await readJson<Article[]>(res);
    expect(body).toHaveLength(1);
    expect(body[0].slug).toBe('pub');
  });

  it('POST /api/articles requires admin role', async () => {
    vi.spyOn(sessionModule, 'getSession').mockResolvedValue(null);
    const res = await articlesPOST(
      buildRequest('/api/articles', {
        method: 'POST',
        body: { title: 't', slug: 'foo', content: 'x', isPublished: true },
      })
    );
    expect(res.status).toBe(403);
  });

  it('POST /api/articles returns 400 on validation error', async () => {
    const admin = await createTestUser({ role: 'admin' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await articlesPOST(
      buildRequest('/api/articles', {
        method: 'POST',
        body: { title: '', slug: '', content: '' },
      })
    );
    const { status, body } = await readJson<{ fieldErrors: Record<string, string[]> }>(res);
    expect(status).toBe(400);
    expect(body.fieldErrors).toBeDefined();
  });

  it('POST /api/articles returns 409 on slug conflict', async () => {
    const admin = await createTestUser({ role: 'admin' });
    mockAdminSession(admin.user.id, admin.user.email);

    await db.insert(articles).values({
      title: 'Existing', slug: 'existing', content: 'x', isPublished: true, authorId: admin.user.id,
    });

    const res = await articlesPOST(
      buildRequest('/api/articles', {
        method: 'POST',
        body: { title: 'New', slug: 'existing', content: 'x', isPublished: true },
      })
    );
    expect(res.status).toBe(409);
  });

  it('POST /api/articles creates article for admin', async () => {
    const admin = await createTestUser({ role: 'admin' });
    mockAdminSession(admin.user.id, admin.user.email);
    const cat = await seedArticleCategory();

    const res = await articlesPOST(
      buildRequest('/api/articles', {
        method: 'POST',
        body: { title: 'New Article', slug: 'new-article', content: 'Content here', isPublished: 'true', categoryId: String(cat.id) },
      })
    );
    const { status, body } = await readJson<{ success: boolean }>(res);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('GET /api/articles/by-slug/[slug] returns 404 if not found', async () => {
    const res = await bySlugGET(buildRequest('/api/articles/by-slug/nope'), {
      params: Promise.resolve({ slug: 'nope' }),
    });
    expect(res.status).toBe(404);
  });

  it('GET /api/articles/categories returns list', async () => {
    const res = await categoriesGET();
    const { status, body } = await readJson<unknown[]>(res);
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /api/articles/categories returns seeded categories', async () => {
    await seedArticleCategory();
    const res = await categoriesGET();
    const { status, body } = await readJson<unknown[]>(res);
    expect(status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
  });

  it('GET /api/articles/by-slug/[slug] returns the article', async () => {
    const admin = await createTestUser({ role: 'admin' });
    await db.insert(articles).values({
      title: 'Hello',
      slug: 'hello',
      content: '<p>Hi</p>',
      isPublished: true,
      authorId: admin.user.id,
    });
    const res = await bySlugGET(buildRequest('/api/articles/by-slug/hello'), {
      params: Promise.resolve({ slug: 'hello' }),
    });
    const { body } = await readJson<Article>(res);
    expect(body.title).toBe('Hello');
    expect(body.slug).toBe('hello');
  });
});
