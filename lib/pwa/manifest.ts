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
    // Chrome n'affiche l'interface d'installation enrichie que si le manifest
    // fournit au moins une capture `wide` (bureau) et une capture non `wide`
    // (mobile). Sans elles, l'installation reste possible mais minimale.
    screenshots: [
      {
        src: "/screenshots/desktop-wide.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide",
        label: "Accueil de CESIZen sur ordinateur",
      },
      {
        src: "/screenshots/mobile-narrow.png",
        sizes: "412x915",
        type: "image/png",
        form_factor: "narrow",
        label: "Accueil de CESIZen sur mobile",
      },
    ],
    icons: [
      // Chrome exige au moins une icone >= 144px dont `purpose` vaut `any`
      // (ou est absent) pour proposer l'installation. Les entrees `maskable`
      // servent uniquement aux icones adaptatives Android et ne satisfont pas
      // ce critere, d'ou des declarations distinctes pour chaque usage.
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
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
