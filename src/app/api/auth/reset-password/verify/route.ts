import { NextResponse, NextRequest } from 'next/server';
import { verifyPasswordResetToken } from '@/server/auth/auth.service';

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token') || '';
    if (!token) return NextResponse.json({ ok: false }, { status: 400 });

    let ok = false;
    try {
        ok = await verifyPasswordResetToken(token);
    } catch {
        ok = false;
    }

    return NextResponse.json({ ok });
}
