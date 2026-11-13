'use client';

import { useEffect, useState } from 'react';

import { Switch } from '@/components/ui/forms/client';
import { DEFAULT_CONSENT, readConsentCookieClient, type Consent, writeConsentCookieClient } from '@/lib/consent';

export default function CookieQuickPrefsClient() {
    const [consent, setConsent] = useState<Consent | null>(null);

    useEffect(() => {
        try {
            setConsent(readConsentCookieClient() ?? DEFAULT_CONSENT);
        } catch {
            setConsent(DEFAULT_CONSENT);
        }
    }, []);

    if (!consent) return null;

    function update<K extends keyof Consent>(key: K, value: Consent[K]) {
        if (!consent) return;
        const next: Consent = { ...consent, [key]: value, necessary: true as const };
        setConsent(next);
        try {
            writeConsentCookieClient(next, 365);
        } catch {
            setConsent(next);
        }
    }

    return (
        <div className="grid gap-3 rounded-2xl border border-border bg-surface-muted p-4">
            <Switch
                checked={consent.analytics}
                onCheckedChange={(checked) => update('analytics', checked)}
                label="Mesure d’audience"
                description="Aide à comprendre l’usage du site, sans modifier ton accès aux formations."
            />
            <Switch
                checked={consent.marketing}
                onCheckedChange={(checked) => update('marketing', checked)}
                label="Cookies marketing"
                description="Utilisés uniquement pour les campagnes et communications ciblées."
            />
        </div>
    );
}
