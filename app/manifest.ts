import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CESIZen - Bien-être mental",
    short_name: "CESIZen",
    description:
      "Votre compagnon de bien-être mental pour suivre vos émotions et prendre soin de vous.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FAFAF5",
    theme_color: "#8A9A5B",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
