import 'server-only';

export function getNextAuthSecret() {
    const secret = process.env.NEXTAUTH_SECRET;

    if (secret) return secret;
    if (process.env.NODE_ENV === 'production') {
        throw new Error('NEXTAUTH_SECRET is required in production.');
    }

    return 'dev';
}

export function getAppBaseUrl(fallbackUrl?: string) {
    const configured = process.env.NEXTAUTH_URL?.trim();
    if (configured) return configured.replace(/\/$/, '');

    if (fallbackUrl) {
        return new URL(fallbackUrl).origin;
    }

    if (process.env.NODE_ENV === 'production') {
        throw new Error('NEXTAUTH_URL is required in production.');
    }

    return 'http://localhost:3000';
}
