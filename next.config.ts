import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

const uploadSourceMaps = process.env.SENTRY_UPLOAD_SOURCE_MAPS === "true";

if (uploadSourceMaps && !process.env.SENTRY_AUTH_TOKEN) {
  throw new Error(
    "SENTRY_AUTH_TOKEN is required when SENTRY_UPLOAD_SOURCE_MAPS=true",
  );
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? "cesizen-nx",
  project: process.env.SENTRY_PROJECT ?? "javascript-nextjs",
  authToken: uploadSourceMaps ? process.env.SENTRY_AUTH_TOKEN : undefined,
  tunnelRoute: "/monitoring",
  silent: !uploadSourceMaps,
  sourcemaps: {
    disable: !uploadSourceMaps,
    deleteSourcemapsAfterUpload: true,
  },
  release: uploadSourceMaps
    ? {
        setCommits: {
          auto: true,
          ignoreMissing: true,
          ignoreEmpty: true,
        },
        deploy: process.env.SENTRY_ENVIRONMENT
          ? { env: process.env.SENTRY_ENVIRONMENT }
          : undefined,
      }
    : {
        create: false,
      },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
