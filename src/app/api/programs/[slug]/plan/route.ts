// src/app/api/programs/[slug]/plan/route.ts
import 'server-only';
import { NextResponse } from 'next/server';
import { getLearnerProgramPlan } from '@/server/apprentissage/learning-api.service';

function getSlugFromUrl(url: URL) {
    const parts = url.pathname.split('/');
    const i = parts.findIndex((part) => part === 'programs');
    return i >= 0 && parts[i + 1] ? decodeURIComponent(parts[i + 1]).toLowerCase() : '';
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const slug = getSlugFromUrl(url);
    if (!slug) return NextResponse.json({ ok: false, error: 'SLUG_MISSING', days: [] });

    const limit = Math.max(1, Math.min(parseInt(url.searchParams.get('limit') || '10', 10) || 10, 50));
    const result = await getLearnerProgramPlan({ slug, limit });
    return result.ok ? NextResponse.json(result) : NextResponse.json(result, { status: result.status });
}
