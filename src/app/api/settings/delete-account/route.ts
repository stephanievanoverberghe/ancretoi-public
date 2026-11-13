import 'server-only';
import { NextResponse } from 'next/server';
import { softDeleteAccountByEmail } from '@/server/auth/account-profile';
import { clearSessionCookie, getSession } from '@/server/auth/session';

export async function POST() {
    try {
        const sess = await getSession();
        if (!sess?.email) return NextResponse.json({ ok: false, error: 'UNAUTH' }, { status: 401 });

        const result = await softDeleteAccountByEmail(sess.email);
        if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 404 });

        const response = NextResponse.json({ ok: true });
        clearSessionCookie(response);
        return response;
    } catch {
        return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
    }
}
