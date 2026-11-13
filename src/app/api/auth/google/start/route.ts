import { NextRequest, NextResponse } from 'next/server';

import {
    buildGoogleAuthorizeUrl,
    createGoogleOAuthState,
    buildGoogleFailureRedirect,
    googleOAuthModeCookie,
    googleOAuthNextCookie,
    googleOAuthStateCookie,
    sanitizeAuthRedirectPath,
    sanitizeGoogleOAuthMode,
} from '@/server/auth/google-oauth.service';

/** Détermine si les cookies OAuth temporaires doivent être marqués `Secure`. */
function isSecureRequest(req: NextRequest) {
    const forwardedProto = req.headers.get('x-forwarded-proto');
    const protocol = forwardedProto || req.nextUrl.protocol.replace(':', '');
    return protocol === 'https';
}

/**
 * Démarre le flux OAuth Google et pose les cookies temporaires nécessaires au
 * callback : état CSRF, destination interne et mode de modale.
 */
export async function GET(req: NextRequest) {
    const state = createGoogleOAuthState();
    const nextPath = sanitizeAuthRedirectPath(req.nextUrl.searchParams.get('next'));
    const mode = sanitizeGoogleOAuthMode(req.nextUrl.searchParams.get('mode'));
    const authorizeUrl = buildGoogleAuthorizeUrl({
        requestUrl: req.url,
        state,
    });

    if (!authorizeUrl) {
        return NextResponse.redirect(buildGoogleFailureRedirect(req.url, mode, 'unavailable'));
    }

    const response = NextResponse.redirect(authorizeUrl);
    const cookieOptions = {
        httpOnly: true,
        secure: isSecureRequest(req),
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 10 * 60,
    };

    response.cookies.set(googleOAuthStateCookie, state, cookieOptions);
    response.cookies.set(googleOAuthNextCookie, nextPath, cookieOptions);
    response.cookies.set(googleOAuthModeCookie, mode, cookieOptions);

    return response;
}
