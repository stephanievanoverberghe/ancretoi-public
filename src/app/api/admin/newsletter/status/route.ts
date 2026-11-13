import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/auth/authz';
import { adminNewsletterStatuses, updateAdminNewsletterSubscriberStatus } from '@/server/administration/newsletter.service';

export async function POST(req: Request) {
    await requireAdmin();

    const form = await req.formData();
    const email = String(form.get('email') ?? '')
        .trim()
        .toLowerCase();
    const status = String(form.get('status') ?? '') as (typeof adminNewsletterStatuses)[number];

    if (!email || !adminNewsletterStatuses.includes(status)) {
        return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
    }

    const result = await updateAdminNewsletterSubscriberStatus({ email, status });
    if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: result.statusCode });

    return NextResponse.redirect('/administration/newsletter', { status: 303 });
}
