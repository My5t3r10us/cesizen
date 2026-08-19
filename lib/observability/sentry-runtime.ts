import {
  getSentrySampling,
  isSentryEnabled,
  normalizeSentryEnvironment,
  scrubSentryBreadcrumb,
  scrubSentryEvent,
} from "@/lib/observability/sentry-config";

export function getServerSentryOptions() {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  const environment = normalizeSentryEnvironment(
    process.env.SENTRY_ENVIRONMENT ?? process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  );
  const sampling = getSentrySampling(environment);

  return {
    dsn,
    enabled: isSentryEnabled({ dsn, environment }),
    environment,
    sendDefaultPii: false,
    dataCollection: {
      userInfo: false,
      httpBodies: [],
    },
    enableLogs: true,
    tracesSampleRate: sampling.tracesSampleRate,
    beforeSend: scrubSentryEvent,
    beforeSendTransaction: scrubSentryEvent,
    beforeBreadcrumb: scrubSentryBreadcrumb,
  };
}

export function getClientSentryOptions() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const environment = normalizeSentryEnvironment(
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  );
  const sampling = getSentrySampling(environment);

  return {
    dsn,
    enabled: isSentryEnabled({ dsn, environment }),
    environment,
    sampling,
  };
}
