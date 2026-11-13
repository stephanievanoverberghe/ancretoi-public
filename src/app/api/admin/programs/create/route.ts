// src/app/api/admin/programs/create/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/auth/authz';
import { parseAdminProgramPayload, upsertAdminProgram } from '@/server/administration/programmes-api.service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    await requireAdmin();

    const body = parseAdminProgramPayload(await req.json());

    try {
        const result = await upsertAdminProgram({ body, includeUnitContent: false });
        return result.ok ? NextResponse.json({ ok: true, programSlug: result.programSlug, units: result.units }) : NextResponse.json({ error: result.error }, { status: result.status });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'create_failed';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
