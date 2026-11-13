// app/api/page/[program]/route.ts
import { NextResponse } from 'next/server';
import { getPublishedProgramPagePayload } from '@/server/programmes/programmes.service';

export async function GET(req: Request) {
    const { pathname } = new URL(req.url);
    const parts = pathname.split('/').filter(Boolean);
    const programSeg = parts[parts.length - 1];

    if (!programSeg) {
        return NextResponse.json({ error: 'bad_request' }, { status: 400 });
    }

    const slug = decodeURIComponent(programSeg).toLowerCase();
    const payload = await getPublishedProgramPagePayload(slug);

    if (!payload) {
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    return NextResponse.json(payload);
}
