import * as Sentry from "@sentry/nextjs";

export interface ApiTelemetryContext {
  operation: string;
  route: string;
  method: string;
  role?: "user" | "admin";
  userId?: string;
}

type MetricStatus = "success" | "failure";

function safeAttributes(context: ApiTelemetryContext, status?: MetricStatus) {
  return {
    operation: context.operation,
    route: context.route,
    method: context.method,
    role: context.role ?? "anonymous",
    ...(status ? { status } : {}),
  };
}

export function reportApiError(
  error: unknown,
  context: ApiTelemetryContext,
): string {
  const attributes = safeAttributes(context, "failure");

  Sentry.metrics.count("cesizen.api.operation", 1, { attributes });
  Sentry.logger.error("API operation failed", { ...attributes });

  return Sentry.withScope((scope) => {
    scope.setTags({
      "api.operation": context.operation,
      "api.route": context.route,
      "api.method": context.method,
      "user.role": context.role ?? "anonymous",
    });

    if (context.userId) {
      scope.setUser({ id: context.userId });
    }

    scope.setContext("api", attributes);
    return Sentry.captureException(error);
  });
}

export function recordBusinessOperation(
  context: ApiTelemetryContext,
  status: MetricStatus = "success",
): void {
  const attributes = safeAttributes(context, status);
  Sentry.metrics.count("cesizen.business.operation", 1, { attributes });

  if (status === "success") {
    Sentry.logger.info("Business operation completed", { ...attributes });
  } else {
    Sentry.logger.warn("Business operation rejected", { ...attributes });
  }
}

export function recordApiLatency(
  context: ApiTelemetryContext,
  startedAt: number,
): void {
  Sentry.metrics.distribution(
    "cesizen.api.duration",
    Math.max(0, Date.now() - startedAt),
    {
      unit: "millisecond",
      attributes: safeAttributes(context),
    },
  );
}
