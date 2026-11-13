export const CONSENT_COOKIE = 'at_consent';
export const CONSENT_CHANGE_EVENT = 'ancretoi:consent-change';

export type Consent = {
    necessary: true;
    preferences: boolean;
    analytics: boolean;
    marketing: boolean;
};

export const DEFAULT_CONSENT: Consent = {
    necessary: true,
    preferences: false,
    analytics: false,
    marketing: false,
};

function pack(c: Consent) {
    return encodeURIComponent(JSON.stringify({ p: +c.preferences, a: +c.analytics, m: +c.marketing, v: 1 }));
}

function unpack(raw: string | undefined | null): Consent | null {
    if (!raw) return null;
    try {
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

/**
 * Lit le cookie de consentement cote client.
 * Retourne `null` hors navigateur ou si le payload ne peut pas etre decode.
 */
export function readConsentCookieClient(cookieName = CONSENT_COOKIE): Consent | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.split('; ').find((c) => c.startsWith(`${cookieName}=`));
    if (!match) return null;
    return unpack(match.split('=')[1]);
}

/**
 * Ecrit le cookie de consentement uniquement si la valeur change.
 * Le cookie reste client-side et utilise SameSite=Lax pour limiter l'exposition CSRF.
 */
export function writeConsentCookieClient(
    value: Consent,
    days = 365,
    cookieName = CONSENT_COOKIE,
) {
    if (typeof document === 'undefined') return;

    const existing = readConsentCookieClient(cookieName);
    if (existing && existing.preferences === value.preferences && existing.analytics === value.analytics && existing.marketing === value.marketing) {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
    const payload = pack(value);

    document.cookie = `${cookieName}=${payload}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;

    window.dispatchEvent(
        new CustomEvent<Consent>(CONSENT_CHANGE_EVENT, {
            detail: value,
        }),
    );
}

export function subscribeToConsentChanges(listener: (consent: Consent) => void) {
    if (typeof window === 'undefined') return () => undefined;

    const handleChange = (event: Event) => {
        const consentEvent = event as CustomEvent<Consent>;
        listener(consentEvent.detail);
    };

    window.addEventListener(CONSENT_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handleChange);
}
