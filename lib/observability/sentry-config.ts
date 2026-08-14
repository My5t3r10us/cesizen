const ALLOWED_ENVIRONMENTS = new Set(["production", "staging"]);

const SENSITIVE_KEY =
  /authorization|cookie|email|password|token|secret|jwt|note|comment|content|emotion|nom|prenom/i;
const EMAIL_VALUE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const BEARER_VALUE = /\bBearer\s+[A-Za-z0-9._~+/=-]+\b/gi;

export interface SentryEnvironmentConfig {
  dsn?: string;
  environment?: string;
  release?: string;
}

export interface SentrySamplingConfig {
  tracesSampleRate: number;
  profileSessionSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

export function normalizeSentryEnvironment(environment?: string): string {
  const normalized = environment?.trim().toLowerCase();
  return normalized === "prod" ? "production" : normalized || "disabled";
}

export function isSentryEnabled({
  dsn,
  environment,
}: SentryEnvironmentConfig): boolean {
  return Boolean(dsn?.trim()) && ALLOWED_ENVIRONMENTS.has(normalizeSentryEnvironment(environment));
}

export function getSentrySampling(environment?: string): SentrySamplingConfig {
  const normalized = normalizeSentryEnvironment(environment);

  return {
    tracesSampleRate: normalized === "staging" ? 0.1 : 0.02,
    profileSessionSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1,
  };
}

function redactString(value: string): string {
  return value
    .replace(EMAIL_VALUE, "[Filtered]")
    .replace(BEARER_VALUE, "Bearer [Filtered]");
}

export function scrubSentryValue(value: unknown, depth = 0): unknown {
  if (depth > 8 || value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    return redactString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => scrubSentryValue(item, depth + 1));
  }

  if (typeof value !== "object") {
    return value;
  }

  const scrubbed: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    scrubbed[key] = SENSITIVE_KEY.test(key)
      ? "[Filtered]"
      : scrubSentryValue(item, depth + 1);
  }

  return scrubbed;
}

export function scrubSentryEvent<T extends object>(event: T): T {
  const scrubbed = scrubSentryValue(event) as T;
  const scrubbedRecord = scrubbed as Record<string, unknown>;
  const request = scrubbedRecord.request as Record<string, unknown> | undefined;

  if (request) {
    delete request.cookies;
    delete request.data;
    delete request.headers;
    delete request.query_string;

    if (typeof request.url === "string") {
      request.url = request.url.split("?")[0];
    }
  }

  const user = scrubbedRecord.user as Record<string, unknown> | undefined;
  if (user) {
    scrubbedRecord.user = user.id ? { id: user.id } : undefined;
  }

  return scrubbed;
}

export function scrubSentryBreadcrumb<T extends object>(
  breadcrumb: T,
): T {
  const scrubbed = scrubSentryValue(breadcrumb) as T;
  const scrubbedRecord = scrubbed as Record<string, unknown>;

  if (typeof scrubbedRecord.message === "string") {
    scrubbedRecord.message = redactString(scrubbedRecord.message);
  }

  return scrubbed;
}
