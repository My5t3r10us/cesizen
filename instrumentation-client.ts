import * as Sentry from "@sentry/nextjs";
import {
  scrubSentryBreadcrumb,
  scrubSentryEvent,
} from "@/lib/observability/sentry-config";
import { getClientSentryOptions } from "@/lib/observability/sentry-runtime";

const config = getClientSentryOptions();

Sentry.init({
  dsn: config.dsn,
  enabled: config.enabled,
  environment: config.environment,
  sendDefaultPii: false,
  dataCollection: {
    userInfo: false,
    httpBodies: [],
  },
  enableLogs: true,
  tracesSampleRate: config.sampling.tracesSampleRate,
  profileSessionSampleRate: config.sampling.profileSessionSampleRate,
  replaysSessionSampleRate: config.sampling.replaysSessionSampleRate,
  replaysOnErrorSampleRate: config.sampling.replaysOnErrorSampleRate,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserProfilingIntegration(),
  ],
  beforeSend: scrubSentryEvent,
  beforeSendTransaction: scrubSentryEvent,
  beforeBreadcrumb: scrubSentryBreadcrumb,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
