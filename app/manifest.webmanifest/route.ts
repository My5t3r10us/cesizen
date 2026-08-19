import manifest from "@/lib/pwa/manifest";

/**
 * Le manifest est servi par une route explicite plutot que par la convention
 * `app/manifest.ts` : cette convention injecte automatiquement un
 * `<link rel="manifest">` sans `crossOrigin`, ce qui fait echouer le
 * telechargement (401) derriere une basic auth comme celle de Traefik.
 * Le lien est declare dans `app/layout.tsx` avec `use-credentials`.
 */
export function GET() {
  return Response.json(manifest(), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
