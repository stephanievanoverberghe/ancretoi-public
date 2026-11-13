// src/app/api/admin/programs/[slug]/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/auth/authz';
import { deleteAdminProgramBySlug, parseAdminProgramPayload, updateAdminProgram } from '@/server/administration/programmes-api.service';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    await requireAdmin();

    const body = parseAdminProgramPayload(await req.json());
    const { slug } = await params;

    try {
        const result = await updateAdminProgram({ body, currentSlug: slug, includeUnitContent: true });
        return result.ok ? NextResponse.json({ ok: true, programSlug: result.programSlug, units: result.units }) : NextResponse.json({ error: result.error }, { status: result.status });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'update_failed';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    await requireAdmin();

    const { slug } = await params;
    const url = new URL(req.url);
    const dryRun = ['1', 'true', 'yes'].includes((url.searchParams.get('dryRun') || '').toLowerCase());

    try {
        const result = await deleteAdminProgramBySlug({ slug, dryRun });
        return NextResponse.json(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'delete_failed';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
