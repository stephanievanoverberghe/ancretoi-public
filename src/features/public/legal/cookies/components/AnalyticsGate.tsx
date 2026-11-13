'use client';

import { useEffect } from 'react';

import {
    readConsentCookieClient,
    subscribeToConsentChanges,
    type Consent,
} from '@/lib/consent';

const ANALYTICS_SCRIPT_ID = 'ancretoi-google-analytics';
const GOOGLE_ANALYTICS_ID_PATTERN = /^(G|GT|UA)-[A-Z0-9-]+$/i;

type AnalyticsWindow = Window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
};

function removeAnalyticsCookies() {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';

    for (const rawCookie of document.cookie.split('; ')) {
        const cookieName = rawCookie.split('=')[0];
        if (!cookieName || !cookieName.startsWith('_ga')) continue;
        document.cookie = `${cookieName}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
    }
}

function disableAnalytics(gaId: string) {
    const analyticsWindow = window as AnalyticsWindow;
    (analyticsWindow as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = true;
    analyticsWindow.gtag?.('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
    });
    document.getElementById(ANALYTICS_SCRIPT_ID)?.remove();
    removeAnalyticsCookies();
}

function enableAnalytics(gaId: string) {
    const analyticsWindow = window as AnalyticsWindow;
    (analyticsWindow as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = false;
    analyticsWindow.dataLayer ??= [];
    analyticsWindow.gtag ??= (...args: unknown[]) => {
        analyticsWindow.dataLayer?.push(args);
    };
    analyticsWindow.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
    });

    if (document.getElementById(ANALYTICS_SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = ANALYTICS_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(script);

    analyticsWindow.gtag('js', new Date());
    analyticsWindow.gtag('config', gaId, {
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
    });
}

function applyConsent(consent: Consent | null, gaId: string) {
    if (consent?.analytics) {
        enableAnalytics(gaId);
        return;
    }

    disableAnalytics(gaId);
}

export default function AnalyticsGate() {
    useEffect(() => {
        const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
        if (!gaId || !GOOGLE_ANALYTICS_ID_PATTERN.test(gaId)) return;

        applyConsent(readConsentCookieClient(), gaId);
        return subscribeToConsentChanges((consent) => applyConsent(consent, gaId));
    }, []);

    return null;
}
