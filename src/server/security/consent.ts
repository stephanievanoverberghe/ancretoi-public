import 'server-only';
import { cookies } from 'next/headers';
import { CONSENT_COOKIE, type Consent } from '@/lib/consent';

/**
 * Lit le cookie de consentement depuis un Server Component ou Route Handler.
 * Retourne `null` si le cookie est absent ou si le payload client est invalide.
 */
export async function readConsentCookieServer(): Promise<Consent | null> {
    try {
        const jar = await cookies();
        const raw = jar.get(CONSENT_COOKIE)?.value;
        if (!raw) return null;

        const j = JSON.parse(decodeURIComponent(raw));
        return {
            necessary: true,
            preferences: !!j.p,
            analytics: !!j.a,
            marketing: !!j.m,
        };
    } catch {
        return null;
    }
}
