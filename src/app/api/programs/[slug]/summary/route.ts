import 'server-only';
import { NextResponse } from 'next/server';
import { getLearnerProgramSummary } from '@/server/apprentissage/learning-api.service';

function getSlugFromUrl(url: URL) {
    const parts = url.pathname.split('/');
    const i = parts.findIndex((part) => part === 'programs');
    return i >= 0 && parts[i + 1] ? decodeURIComponent(parts[i + 1]).toLowerCase() : '';
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const slug = getSlugFromUrl(url);
    if (!slug) return NextResponse.json({ error: 'SLUG_MISSING' }, { status: 400 });

    const result = await getLearnerProgramSummary(slug);
    return result.ok ? NextResponse.json(result) : NextResponse.json({ error: result.error }, { status: result.status });
}
