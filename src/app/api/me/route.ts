// src/app/api/me/route.ts

import { NextResponse } from 'next/server';
import { getSession } from '@/server/auth/session';
import { getAuthUserByEmail } from '@/server/auth/auth.service';

type PublicUser = { email: string; name?: string | null; role?: string | null };

export async function GET() {
    const sess = await getSession();
    if (!sess?.email) return NextResponse.json({ user: null }, { status: 401 });

    const authUser = await getAuthUserByEmail(sess.email, { includeDeleted: true });
    const user: PublicUser | null = authUser
        ? {
              email: authUser.email,
              name: authUser.name,
              role: authUser.role,
          }
        : null;

    return NextResponse.json({ user: user ?? null });
}
