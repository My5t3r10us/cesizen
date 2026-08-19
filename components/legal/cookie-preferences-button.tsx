'use client';

import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { openCookiePreferences } from '@/components/cookies/cookie-consent';

export function CookiePreferencesButton() {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={openCookiePreferences}
      className="rounded-full border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]"
    >
      <Cookie className="mr-2 h-4 w-4" />
      Gérer mes préférences de cookies
    </Button>
  );
}
