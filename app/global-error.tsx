"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body>
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-semibold">Une erreur inattendue est survenue</h1>
          <p className="text-muted-foreground">
            L&apos;incident a été signalé automatiquement. Vous pouvez réessayer.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mx-auto rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
