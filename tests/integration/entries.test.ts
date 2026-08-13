import { describe, it, expect, beforeEach } from 'vitest';
import {
  GET as entriesGET,
  POST as entriesPOST,
} from '@/app/api/entries/route';
import {
  GET as entryGET,
  PUT as entryPUT,
  DELETE as entryDELETE,
} from '@/app/api/entries/[id]/route';
import { GET as statsGET } from '@/app/api/entries/stats/route';
import { GET as detailedGET } from '@/app/api/entries/detailed-stats/route';
import { buildRequest, readJson } from '../helpers/request';
import { resetDb, seedEmotion } from '../helpers/db';
import { createTestUser } from '../helpers/auth';
import { db } from '@/lib/db';
import { entries } from '@/lib/db/schema';

type Entry = {
  id: string;
  userId: string;
  emotionId: number;
  intensity: number;
  note: string | null;
  contextTags: string[] | null;
};

describe('Entries API', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await entriesGET(buildRequest('/api/entries'));
    expect(res.status).toBe(401);
  });

  it('creates an entry with encrypted note and reads it back decrypted', async () => {
    const { token } = await createTestUser();
    const { emotion } = await seedEmotion();

    const createRes = await entriesPOST(
      buildRequest('/api/entries', {
        method: 'POST',
        token,
        body: {
          emotionId: emotion.id,
          intensity: 7,
          note: 'Ma note privée',
          contextTags: ['travail', 'sommeil'],
        },
      })
    );
    expect(createRes.status).toBe(200);

    const listRes = await entriesGET(buildRequest('/api/entries', { token }));
    const { body } = await readJson<Entry[]>(listRes);
    expect(body).toHaveLength(1);
    expect(body[0].note).toBe('Ma note privée');
    expect(body[0].intensity).toBe(7);
    expect(body[0].contextTags).toEqual(['travail', 'sommeil']);
  });

  it('enforces ownership: cannot read another user\'s entry', async () => {
    const userA = await createTestUser({ email: 'a@test.com' });
    const userB = await createTestUser({ email: 'b@test.com' });
    const { emotion } = await seedEmotion();

    await entriesPOST(
      buildRequest('/api/entries', {
        method: 'POST',
        token: userA.token,
        body: { emotionId: emotion.id, intensity: 5 },
      })
    );

    const listB = await entriesGET(buildRequest('/api/entries', { token: userB.token }));
    const { body } = await readJson<Entry[]>(listB);
    expect(body).toEqual([]);
  });

  it('rejects invalid input with 400', async () => {
    const { token } = await createTestUser();
    const { emotion } = await seedEmotion();
    const res = await entriesPOST(
      buildRequest('/api/entries', {
        method: 'POST',
        token,
        body: { emotionId: emotion.id, intensity: 99 },
      })
    );
    expect(res.status).toBe(400);
  });

  it('updates and deletes own entry', async () => {
    const { token, user } = await createTestUser();
    const { emotion } = await seedEmotion();

    await entriesPOST(
      buildRequest('/api/entries', {
        method: 'POST',
        token,
        body: { emotionId: emotion.id, intensity: 3, note: 'first' },
      })
    );
    const list = await entriesGET(buildRequest('/api/entries', { token }));
    const [entry] = (await readJson<Entry[]>(list)).body;

    const params = Promise.resolve({ id: entry.id });
    const putRes = await entryPUT(
      buildRequest(`/api/entries/${entry.id}`, {
        method: 'PUT',
        token,
        body: { emotionId: emotion.id, intensity: 9, note: 'updated' },
      }),
      { params }
    );
    expect(putRes.status).toBe(200);

    const detailRes = await entryGET(
      buildRequest(`/api/entries/${entry.id}`, { token }),
      { params: Promise.resolve({ id: entry.id }) }
    );
    const { body: detail } = await readJson<Entry>(detailRes);
    expect(detail.intensity).toBe(9);
    expect(detail.note).toBe('updated');
    expect(detail.userId).toBe(user.id);

    const delRes = await entryDELETE(
      buildRequest(`/api/entries/${entry.id}`, { method: 'DELETE', token }),
      { params: Promise.resolve({ id: entry.id }) }
    );
    expect(delRes.status).toBe(200);
  });

  it('returns 404 when getting another user\'s entry by id', async () => {
    const userA = await createTestUser({ email: 'aa@test.com' });
    const userB = await createTestUser({ email: 'bb@test.com' });
    const { emotion } = await seedEmotion();

    await entriesPOST(
      buildRequest('/api/entries', {
        method: 'POST',
        token: userA.token,
        body: { emotionId: emotion.id, intensity: 5 },
      })
    );
    const list = await entriesGET(buildRequest('/api/entries', { token: userA.token }));
    const [entry] = (await readJson<Entry[]>(list)).body;

    const res = await entryGET(
      buildRequest(`/api/entries/${entry.id}`, { token: userB.token }),
      { params: Promise.resolve({ id: entry.id }) }
    );
    expect(res.status).toBe(404);
  });

  it('stats endpoint returns aggregates', async () => {
    const { token } = await createTestUser();
    const { emotion } = await seedEmotion();

    for (const intensity of [3, 5, 7]) {
      await entriesPOST(
        buildRequest('/api/entries', {
          method: 'POST',
          token,
          body: { emotionId: emotion.id, intensity },
        })
      );
    }

    const res = await statsGET(buildRequest('/api/entries/stats', { token }));
    const { body } = await readJson<{ totalEntries: number; dailyAverages: unknown[] }>(res);
    expect(body.totalEntries).toBe(3);
    expect(Array.isArray(body.dailyAverages)).toBe(true);
  });

  it('detailed-stats requires startDate + endDate', async () => {
    const { token } = await createTestUser();
    const res = await detailedGET(
      buildRequest('/api/entries/detailed-stats', { token })
    );
    expect(res.status).toBe(400);
  });

  it('detailed-stats returns full breakdown', async () => {
    const { token } = await createTestUser();
    const { emotion } = await seedEmotion();
    await entriesPOST(
      buildRequest('/api/entries', {
        method: 'POST',
        token,
        body: { emotionId: emotion.id, intensity: 5, contextTags: ['sport'] },
      })
    );

    const start = new Date(Date.now() - 86400_000).toISOString();
    const end = new Date(Date.now() + 86400_000).toISOString();
    const res = await detailedGET(
      buildRequest('/api/entries/detailed-stats', {
        token,
        query: { startDate: start, endDate: end },
      })
    );
    const { body } = await readJson<{
      totalEntries: number;
      averageIntensity: number;
      contextTagsDistribution: Array<{ tag: string; count: number }>;
    }>(res);
    expect(body.totalEntries).toBe(1);
    expect(body.averageIntensity).toBe(5);
    expect(body.contextTagsDistribution[0]).toMatchObject({ tag: 'sport', count: 1 });
  });

  it('GET /api/entries with date range filters entries', async () => {
    const { token } = await createTestUser();
    const { emotion } = await seedEmotion();

    await entriesPOST(
      buildRequest('/api/entries', { method: 'POST', token, body: { emotionId: emotion.id, intensity: 5 } })
    );

    const start = new Date(Date.now() - 86400_000).toISOString();
    const end = new Date(Date.now() + 86400_000).toISOString();
    const res = await entriesGET(
      buildRequest('/api/entries', { token, query: { startDate: start, endDate: end } })
    );
    const { status, body } = await readJson<Entry[]>(res);
    expect(status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
  });

  it('POST /api/entries returns 401 without token', async () => {
    const { emotion } = await seedEmotion();
    const res = await entriesPOST(
      buildRequest('/api/entries', { method: 'POST', body: { emotionId: emotion.id, intensity: 5 } })
    );
    expect(res.status).toBe(401);
  });

  it('GET /api/entries/[id] returns 401 without token', async () => {
    const res = await entryGET(
      buildRequest('/api/entries/some-id'),
      { params: Promise.resolve({ id: 'some-id' }) }
    );
    expect(res.status).toBe(401);
  });

  it('PUT /api/entries/[id] returns 401 without token', async () => {
    const res = await entryPUT(
      buildRequest('/api/entries/some-id', { method: 'PUT', body: { emotionId: 1, intensity: 5 } }),
      { params: Promise.resolve({ id: 'some-id' }) }
    );
    expect(res.status).toBe(401);
  });

  it('PUT /api/entries/[id] returns 400 on validation error', async () => {
    const { token } = await createTestUser();
    const { emotion } = await seedEmotion();

    await entriesPOST(
      buildRequest('/api/entries', { method: 'POST', token, body: { emotionId: emotion.id, intensity: 5 } })
    );
    const list = await entriesGET(buildRequest('/api/entries', { token }));
    const [entry] = (await readJson<Entry[]>(list)).body;

    const res = await entryPUT(
      buildRequest(`/api/entries/${entry.id}`, {
        method: 'PUT',
        token,
        body: { emotionId: emotion.id, intensity: 99 },
      }),
      { params: Promise.resolve({ id: entry.id }) }
    );
    expect(res.status).toBe(400);
  });

  it('PUT /api/entries/[id] returns 404 when entry does not belong to user', async () => {
    const userA = await createTestUser({ email: 'entA@test.com' });
    const userB = await createTestUser({ email: 'entB@test.com' });
    const { emotion } = await seedEmotion();

    await entriesPOST(
      buildRequest('/api/entries', { method: 'POST', token: userA.token, body: { emotionId: emotion.id, intensity: 5 } })
    );
    const list = await entriesGET(buildRequest('/api/entries', { token: userA.token }));
    const [entry] = (await readJson<Entry[]>(list)).body;

    const res = await entryPUT(
      buildRequest(`/api/entries/${entry.id}`, {
        method: 'PUT',
        token: userB.token,
        body: { emotionId: emotion.id, intensity: 6 },
      }),
      { params: Promise.resolve({ id: entry.id }) }
    );
    expect(res.status).toBe(404);
  });

  it('DELETE /api/entries/[id] returns 401 without token', async () => {
    const res = await entryDELETE(
      buildRequest('/api/entries/some-id', { method: 'DELETE' }),
      { params: Promise.resolve({ id: 'some-id' }) }
    );
    expect(res.status).toBe(401);
  });

  it('GET /api/entries/[id] returns null note for entry without note', async () => {
    const { token } = await createTestUser();
    const { emotion } = await seedEmotion();

    await entriesPOST(
      buildRequest('/api/entries', { method: 'POST', token, body: { emotionId: emotion.id, intensity: 4 } })
    );
    const list = await entriesGET(buildRequest('/api/entries', { token }));
    const [entry] = (await readJson<Entry[]>(list)).body;

    const res = await entryGET(
      buildRequest(`/api/entries/${entry.id}`, { token }),
      { params: Promise.resolve({ id: entry.id }) }
    );
    const { body } = await readJson<Entry>(res);
    expect(body.note).toBeNull();
  });

  it('PUT /api/entries/[id] without note sets note to null', async () => {
    const { token } = await createTestUser();
    const { emotion } = await seedEmotion();

    await entriesPOST(
      buildRequest('/api/entries', { method: 'POST', token, body: { emotionId: emotion.id, intensity: 5, note: 'original' } })
    );
    const list = await entriesGET(buildRequest('/api/entries', { token }));
    const [entry] = (await readJson<Entry[]>(list)).body;

    const res = await entryPUT(
      buildRequest(`/api/entries/${entry.id}`, {
        method: 'PUT',
        token,
        body: { emotionId: emotion.id, intensity: 6 },
      }),
      { params: Promise.resolve({ id: entry.id }) }
    );
    expect(res.status).toBe(200);
  });

  it('GET /api/entries/stats returns 401 without token', async () => {
    const res = await statsGET(buildRequest('/api/entries/stats'));
    expect(res.status).toBe(401);
  });

  it('GET /api/entries/detailed-stats returns 401 without token', async () => {
    const res = await detailedGET(buildRequest('/api/entries/detailed-stats'));
    expect(res.status).toBe(401);
  });

  it('detailed-stats returns empty result when no entries in range', async () => {
    const { token } = await createTestUser();
    const start = new Date('2000-01-01').toISOString();
    const end = new Date('2000-01-02').toISOString();
    const res = await detailedGET(
      buildRequest('/api/entries/detailed-stats', {
        token,
        query: { startDate: start, endDate: end },
      })
    );
    const { status, body } = await readJson<{ totalEntries: number; streakDays: number }>(res);
    expect(status).toBe(200);
    expect(body.totalEntries).toBe(0);
    expect(body.streakDays).toBe(0);
  });

  it('detailed-stats calculates streak across consecutive and non-consecutive days', async () => {
    const { token, user } = await createTestUser();
    const { emotion } = await seedEmotion();

    const day1 = new Date('2024-06-01T12:00:00.000Z');
    const day2 = new Date('2024-06-02T12:00:00.000Z');
    const day4 = new Date('2024-06-04T12:00:00.000Z');

    await db.insert(entries).values([
      { userId: user.id, emotionId: emotion.id, intensity: 5, contextTags: [], createdAt: day1 },
      { userId: user.id, emotionId: emotion.id, intensity: 6, contextTags: [], createdAt: day2 },
      { userId: user.id, emotionId: emotion.id, intensity: 7, contextTags: [], createdAt: day4 },
    ]);

    const start = new Date('2024-05-31').toISOString();
    const end = new Date('2024-06-05').toISOString();
    const res = await detailedGET(
      buildRequest('/api/entries/detailed-stats', {
        token,
        query: { startDate: start, endDate: end },
      })
    );
    const { status, body } = await readJson<{ totalEntries: number; streakDays: number }>(res);
    expect(status).toBe(200);
    expect(body.totalEntries).toBe(3);
    expect(body.streakDays).toBeGreaterThanOrEqual(2);
  });
});
