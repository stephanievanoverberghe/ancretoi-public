import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routeBuilders } from '@/config/routes';
import { readSessionFromRequest } from '@/server/auth/session';

function redirectToLogin(req: NextRequest) {
    const nextPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
    const url = new URL(routeBuilders.connexionWithNext(nextPath), req.url);
    return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
    const session = await readSessionFromRequest(req);

    if (!session?.email) {
        return redirectToLogin(req);
    }

    return NextResponse.next();
}

export const config = {
    // Next.js requires literal matcher values here.
    matcher: ['/administration/:path*', '/espace/:path*'],
};
