// src/app/api/settings/export/route.ts
import { NextResponse } from 'next/server';
import { getAccountExportPayload } from '@/server/auth/account-profile';
import { getSession } from '@/server/auth/session';

export async function POST() {
    const sess = await getSession();
    if (!sess?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await getAccountExportPayload(sess.email);
    const body = JSON.stringify(payload, null, 2);
    return new NextResponse(body, {
        status: 200,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'content-disposition': 'attachment; filename="ancretoi-export.json"',
            'cache-control': 'no-store',
        },
    });
}
