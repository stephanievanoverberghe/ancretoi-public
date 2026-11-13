// src/app/api/admin/blog/categories/create/route.ts
import 'server-only';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/server/auth/authz';
import { createAdminCategoryFromBody, type CreateAdminCategoryBody } from '@/server/administration/categories.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        await requireAdmin();
        const result = await createAdminCategoryFromBody((await req.json()) as CreateAdminCategoryBody);

        if (!result.ok) {
            return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
        }

        revalidatePath('/administration/categories');
        revalidatePath('/administration/articles');
        revalidatePath('/administration/articles/nouveau');

        return NextResponse.json({ ok: true, id: result.id, slug: result.slug });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'server_error';
        console.error('POST /api/admin/blog/categories/create failed:', message);
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}
