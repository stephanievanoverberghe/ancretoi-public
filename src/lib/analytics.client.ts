export type AnalyticsProps = Record<string, unknown>;

declare global {
    interface Window {
        plausible?: (name: string, opts?: { props?: Record<string, unknown> }) => void;
        posthog?: { capture: (name: string, props?: Record<string, unknown>) => void };
    }
}

/**
 * Declenche les providers analytics client si leur script est present.
 * Reste un no-op cote serveur ou quand le consentement/chargement externe les rend indisponibles.
 */
export function track(name: string, props?: AnalyticsProps): void {
    if (typeof window === 'undefined') return;
    window.plausible?.(name, { props });
    window.posthog?.capture?.(name, props);
}
