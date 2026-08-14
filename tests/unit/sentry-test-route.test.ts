import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const getSessionFromRequest = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/session', () => ({
  getSessionFromRequest,
}));

import { POST } from '@/app/api/sentry-test/route';

const originalEnvironment = process.env.SENTRY_ENVIRONMENT;
const originalTestRouteEnabled = process.env.SENTRY_TEST_ROUTE_ENABLED;

function createRequest() {
  return new NextRequest('http://localhost/api/sentry-test', {
    method: 'POST',
  });
}

afterEach(() => {
  vi.clearAllMocks();
  if (originalEnvironment === undefined) {
    delete process.env.SENTRY_ENVIRONMENT;
  } else {
    process.env.SENTRY_ENVIRONMENT = originalEnvironment;
  }

  if (originalTestRouteEnabled === undefined) {
    delete process.env.SENTRY_TEST_ROUTE_ENABLED;
  } else {
    process.env.SENTRY_TEST_ROUTE_ENABLED = originalTestRouteEnabled;
  }
});

describe('POST /api/sentry-test', () => {
  it('returns 404 when the route is disabled', async () => {
    process.env.SENTRY_ENVIRONMENT = 'staging';
    process.env.SENTRY_TEST_ROUTE_ENABLED = 'false';

    const response = await POST(createRequest());

    expect(response.status).toBe(404);
    expect(getSessionFromRequest).not.toHaveBeenCalled();
  });

  it('returns 403 for a non-admin session', async () => {
    process.env.SENTRY_ENVIRONMENT = 'staging';
    process.env.SENTRY_TEST_ROUTE_ENABLED = 'true';
    getSessionFromRequest.mockResolvedValue({
      userId: 'user-id',
      role: 'user',
    });

    const response = await POST(createRequest());

    expect(response.status).toBe(403);
  });

  it('throws an intentional error for an administrator', async () => {
    process.env.SENTRY_ENVIRONMENT = 'staging';
    process.env.SENTRY_TEST_ROUTE_ENABLED = 'true';
    getSessionFromRequest.mockResolvedValue({
      userId: 'admin-id',
      role: 'admin',
    });

    await expect(POST(createRequest())).rejects.toThrow(
      'Intentional Sentry test error',
    );
  });
});
