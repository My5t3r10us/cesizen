'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Cookie } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const COOKIE_CONSENT_STORAGE_KEY = 'cesizen-cookie-consent';
const OPEN_COOKIE_PREFERENCES_EVENT = 'cesizen:open-cookie-preferences';
const COOKIE_CONSENT_CHANGED_EVENT = 'cesizen:cookie-consent-changed';

interface CookieConsentValue {
  necessary: true;
  answeredAt: string;
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
}

function subscribeToConsentChanges(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onStoreChange);
  };
}

function getConsentSnapshot() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) ?? '';
}

function getServerConsentSnapshot() {
  return null;
}

export function CookieConsent() {
  const [necessaryAccepted, setNecessaryAccepted] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const consentSnapshot = useSyncExternalStore(
    subscribeToConsentChanges,
    getConsentSnapshot,
    getServerConsentSnapshot
  );

  useEffect(() => {
    const handleOpenPreferences = () => {
      const latestConsent = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
      setNecessaryAccepted(Boolean(latestConsent));
      setManualOpen(true);
    };

    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
    return () => {
      window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
    };
  }, []);

  function saveChoice() {
    const consent: CookieConsentValue = {
      necessary: true,
      answeredAt: new Date().toISOString(),
    };

    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
    window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGED_EVENT));
    setNecessaryAccepted(true);
    setManualOpen(false);
    toast.success('Choix des cookies enregistre');
  }

  if (consentSnapshot === null || (consentSnapshot && !manualOpen)) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-lg border bg-background p-4 shadow-lg md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Cookie className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Gestion des cookies</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                CESIZen utilise uniquement des cookies obligatoires au bon fonctionnement du compte
                et de la securite de session.
              </p>
            </div>

            <label className="flex items-start gap-3 rounded-md border bg-muted/30 p-3 text-sm">
              <input
                type="checkbox"
                checked={necessaryAccepted}
                onChange={(event) => setNecessaryAccepted(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
              />
              <span>
                J&apos;accepte les cookies obligatoires necessaires au fonctionnement du site.
              </span>
            </label>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                onClick={saveChoice}
                disabled={!necessaryAccepted}
                className="w-full sm:w-auto"
              >
                Enregistrer mon choix
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
