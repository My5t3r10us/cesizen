import { beforeEach, describe, expect, it, vi } from 'vitest';

const sentryMocks = vi.hoisted(() => ({
  captureException: vi.fn(() => 'event-id'),
  count: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  setTags: vi.fn(),
  setUser: vi.fn(),
  setContext: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({
  captureException: sentryMocks.captureException,
  metrics: {
    count: sentryMocks.count,
    distribution: vi.fn(),
  },
  logger: {
    error: sentryMocks.error,
    info: sentryMocks.info,
    warn: sentryMocks.warn,
  },
  withScope: (callback: (scope: {
    setTags: typeof sentryMocks.setTags;
    setUser: typeof sentryMocks.setUser;
    setContext: typeof sentryMocks.setContext;
  }) => unknown) =>
    callback({
      setTags: sentryMocks.setTags,
      setUser: sentryMocks.setUser,
      setContext: sentryMocks.setContext,
    }),
}));

import { reportApiError } from '@/lib/observability/api-telemetry';

describe('API telemetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('captures one exception with safe route context', () => {
    const error = new Error('database unavailable');
    const eventId = reportApiError(error, {
      operation: 'entries.create',
      route: '/api/entries',
      method: 'POST',
      role: 'user',
      userId: 'opaque-user-id',
    });

    expect(eventId).toBe('event-id');
    expect(sentryMocks.captureException).toHaveBeenCalledTimes(1);
    expect(sentryMocks.captureException).toHaveBeenCalledWith(error);
    expect(sentryMocks.setUser).toHaveBeenCalledWith({ id: 'opaque-user-id' });
    expect(sentryMocks.setTags).toHaveBeenCalledWith({
      'api.operation': 'entries.create',
      'api.route': '/api/entries',
      'api.method': 'POST',
      'user.role': 'user',
    });
    expect(sentryMocks.count).toHaveBeenCalledTimes(1);
    expect(sentryMocks.error).toHaveBeenCalledTimes(1);
  });
});
