import 'server-only';

import { getAuthUserByEmail } from './auth.service';
import { getSession } from './session';
import { getPrismaClient } from '@/server/db/prisma';

export type AccountProfile = {
    email: string;
    name?: string | null;
    avatarUrl?: string | null;
    role?: 'user' | 'admin';
    hasPassword?: boolean;
    theme?: 'system' | 'light' | 'dark';
    marketing?: boolean;
    productUpdates?: boolean;
};

export async function getAccountProfile() {
    const session = await getSession();
    if (!session?.email) return null;

    const user = await getAuthUserByEmail(session.email, { includeDeleted: true });
    if (!user) return null;

    return {
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        hasPassword: Boolean(user.passwordHash),
        theme: user.theme,
        marketing: user.marketing,
        productUpdates: user.productUpdates,
    } satisfies AccountProfile;
}

export async function getAccountExportPayload(email: string) {
    const user = await getPrismaClient().user.findUnique({
        where: { email },
        select: {
            email: true,
            name: true,
            avatarUrl: true,
            theme: true,
            marketing: true,
            productUpdates: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return {
        exportedAt: new Date().toISOString(),
        account: user,
    };
}

export async function softDeleteAccountByEmail(email: string) {
    const user = await getPrismaClient().user.findUnique({ where: { email }, select: { id: true } });

    if (!user) return { ok: false as const, error: 'USER_NOT_FOUND' as const };

    await getPrismaClient().$transaction(async (tx) => {
        await tx.dayState.deleteMany({ where: { userId: user.id } });
        await tx.baselineScore.deleteMany({ where: { enrollment: { userId: user.id } } });
        await tx.enrollment.deleteMany({ where: { userId: user.id } });
        await tx.user.update({ where: { id: user.id }, data: { deletedAt: new Date() } });
    });

    return { ok: true as const };
}
