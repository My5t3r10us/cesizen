import 'dotenv/config';
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/cookies/cookie-consent";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { InfoIcon } from "lucide-react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CESIZen - Votre compagnon de bien-être mental",
  description: "Application de suivi du bien-être mental pour les citoyens. Suivez vos émotions, accédez à des conseils et prenez soin de votre santé mentale.",
  applicationName: "CESIZen",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CESIZen",
  },
};

export const viewport: Viewport = {
  themeColor: "#8A9A5B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/*
          Le manifest doit être demandé avec les cookies/identifiants de la page.
          Sans `use-credentials`, le navigateur le récupère en mode anonyme et
          les environnements protégés par une basic auth (Traefik) renvoient 401.
        */}
        <link
          rel="manifest"
          href="/manifest.webmanifest"
          crossOrigin="use-credentials"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <ServiceWorkerRegistration />
        <CookieConsent />
        <Toaster position="top-center" richColors />
        {process.env.PRE_PROD === "true" && (
          <Alert className="w-auto fixed bottom-3 right-3 z-50 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
            <InfoIcon />
            <AlertTitle>Pre-Prod environnement</AlertTitle>
          </Alert>
        )}
      </body>
    </html>
  );
}
