// src/app/api/admin/inspirations/route.ts
import 'server-only';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/server/auth/authz';
import { archiveAdminInspirationBySlug, restoreAdminInspirationBySlug } from '@/server/administration/inspirations.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

function revalidateInspirationPaths(slug: string) {
    revalidatePath('/administration/inspirations');
    revalidatePath('/administration/inspirations/archives');
    revalidatePath('/inspirations');
    revalidatePath(`/inspirations/${slug}`, 'page');
}

export async function GET(req: Request) {
    await requireAdmin();
    return NextResponse.redirect(new URL('/administration/inspirations/nouveau', req.url), 302);
}

export async function DELETE(req: Request) {
    try {
        await requireAdmin();

        const url = new URL(req.url);
        const slug = (url.searchParams.get('slug') || '').trim().toLowerCase();
        const dryRun = url.searchParams.get('dryRun') === 'true';
        const result = await archiveAdminInspirationBySlug({ slug, dryRun });

        if (!result.ok) {
            return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
        }

        const archivedSlug = 'slug' in result ? result.slug : undefined;
        if (!result.dryRun && result.deleted.inspiration > 0 && archivedSlug) {
            revalidateInspirationPaths(archivedSlug);
        }

        return NextResponse.json(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'server_error';
        console.error('DELETE /api/admin/inspirations failed:', message);
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await requireAdmin();

        const url = new URL(req.url);
        const slug = (url.searchParams.get('slug') || '').trim().toLowerCase();
        const action = (url.searchParams.get('action') || '').trim();
        const result = await restoreAdminInspirationBySlug({ slug, action });

        if (!result.ok) {
            return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
        }

        revalidateInspirationPaths(result.slug);

        return NextResponse.json(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'server_error';
        console.error('PATCH /api/admin/inspirations failed:', message);
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}
