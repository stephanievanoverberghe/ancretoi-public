import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/auth/authz';
import { adminNewsletterStatuses, getAdminNewsletterExportRows } from '@/server/administration/newsletter.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function csvCell(value: unknown) {
    const text = String(value ?? '');
    const safeText = /^ *[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${safeText.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').trim();
    const rawStatus = searchParams.get('status') ?? 'all';
    const status = rawStatus === 'all' || adminNewsletterStatuses.includes(rawStatus as (typeof adminNewsletterStatuses)[number])
        ? (rawStatus as 'all' | (typeof adminNewsletterStatuses)[number])
        : 'all';
    const tag = (searchParams.get('tag') ?? '').trim();
    const rawSort = searchParams.get('sort') ?? 'recent';
    const sort = ['recent', 'oldest', 'alphaAsc', 'alphaDesc'].includes(rawSort)
        ? (rawSort as 'recent' | 'oldest' | 'alphaAsc' | 'alphaDesc')
        : 'recent';

    const rows = await getAdminNewsletterExportRows({ q, status, tag, sort });

    const header = ['email', 'status', 'tags', 'source', 'consentAt', 'confirmedAt', 'unsubscribedAt', 'createdAt', 'updatedAt'];

    const csv = [
        header.join(','),
        ...rows.map((r) =>
            [
                r.email,
                r.status ?? '',
                Array.isArray(r.tags) ? JSON.stringify(r.tags) : '',
                r.source ?? '',
                r.consentAt ? new Date(r.consentAt).toISOString() : '',
                r.confirmedAt ? new Date(r.confirmedAt).toISOString() : '',
                r.unsubscribedAt ? new Date(r.unsubscribedAt).toISOString() : '',
                r.createdAt ? new Date(r.createdAt).toISOString() : '',
                r.updatedAt ? new Date(r.updatedAt).toISOString() : '',
            ]
                .map(csvCell)
                .join(',')
        ),
    ].join('\n');

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="newsletter_export.csv"',
        },
    });
}
