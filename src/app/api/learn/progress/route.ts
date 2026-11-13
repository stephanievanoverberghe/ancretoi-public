import 'server-only';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** Ancien writer non versionné, conservé uniquement pour répondre explicitement aux vieux clients. */
export async function POST() {
    return NextResponse.json(
        { ok: false as const, error: 'ENDPOINT_RETIRED' },
        { status: 410 },
    );
}
