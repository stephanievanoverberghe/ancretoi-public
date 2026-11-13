// src/app/api/notes/export/route.ts
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getLearnerNotesExportData } from '@/server/journal/notes.service';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { PDFPage } from 'pdf-lib';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

type ExportInput = {
    format?: string;
    program?: string;
    q?: string;
    scope?: string;
};

export async function GET(req: NextRequest) {
    return createNotesExport(req);
}

export async function POST(req: NextRequest) {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });
    }

    const record = body as Record<string, unknown>;
    return createNotesExport(req, {
        format: typeof record.format === 'string' ? record.format : undefined,
        program: typeof record.program === 'string' ? record.program : undefined,
        q: typeof record.q === 'string' ? record.q : undefined,
        scope: typeof record.scope === 'string' ? record.scope : undefined,
    });
}

async function createNotesExport(req: NextRequest, input: ExportInput = {}) {
    const { searchParams } = new URL(req.url);
    const format = (input.format ?? searchParams.get('format') ?? 'json').toLowerCase();
    const program = input.program?.trim() || searchParams.get('program')?.trim() || undefined;
    const q = input.q?.trim() || searchParams.get('q')?.trim() || '';
    const scope = (input.scope ?? searchParams.get('scope') ?? 'journal').toLowerCase();

    if (format !== 'json' && format !== 'pdf') {
        return NextResponse.json({ ok: false, error: 'INVALID_FORMAT' }, { status: 400 });
    }
    if (scope !== 'journal' && scope !== 'notes') {
        return NextResponse.json({ ok: false, error: 'INVALID_SCOPE' }, { status: 400 });
    }

    const exportData = await getLearnerNotesExportData({
        nextPath: '/espace/notes',
        programFilter: program,
        query: q,
        scope,
    });

    if (!exportData.userFound || !exportData.user) {
        return NextResponse.json({ ok: false, error: 'USER_NOT_FOUND' }, { status: 401 });
    }

    const filtered = exportData.states;
    const filenameProgram = toFilenamePart(program ?? 'all');

    if (format === 'json') {
        const payload = {
            scope,
            programSlug: program ?? 'all',
            userId: exportData.user.id,
            q: q || undefined,
            days: filtered.map((state) => ({
                programSlug: state.programSlug,
                day: state.day,
                data: state.data ?? {},
                practiced: Boolean(state.practiced),
                completed: Boolean(state.completed),
                updatedAt: state.updatedAt,
            })),
        };

        return new NextResponse(JSON.stringify(payload, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Disposition': `attachment; filename="${scope}-${filenameProgram}.json"`,
                'Cache-Control': 'no-store',
            },
        });
    }

    const pdf = await PDFDocument.create();
    const pageSize: [number, number] = [595.28, 841.89];
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const addPage = () => pdf.addPage(pageSize);
    let page: PDFPage = addPage();
    let x = 50;
    let y = 800;

    const draw = (text: string, opts?: { bold?: boolean; size?: number }) => {
        const size = opts?.size ?? 10;
        const bold = opts?.bold ?? false;
        const safeText = text
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\x20-\x7E]/g, '?');
        page.drawText(safeText, { x, y, size, font: bold ? fontBold : font, color: rgb(0, 0, 0) });
        y -= size + 4;
    };

    const ensureSpace = (minY: number) => {
        if (y < minY) {
            page = addPage();
            x = 50;
            y = 800;
        }
    };

    const title = `${scope === 'notes' ? 'Notes libres' : 'Journal guide'} - ${program ?? 'tous les programmes'} - ${exportData.user.email}${q ? ` - filtre: ${q}` : ''}`;
    draw(title, { bold: true, size: 14 });
    y -= 6;

    for (const state of filtered) {
        ensureSpace(120);
        draw(`${state.programSlug} - Jour ${state.day}${state.completed ? ' - termine' : ''}`, { bold: true });

        const flags: string[] = [];
        if (state.practiced) flags.push('pratique');
        if (state.completed) flags.push('termine');
        draw(flags.length ? `Statut: ${flags.join(', ')}` : 'Statut: non valide');

        const entries = Object.entries(state.data ?? {});
        if (entries.length === 0) {
            draw('- (aucune reponse texte)');
        } else {
            for (const [key, value] of entries) {
                const lines = wrap(`${key}: ${value}`, 90);
                for (const line of lines) {
                    ensureSpace(60);
                    draw(`- ${line}`);
                }
            }
        }

        draw(`Derniere mise a jour: ${new Date(state.updatedAt).toLocaleString('fr-FR')}`);
        y -= 6;
    }

    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${scope}-${filenameProgram}.pdf"`,
            'Cache-Control': 'no-store',
        },
    });
}

function wrap(text: string, width = 90): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
        const next = (line ? `${line} ` : '') + word;
        if (next.length > width) {
            if (line) lines.push(line);
            line = word;
        } else {
            line = next;
        }
    }
    if (line) lines.push(line);
    return lines;
}

function toFilenamePart(value: string) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'all';
}
