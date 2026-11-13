import 'server-only';

import { UserRole, UserTheme } from '@/generated/prisma/enums';

import type { AuthUser, AuthUserRole, AuthUserTheme } from './auth.types';
import type { PrismaAuthUser } from './auth.repository';

export function toAuthRole(role: PrismaAuthUser['role']): AuthUserRole {
    return role === UserRole.ADMIN ? 'admin' : 'user';
}

export function toPrismaRole(role: AuthUserRole) {
    return role === 'admin' ? UserRole.ADMIN : UserRole.USER;
}

export function toAuthTheme(theme: PrismaAuthUser['theme']): AuthUserTheme {
    if (theme === UserTheme.DARK) return 'dark';
    if (theme === UserTheme.LIGHT) return 'light';
    return 'system';
}

export function toPrismaTheme(theme: AuthUserTheme) {
    if (theme === 'dark') return UserTheme.DARK;
    if (theme === 'light') return UserTheme.LIGHT;
    return UserTheme.SYSTEM;
}

export function mapPrismaUser(user: PrismaAuthUser): AuthUser {
    return {
        id: user.id,
        prismaId: user.id,
        email: user.email,
        name: user.name,
        role: toAuthRole(user.role),
        passwordHash: user.passwordHash,
        passwordChangedAt: user.passwordChangedAt,
        deletedAt: user.deletedAt,
        suspendedAt: user.suspendedAt,
        avatarUrl: user.avatarUrl,
        theme: toAuthTheme(user.theme),
        marketing: user.marketing,
        productUpdates: user.productUpdates,
        maxConcurrentPrograms: user.maxConcurrentPrograms,
        features: user.features,
        source: 'prisma',
    };
}
