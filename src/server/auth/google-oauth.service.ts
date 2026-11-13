import 'server-only';

import crypto from 'crypto';

import { UserRole } from '@/generated/prisma/enums';
import { espaceRoutes, publicRoutes } from '@/config/routes';
import { getAppBaseUrl } from '@/server/shared/env';

import { mapPrismaUser } from './auth.mapper';
import { createAuthUser, findAuthUserByEmail, updateAuthUserByEmail } from './auth.repository';
import { normalizeAuthEmail } from './auth-prisma.service';

export const googleOAuthStateCookie = 'ancretoi_google_oauth_state';
export const googleOAuthNextCookie = 'ancretoi_google_oauth_next';
export const googleOAuthModeCookie = 'ancretoi_google_oauth_mode';

export type GoogleOAuthMode = 'login' | 'register';
export type GoogleOAuthFailureReason = 'error' | 'unavailable' | 'account-not-found' | 'account-already-exists' | 'account-unavailable' | 'email-not-verified';

const googleAuthorizeUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
const googleTokenUrl = 'https://oauth2.googleapis.com/token';
const googleUserInfoUrl = 'https://openidconnect.googleapis.com/v1/userinfo';

type GoogleTokenResponse = {
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    scope?: string;
    id_token?: string;
    error?: string;
    error_description?: string;
};

type GoogleUserInfo = {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
};

export class GoogleOAuthError extends Error {
    constructor(
        public readonly reason: GoogleOAuthFailureReason,
        public readonly email?: string,
    ) {
        super(reason);
        this.name = 'GoogleOAuthError';
    }
}

/**
 * Génère un état OAuth imprévisible pour protéger le callback Google contre les
 * attaques CSRF et les callbacks forgés.
 */
export function createGoogleOAuthState() {
    return crypto.randomBytes(32).toString('base64url');
}

/**
 * Limite les redirections post-auth aux chemins internes applicatifs.
 * Toute URL externe, protocole explicite ou route API retombe sur l'espace.
 */
export function sanitizeAuthRedirectPath(value: unknown) {
    const raw = String(value || '').trim();
    if (!raw.startsWith('/')) return espaceRoutes.root;
    if (raw.startsWith('//')) return espaceRoutes.root;
    if (raw.includes('://')) return espaceRoutes.root;
    if (raw.startsWith('/api/')) return espaceRoutes.root;
    return raw;
}

/**
 * Ne conserve que les modes auth réellement supportés par la modale.
 * Le login reste la valeur par défaut pour les callbacks sans cookie de mode.
 */
export function sanitizeGoogleOAuthMode(value: unknown) {
    return value === 'register' ? 'register' : 'login';
}

/**
 * Lit la configuration OAuth Google sans exposer les secrets au client.
 * Retourne `null` pour permettre une redirection propre si l'env est incomplet.
 */
export function getGoogleOAuthConfig(requestUrl?: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const baseUrl = getAppBaseUrl(requestUrl);
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() || `${baseUrl}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
        return null;
    }

    return {
        clientId,
        clientSecret,
        redirectUri,
    };
}

/**
 * Construit l'URL d'autorisation Google utilisée par la route de démarrage OAuth.
 */
export function buildGoogleAuthorizeUrl(input: { requestUrl: string; state: string }) {
    const config = getGoogleOAuthConfig(input.requestUrl);
    if (!config) return null;

    const url = new URL(googleAuthorizeUrl);
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('redirect_uri', config.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', input.state);
    url.searchParams.set('prompt', 'select_account');

    return url;
}

async function exchangeGoogleCode(input: { code: string; requestUrl: string }) {
    const config = getGoogleOAuthConfig(input.requestUrl);
    if (!config) throw new Error('google_oauth_not_configured');

    const body = new URLSearchParams({
        code: input.code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
    });

    const response = await fetch(googleTokenUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body,
    });

    const data = (await response.json().catch(() => ({}))) as GoogleTokenResponse;
    if (!response.ok || !data.access_token) {
        throw new Error(data.error_description || data.error || 'google_token_exchange_failed');
    }

    return data.access_token;
}

async function fetchGoogleUserInfo(accessToken: string) {
    const response = await fetch(googleUserInfoUrl, {
        headers: { authorization: `Bearer ${accessToken}` },
    });

    const data = (await response.json().catch(() => ({}))) as GoogleUserInfo;
    if (!response.ok || !data.email) {
        throw new Error('google_userinfo_failed');
    }

    return data;
}

/**
 * Échange le code Google, vérifie l'e-mail, puis applique le contrat du mode :
 * `login` exige un compte existant, `register` exige un e-mail pas encore inscrit.
 */
export async function authenticateGoogleOAuth(input: { code: string; requestUrl: string; mode: GoogleOAuthMode }) {
    const accessToken = await exchangeGoogleCode(input);
    const profile = await fetchGoogleUserInfo(accessToken);

    if (!profile.email_verified) {
        throw new GoogleOAuthError('email-not-verified');
    }

    const email = normalizeAuthEmail(profile.email || '');
    if (!email) throw new Error('google_email_missing');

    const existing = await findAuthUserByEmail(email);
    const now = new Date();

    if (existing) {
        if (input.mode === 'register') {
            throw new GoogleOAuthError('account-already-exists', email);
        }

        if (existing.deletedAt || existing.suspendedAt) {
            throw new GoogleOAuthError('account-unavailable', email);
        }

        const user = await updateAuthUserByEmail(email, {
            ...(existing.name ? {} : { name: profile.name ?? email }),
            avatarUrl: profile.picture ?? existing.avatarUrl,
            emailVerifiedAt: now,
            lastLoginAt: now,
        });

        return mapPrismaUser(user);
    }

    if (input.mode !== 'register') {
        throw new GoogleOAuthError('account-not-found', email);
    }

    const user = await createAuthUser({
        email,
        name: profile.name ?? null,
        avatarUrl: profile.picture ?? null,
        emailVerifiedAt: now,
        lastLoginAt: now,
        role: UserRole.USER,
        passwordHash: null,
    });

    return mapPrismaUser(user);
}

/**
 * Ramène toutes les erreurs Google vers la modale auth unique au lieu des
 * anciennes pages auth dédiées.
 */
export function buildGoogleFailureRedirect(requestUrl: string, mode: GoogleOAuthMode = 'login', reason: GoogleOAuthFailureReason = 'error', email?: string) {
    const url = new URL(publicRoutes.home, getAppBaseUrl(requestUrl));
    url.searchParams.set('auth', mode);
    url.searchParams.set('google', reason);
    if (email) url.searchParams.set('email', email);
    return url;
}
