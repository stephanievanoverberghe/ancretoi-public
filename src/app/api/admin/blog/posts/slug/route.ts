// src/app/api/admin/blog/posts/slug/route.ts

import 'server-only';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/auth/authz';
import { suggestSlug } from '@/server/blog/posts.service';

export async function GET(req: Request) {
    await requireAdmin();
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();
    if (!q) return NextResponse.json({ ok: false, error: 'missing_q' }, { status: 400 });
    const s = await suggestSlug(q);
    return NextResponse.json({ ok: true, slug: s });
}
