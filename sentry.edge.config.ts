import * as Sentry from "@sentry/nextjs";
import { getServerSentryOptions } from "@/lib/observability/sentry-runtime";

Sentry.init(getServerSentryOptions());
