// src/app/api/me/streak/route.ts
import { NextResponse } from 'next/server';
import { getUserStreakData } from '@/server/apprentissage/learning-api.service';
import { getSession } from '@/server/auth/session';

export async function GET(request: Request) {
    const sess = await getSession();
    if (!sess?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const daysParam = Number(url.searchParams.get('days') || '180');
    const result = await getUserStreakData({ email: sess.email, daysParam });

    if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
        {
            ok: true,
            days: result.days,
            rows: result.rows,
            streak: result.streak,
            totalActive: result.totalActive,
        },
        { headers: { 'cache-control': 'no-store' } },
    );
}
