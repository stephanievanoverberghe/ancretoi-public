import { NextRequest, NextResponse } from 'next/server';

import {
    authenticateGoogleOAuth,
    buildGoogleFailureRedirect,
    GoogleOAuthError,
    googleOAuthModeCookie,
    googleOAuthNextCookie,
    googleOAuthStateCookie,
    sanitizeAuthRedirectPath,
    sanitizeGoogleOAuthMode,
} from '@/server/auth/google-oauth.service';
import { createSessionToken, setSessionCookie } from '@/server/auth/session';

/**
 * Finalise le flux OAuth Google, crée la session applicative, puis redirige vers
 * le chemin interne stocké au démarrage du flux.
 */
export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get('code') || '';
    const state = req.nextUrl.searchParams.get('state') || '';
    const expectedState = req.cookies.get(googleOAuthStateCookie)?.value || '';
    const nextPath = sanitizeAuthRedirectPath(req.cookies.get(googleOAuthNextCookie)?.value);
    const mode = sanitizeGoogleOAuthMode(req.cookies.get(googleOAuthModeCookie)?.value);

    if (!code || !state || !expectedState || state !== expectedState) {
        const response = NextResponse.redirect(buildGoogleFailureRedirect(req.url, mode));
        clearGoogleOAuthCookies(response);
        return response;
    }

    try {
        const user = await authenticateGoogleOAuth({
            code,
            requestUrl: req.url,
            mode,
        });
        const token = await createSessionToken(user.email);
        const response = NextResponse.redirect(new URL(nextPath, req.url));
        setSessionCookie(response, token);
        clearGoogleOAuthCookies(response);
        return response;
    } catch (error) {
        const reason = error instanceof GoogleOAuthError ? error.reason : 'error';
        const failureMode = reason === 'account-not-found' ? 'register' : reason === 'account-already-exists' ? 'login' : mode;
        const email = error instanceof GoogleOAuthError ? error.email : undefined;
        const response = NextResponse.redirect(buildGoogleFailureRedirect(req.url, failureMode, reason, email));
        clearGoogleOAuthCookies(response);
        return response;
    }
}

/** Supprime les cookies OAuth temporaires après succès ou échec du callback. */
function clearGoogleOAuthCookies(response: NextResponse) {
    response.cookies.set(googleOAuthStateCookie, '', { path: '/', maxAge: 0, sameSite: 'lax' });
    response.cookies.set(googleOAuthNextCookie, '', { path: '/', maxAge: 0, sameSite: 'lax' });
    response.cookies.set(googleOAuthModeCookie, '', { path: '/', maxAge: 0, sameSite: 'lax' });
}
