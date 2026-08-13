import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PATCH as userPATCH,
  DELETE as userDELETE,
} from '@/app/api/admin/users/[id]/route';
import { GET as usersGET } from '@/app/api/admin/users/route';
import { GET as adminStatsGET } from '@/app/api/admin/stats/route';
import { buildRequest, readJson } from '../helpers/request';
import { resetDb } from '../helpers/db';
import { createTestUser } from '../helpers/auth';
import * as sessionModule from '@/lib/auth/session';

/**
 * Admin endpoints use getSession() (cookie-only). On simule la session
 * via un mock direct du module pour les tests.
 */
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

function clearSessionMock() {
  vi.restoreAllMocks();
}

describe('Admin API', () => {
  beforeEach(async () => {
    await resetDb();
    clearSessionMock();
  });

  it('GET /api/admin/users returns 403 without admin session', async () => {
    vi.spyOn(sessionModule, 'getSession').mockResolvedValue(null);
    const res = await usersGET();
    expect(res.status).toBe(403);
  });

  it('GET /api/admin/users returns user list for admin', async () => {
    const admin = await createTestUser({ role: 'admin', email: 'root@test.com' });
    await createTestUser({ email: 'u1@test.com' });
    await createTestUser({ email: 'u2@test.com' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await usersGET();
    const { body } = await readJson<Array<{ email: string }>>(res);
    expect(body.length).toBeGreaterThanOrEqual(3);
  });

  it('admin cannot ban or modify themselves', async () => {
    const admin = await createTestUser({ role: 'admin', email: 'root@test.com' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await userPATCH(
      buildRequest(`/api/admin/users/${admin.user.id}`, {
        method: 'PATCH',
        body: { action: 'toggleBan' },
      }),
      { params: Promise.resolve({ id: admin.user.id }) }
    );
    expect(res.status).toBe(400);
  });

  it('admin cannot ban another admin', async () => {
    const admin = await createTestUser({ role: 'admin', email: 'root@test.com' });
    const other = await createTestUser({ role: 'admin', email: 'other@test.com' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await userPATCH(
      buildRequest(`/api/admin/users/${other.user.id}`, {
        method: 'PATCH',
        body: { action: 'toggleBan' },
      }),
      { params: Promise.resolve({ id: other.user.id }) }
    );
    expect(res.status).toBe(400);
  });

  it('admin can toggle ban on a regular user', async () => {
    const admin = await createTestUser({ role: 'admin', email: 'root@test.com' });
    const target = await createTestUser({ email: 'target@test.com' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await userPATCH(
      buildRequest(`/api/admin/users/${target.user.id}`, {
        method: 'PATCH',
        body: { action: 'toggleBan' },
      }),
      { params: Promise.resolve({ id: target.user.id }) }
    );
    expect(res.status).toBe(200);
  });

  it('admin cannot delete another admin', async () => {
    const admin = await createTestUser({ role: 'admin', email: 'root@test.com' });
    const other = await createTestUser({ role: 'admin', email: 'other@test.com' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await userDELETE(
      buildRequest(`/api/admin/users/${other.user.id}`, { method: 'DELETE' }),
      { params: Promise.resolve({ id: other.user.id }) }
    );
    expect(res.status).toBe(400);
  });

  it('GET /api/admin/stats returns aggregate counts', async () => {
    const admin = await createTestUser({ role: 'admin', email: 'root@test.com' });
    await createTestUser({ email: 'u1@test.com' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await adminStatsGET();
    const { body } = await readJson<{
      totalUsers: number;
      admins: number;
      bannedUsers: number;
      totalArticles: number;
    }>(res);
    expect(body.totalUsers).toBeGreaterThanOrEqual(2);
    expect(body.admins).toBeGreaterThanOrEqual(1);
    expect(body.totalArticles).toBe(0);
  });

  it('GET /api/admin/stats returns 403 without admin session', async () => {
    vi.spyOn(sessionModule, 'getSession').mockResolvedValue(null);
    const res = await adminStatsGET();
    expect(res.status).toBe(403);
  });

  it('PATCH user returns 403 without admin session', async () => {
    vi.spyOn(sessionModule, 'getSession').mockResolvedValue(null);
    const res = await userPATCH(
      buildRequest('/api/admin/users/some-id', { method: 'PATCH', body: { action: 'toggleBan' } }),
      { params: Promise.resolve({ id: 'some-id' }) }
    );
    expect(res.status).toBe(403);
  });

  it('PATCH user returns 404 when user does not exist', async () => {
    const admin = await createTestUser({ role: 'admin', email: 'root@test.com' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await userPATCH(
      buildRequest('/api/admin/users/00000000-0000-0000-0000-000000000000', {
        method: 'PATCH',
        body: { action: 'toggleBan' },
      }),
      { params: Promise.resolve({ id: '00000000-0000-0000-0000-000000000000' }) }
    );
    expect(res.status).toBe(404);
  });

  it('PATCH user toggleRole promotes a user to admin', async () => {
    const admin = await createTestUser({ role: 'admin', email: 'root@test.com' });
    const target = await createTestUser({ email: 'promote@test.com' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await userPATCH(
      buildRequest(`/api/admin/users/${target.user.id}`, {
        method: 'PATCH',
        body: { action: 'toggleRole' },
      }),
      { params: Promise.resolve({ id: target.user.id }) }
    );
    expect(res.status).toBe(200);
  });

  it('PATCH user toggleRole demotes an admin to user', async () => {
    const admin = await createTestUser({ role: 'admin', email: 'root@test.com' });
    const otherAdmin = await createTestUser({ role: 'admin', email: 'other-admin@test.com' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await userPATCH(
      buildRequest(`/api/admin/users/${otherAdmin.user.id}`, {
        method: 'PATCH',
        body: { action: 'toggleRole' },
      }),
      { params: Promise.resolve({ id: otherAdmin.user.id }) }
    );
    expect(res.status).toBe(200);
  });

  it('PATCH user returns 400 on invalid action', async () => {
    const admin = await createTestUser({ role: 'admin', email: 'root@test.com' });
    const target = await createTestUser({ email: 'target2@test.com' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await userPATCH(
      buildRequest(`/api/admin/users/${target.user.id}`, {
        method: 'PATCH',
        body: { action: 'invalidAction' },
      }),
      { params: Promise.resolve({ id: target.user.id }) }
    );
    expect(res.status).toBe(400);
  });

  it('DELETE user returns 403 without admin session', async () => {
    vi.spyOn(sessionModule, 'getSession').mockResolvedValue(null);
    const res = await userDELETE(
      buildRequest('/api/admin/users/some-id', { method: 'DELETE' }),
      { params: Promise.resolve({ id: 'some-id' }) }
    );
    expect(res.status).toBe(403);
  });

  it('DELETE user returns 400 when admin tries to delete themselves', async () => {
    const admin = await createTestUser({ role: 'admin', email: 'root@test.com' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await userDELETE(
      buildRequest(`/api/admin/users/${admin.user.id}`, { method: 'DELETE' }),
      { params: Promise.resolve({ id: admin.user.id }) }
    );
    expect(res.status).toBe(400);
  });

  it('DELETE user returns 404 when user does not exist', async () => {
    const admin = await createTestUser({ role: 'admin', email: 'root@test.com' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await userDELETE(
      buildRequest('/api/admin/users/00000000-0000-0000-0000-000000000000', { method: 'DELETE' }),
      { params: Promise.resolve({ id: '00000000-0000-0000-0000-000000000000' }) }
    );
    expect(res.status).toBe(404);
  });

  it('DELETE user removes a regular user successfully', async () => {
    const admin = await createTestUser({ role: 'admin', email: 'root@test.com' });
    const target = await createTestUser({ email: 'remove@test.com' });
    mockAdminSession(admin.user.id, admin.user.email);

    const res = await userDELETE(
      buildRequest(`/api/admin/users/${target.user.id}`, { method: 'DELETE' }),
      { params: Promise.resolve({ id: target.user.id }) }
    );
    const { status, body } = await readJson<{ success: boolean }>(res);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });
});
