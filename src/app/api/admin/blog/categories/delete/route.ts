// src/app/api/admin/blog/categories/delete/route.ts
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/server/auth/authz';
import { previewOrDeleteAdminCategory } from '@/server/administration/categories.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function previewOrDelete(req: NextRequest, { dryRunOnly = false }: { dryRunOnly?: boolean }) {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const slug = (searchParams.get('slug') || '').trim().toLowerCase();
    const dryRun = searchParams.get('dryRun') === 'true';
    const force = searchParams.get('force') === 'true';
    const result = await previewOrDeleteAdminCategory({ slug, dryRun, dryRunOnly, force });

    if (result.kind !== 'deleted') {
        return NextResponse.json(result.body, { status: result.status });
    }

    revalidatePath('/administration/categories');
    revalidatePath('/administration/articles');

    return NextResponse.json(result.body);
}

export async function GET(req: NextRequest) {
    return previewOrDelete(req, { dryRunOnly: true });
}

export async function DELETE(req: NextRequest) {
    return previewOrDelete(req, { dryRunOnly: false });
}
