import { SignJWT, jwtVerify } from 'jose';
import type { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getNextAuthSecret } from '@/server/shared/env';

function getSessionSecret() {
    return new TextEncoder().encode(getNextAuthSecret());
}

/**
 * En production HTTPS, `__Host-` impose Secure, Path=/ et interdit Domain.
 */
export const sessionCookieName = process.env.NODE_ENV === 'production' ? '__Host-ancretoi_session' : 'ancretoi_session';

type SessionPayload = { email: string; iat?: number; exp?: number };

/**
 * Cree un JWT de session court et signe avec NEXTAUTH_SECRET.
 */
export async function createSessionToken(email: string) {
    return await new SignJWT({ email }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(getSessionSecret());
}

/**
 * Pose le cookie de session HTTP-only.
 * Ne pas definir `domain` afin de conserver la garantie `__Host-` en production.
 */
export function setSessionCookie(res: NextResponse, token: string) {
    res.cookies.set(sessionCookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    });
}

export function clearSessionCookie(res: NextResponse) {
    res.cookies.set(sessionCookieName, '', {
        path: '/',
        maxAge: 0,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });
}

/**
 * Lit la session depuis les cookies Next.js du contexte serveur courant.
 */
export async function getSession(): Promise<SessionPayload | null> {
    const store = await cookies();
    const c = store.get(sessionCookieName)?.value;
    if (!c) return null;
    try {
        const { payload } = await jwtVerify(c, getSessionSecret());
        return payload as SessionPayload;
    } catch {
        return null;
    }
}

/**
 * Lit la session depuis une requete middleware ou route handler.
 */
export async function readSessionFromRequest(req: NextRequest) {
    const c = req.cookies.get(sessionCookieName)?.value;
    if (!c) return null;
    try {
        const { payload } = await jwtVerify(c, getSessionSecret());
        return payload as SessionPayload;
    } catch {
        return null;
    }
}
