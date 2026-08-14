import * as Sentry from "@sentry/nextjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { getSentrySampling } from "@/lib/observability/sentry-config";
import { getServerSentryOptions } from "@/lib/observability/sentry-runtime";

const options = getServerSentryOptions();
const sampling = getSentrySampling(options.environment);

Sentry.init({
  ...options,
  integrations: [nodeProfilingIntegration()],
  profileSessionSampleRate: sampling.profileSessionSampleRate,
  profileLifecycle: "trace",
});
