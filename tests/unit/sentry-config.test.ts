import { describe, expect, it } from 'vitest';
import {
  getSentrySampling,
  isSentryEnabled,
  normalizeSentryEnvironment,
  scrubSentryBreadcrumb,
  scrubSentryEvent,
} from '@/lib/observability/sentry-config';

describe('Sentry configuration', () => {
  it('only enables collection for staging and production with a DSN', () => {
    expect(isSentryEnabled({ dsn: 'https://example.invalid/1', environment: 'production' })).toBe(true);
    expect(isSentryEnabled({ dsn: 'https://example.invalid/1', environment: 'staging' })).toBe(true);
    expect(isSentryEnabled({ dsn: 'https://example.invalid/1', environment: 'development' })).toBe(false);
    expect(isSentryEnabled({ environment: 'production' })).toBe(false);
  });

  it('normalizes prod and applies economical sampling', () => {
    expect(normalizeSentryEnvironment(' PROD ')).toBe('production');
    expect(getSentrySampling('production')).toEqual({
      tracesSampleRate: 0.02,
      profileSessionSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1,
    });
    expect(getSentrySampling('staging').tracesSampleRate).toBe(0.1);
  });

  it('removes request secrets, query strings and named user data', () => {
    const event = scrubSentryEvent({
      request: {
        url: 'https://cesizen.example/api/entries?startDate=secret',
        headers: { authorization: 'Bearer token' },
        cookies: { session: 'jwt' },
        data: { note: 'private note' },
        query_string: 'startDate=secret',
      },
      user: {
        id: 'opaque-user-id',
        email: 'person@example.com',
        username: 'Person',
        ip_address: '127.0.0.1',
      },
      contexts: {
        profile: {
          email: 'person@example.com',
          role: 'user',
        },
      },
    });

    expect(event.request).toEqual({
      url: 'https://cesizen.example/api/entries',
    });
    expect(event.user).toEqual({ id: 'opaque-user-id' });
    expect(event.contexts.profile.email).toBe('[Filtered]');
    expect(event.contexts.profile.role).toBe('user');
  });

  it('redacts emails and bearer tokens from breadcrumbs', () => {
    const breadcrumb = scrubSentryBreadcrumb({
      message: 'Login person@example.com with Bearer abc.def.ghi',
    });

    expect(breadcrumb.message).toBe('Login [Filtered] with Bearer [Filtered]');
  });
});
