import 'server-only';

import { UserRole, UserTheme } from '@/generated/prisma/enums';
import { getPrismaClient } from '@/server/db/prisma';

const authUserSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    passwordHash: true,
    passwordChangedAt: true,
    deletedAt: true,
    suspendedAt: true,
    avatarUrl: true,
    theme: true,
    marketing: true,
    productUpdates: true,
    maxConcurrentPrograms: true,
    features: true,
} as const;

export type PrismaAuthUser = {
    id: string;
    email: string;
    name: string | null;
    role: (typeof UserRole)[keyof typeof UserRole];
    passwordHash: string | null;
    passwordChangedAt: Date | null;
    deletedAt: Date | null;
    suspendedAt: Date | null;
    avatarUrl: string | null;
    theme: (typeof UserTheme)[keyof typeof UserTheme];
    marketing: boolean;
    productUpdates: boolean;
    maxConcurrentPrograms: number | null;
    features: string[];
};

export async function findAuthUserByEmail(email: string) {
    return getPrismaClient().user.findUnique({
        where: { email },
        select: authUserSelect,
    });
}

export async function findAuthUserById(id: string) {
    return getPrismaClient().user.findUnique({
        where: { id },
        select: authUserSelect,
    });
}

export async function createAuthUser(input: {
    email: string;
    name?: string | null;
    passwordHash?: string | null;
    role: UserRole;
    avatarUrl?: string | null;
    emailVerifiedAt?: Date | null;
    lastLoginAt?: Date | null;
}) {
    return getPrismaClient().user.create({
        data: {
            email: input.email,
            name: input.name ?? null,
            passwordHash: input.passwordHash ?? null,
            role: input.role,
            avatarUrl: input.avatarUrl ?? null,
            emailVerifiedAt: input.emailVerifiedAt ?? null,
            lastLoginAt: input.lastLoginAt ?? null,
        },
        select: authUserSelect,
    });
}

export async function updateAuthUserById(
    id: string,
    data: {
        name?: string | null;
        passwordHash?: string;
    },
) {
    return getPrismaClient().user.update({
        where: { id },
        data,
        select: authUserSelect,
    });
}

export async function updateAuthUserByEmail(
    email: string,
    data: {
        name?: string;
        passwordHash?: string;
        avatarUrl?: string | null;
        theme?: UserTheme;
        marketing?: boolean;
        productUpdates?: boolean;
        emailVerifiedAt?: Date | null;
        lastLoginAt?: Date | null;
    },
) {
    return getPrismaClient().user.update({
        where: { email },
        data,
        select: authUserSelect,
    });
}

export async function deletePasswordResetsByUserId(userId: string) {
    return getPrismaClient().passwordReset.deleteMany({ where: { userId } });
}

export async function createPasswordReset(input: { userId: string; tokenHash: string; expiresAt: Date }) {
    return getPrismaClient().passwordReset.create({
        data: {
            userId: input.userId,
            tokenHash: input.tokenHash,
            expiresAt: input.expiresAt,
        },
    });
}

export async function findValidPasswordResetByTokenHash(tokenHash: string) {
    return getPrismaClient().passwordReset.findFirst({
        where: {
            tokenHash,
            expiresAt: { gt: new Date() },
        },
        select: { id: true },
    });
}

export async function findPasswordResetWithUserByTokenHash(tokenHash: string) {
    return getPrismaClient().passwordReset.findUnique({
        where: { tokenHash },
        select: {
            id: true,
            userId: true,
            expiresAt: true,
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
    });
}

export async function deletePasswordResetById(id: string) {
    return getPrismaClient().passwordReset.delete({ where: { id } });
}

export async function updatePasswordAndDeleteResets(input: { userId: string; passwordHash: string }) {
    return getPrismaClient().$transaction([
        getPrismaClient().user.update({
            where: { id: input.userId },
            data: { passwordHash: input.passwordHash },
        }),
        getPrismaClient().passwordReset.deleteMany({
            where: { userId: input.userId },
        }),
    ]);
}
