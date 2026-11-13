'use client';

import { CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Alert, Button } from '@/components/ui';
import { Switch } from '@/components/ui/forms/client';
import {
    CONSENT_COOKIE,
    DEFAULT_CONSENT,
    readConsentCookieClient,
    writeConsentCookieClient,
    type Consent,
} from '@/lib/consent';

type Props = {
    cookieName?: string;
    cookieDays?: number;
    initial?: Partial<Consent>;
    analyticsAvailable?: boolean;
};

type ConsentOption = {
    key: 'necessary' | 'analytics';
    label: string;
    description: string;
};

const OPTIONS: readonly ConsentOption[] = [
    {
        key: 'necessary',
        label: 'Cookies nécessaires',
        description:
            'Indispensables à l’authentification, à la sécurité et au fonctionnement du site.',
    },
    {
        key: 'analytics',
        label: 'Mesure d’audience',
        description:
            'Active Google Analytics pour mesurer la fréquentation, uniquement après votre accord.',
    },
] as const;

export default function PreferencesForm({
    cookieName = CONSENT_COOKIE,
    cookieDays = 365,
    initial = {},
    analyticsAvailable = false,
}: Props) {
    const fallback = useMemo<Consent>(
        () => ({
            ...DEFAULT_CONSENT,
            ...initial,
            necessary: true,
            preferences: false,
            analytics: analyticsAvailable ? Boolean(initial.analytics) : false,
            marketing: false,
        }),
        [analyticsAvailable, initial],
    );
    const [consent, setConsent] = useState<Consent>(fallback);
    const [saved, setSaved] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const storedConsent = readConsentCookieClient(cookieName);
        if (storedConsent) {
            setConsent({
                ...storedConsent,
                necessary: true,
                preferences: false,
                analytics: analyticsAvailable ? storedConsent.analytics : false,
                marketing: false,
            });
        }
        setReady(true);
    }, [analyticsAvailable, cookieName]);

    function updateAll(enabled: boolean) {
        setConsent({
            necessary: true,
            preferences: false,
            analytics: analyticsAvailable ? enabled : false,
            marketing: false,
        });
        setSaved(false);
    }

    function save() {
        writeConsentCookieClient(consent, cookieDays, cookieName);
        setSaved(true);
    }

    return (
        <div>
            <div className="grid gap-3">
                {OPTIONS.filter((option) => option.key !== 'analytics' || analyticsAvailable).map((option) => {
                    const isRequired = option.key === 'necessary';

                    return (
                        <div
                            key={option.key}
                            className="rounded-2xl border border-border/80 bg-surface/80 p-4 sm:p-5"
                        >
                            <Switch
                                id={`consent-${option.key}`}
                                label={option.label}
                                description={
                                    isRequired
                                        ? `${option.description} Toujours actifs.`
                                        : option.description
                                }
                                checked={consent[option.key]}
                                disabled={isRequired || !ready}
                                onCheckedChange={(checked) => {
                                    if (isRequired) return;
                                    setConsent((current) => ({
                                        ...current,
                                        [option.key]: checked,
                                    }));
                                    setSaved(false);
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                <Button type="button" variant="tertiary" disabled={!ready} onClick={() => updateAll(false)}>
                    Refuser les optionnels
                </Button>
                <Button type="button" variant="secondary" disabled={!ready} onClick={() => updateAll(true)}>
                    Tout accepter
                </Button>
                <Button type="button" disabled={!ready} onClick={save}>
                    Enregistrer mes choix
                </Button>
            </div>

            {saved ? (
                <Alert
                    className="mt-4"
                    variant="success"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    title="Préférences enregistrées"
                >
                    Votre choix est appliqué immédiatement et reste modifiable ici.
                </Alert>
            ) : null}
        </div>
    );
}
