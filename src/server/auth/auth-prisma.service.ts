import 'server-only';

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import { isPasswordAcceptable } from '@/lib/password';
import { isPrismaConfigured } from '@/server/db/prisma';

import type { AuthUserRole, AuthUserTheme, PasswordResetResult, RegisterPasswordUserResult } from './auth.types';
import { mapPrismaUser, toPrismaRole, toPrismaTheme } from './auth.mapper';
import {
    createAuthUser,
    createPasswordReset,
    deletePasswordResetById,
    deletePasswordResetsByUserId,
    findAuthUserByEmail,
    findAuthUserById,
    findPasswordResetWithUserByTokenHash,
    findValidPasswordResetByTokenHash,
    updateAuthUserByEmail,
    updatePasswordAndDeleteResets,
} from './auth.repository';

export function normalizeAuthEmail(email: string) {
    return String(email || '').toLowerCase().trim();
}

export function hashPasswordResetToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export function canUsePrismaAuth() {
    return isPrismaConfigured();
}

export async function findUserByEmailWithPrisma(email: string, options: { includeDeleted?: boolean } = {}) {
    if (!canUsePrismaAuth()) return null;

    const normalizedEmail = normalizeAuthEmail(email);
    if (!normalizedEmail) return null;

    const user = await findAuthUserByEmail(normalizedEmail);

    if (!user) return null;
    if (!options.includeDeleted && user.deletedAt) return null;

    return mapPrismaUser(user);
}

export async function findUserByIdWithPrisma(id: string, options: { includeDeleted?: boolean } = {}) {
    if (!canUsePrismaAuth()) return null;
    if (!id) return null;

    const user = await findAuthUserById(id);

    if (!user) return null;
    if (!options.includeDeleted && user.deletedAt) return null;

    return mapPrismaUser(user);
}

export async function createUserWithPrisma(input: { email: string; name?: string | null; passwordHash: string; role?: AuthUserRole }) {
    const email = normalizeAuthEmail(input.email);
    const user = await createAuthUser({
        email,
        name: input.name,
        passwordHash: input.passwordHash,
        role: toPrismaRole(input.role ?? 'user'),
    });

    return mapPrismaUser(user);
}

/**
 * Inscrit un utilisateur email/password dans Prisma.
 * Un e-mail déjà présent, même créé via Google, doit passer par la connexion.
 */
export async function registerPasswordUserWithPrisma(input: { email: string; name?: string | null; passwordHash: string }): Promise<RegisterPasswordUserResult> {
    const email = normalizeAuthEmail(input.email);
    const existing = await findAuthUserByEmail(email);

    if (existing) {
        return {
            status: 'email_in_use',
            user: mapPrismaUser(existing),
        };
    }

    const user = await createUserWithPrisma({
        email,
        name: input.name,
        passwordHash: input.passwordHash,
        role: 'user',
    });

    return {
        status: 'created',
        user,
    };
}

/**
 * Verifie un mot de passe utilisateur sans exposer le hash.
 * Le resultat distingue l'absence de mot de passe et un mot de passe invalide pour les routes auth.
 */
export async function verifyUserPasswordWithPrisma(input: { email: string; password: string }) {
    const user = await findUserByEmailWithPrisma(input.email, { includeDeleted: true });
    if (!user) {
        return { ok: false, reason: 'user_not_found' as const, user: null };
    }

    if (!user.passwordHash) {
        return { ok: false, reason: 'missing_password' as const, user };
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) return { ok: false, reason: 'bad_password' as const, user };

    return { ok: true as const, user };
}

export async function recordPrismaUserLogin(email: string) {
    const user = await updateAuthUserByEmail(normalizeAuthEmail(email), { lastLoginAt: new Date() });
    return mapPrismaUser(user);
}

export async function updatePrismaUserPasswordByEmail(input: { email: string; passwordHash: string }) {
    const user = await updateAuthUserByEmail(normalizeAuthEmail(input.email), { passwordHash: input.passwordHash });

    return mapPrismaUser(user);
}

export async function updatePrismaUserProfile(input: { email: string; name: string }) {
    const user = await updateAuthUserByEmail(normalizeAuthEmail(input.email), { name: input.name });

    return mapPrismaUser(user);
}

export async function updatePrismaUserPreferences(input: {
    email: string;
    theme?: AuthUserTheme;
    marketing?: boolean;
    productUpdates?: boolean;
}) {
    const user = await updateAuthUserByEmail(normalizeAuthEmail(input.email), {
        ...(input.theme ? { theme: toPrismaTheme(input.theme) } : {}),
        ...(typeof input.marketing === 'boolean' ? { marketing: input.marketing } : {}),
        ...(typeof input.productUpdates === 'boolean' ? { productUpdates: input.productUpdates } : {}),
    });

    return mapPrismaUser(user);
}

export async function updatePrismaUserAvatar(input: { email: string; name?: string; avatarUrl?: string | null }) {
    const user = await updateAuthUserByEmail(normalizeAuthEmail(input.email), {
        ...(typeof input.name === 'string' ? { name: input.name } : {}),
        ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    });

    return mapPrismaUser(user);
}

/**
 * Cree un token de reinitialisation et invalide les anciens tokens du meme utilisateur.
 */
export async function createPasswordResetWithPrisma(input: { email: string; tokenHash: string; expiresAt: Date }) {
    const user = await findUserByEmailWithPrisma(input.email, { includeDeleted: false });
    if (!user?.prismaId) return null;

    await deletePasswordResetsByUserId(user.prismaId);
    await createPasswordReset({
        userId: user.prismaId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
    });

    return user;
}

export async function verifyPasswordResetWithPrisma(tokenHash: string) {
    if (!canUsePrismaAuth()) return false;

    const reset = await findValidPasswordResetByTokenHash(tokenHash);

    return Boolean(reset);
}

/**
 * Consomme un token de reinitialisation valide, applique la politique mot de passe,
 * met a jour le hash et supprime les resets de l'utilisateur.
 */
export async function consumePasswordResetWithPrisma(input: { tokenHash: string; password: string }): Promise<PasswordResetResult> {
    const reset = await findPasswordResetWithUserByTokenHash(input.tokenHash);

    if (!reset || reset.expiresAt <= new Date()) {
        return { ok: false, error: 'invalid_token' };
    }

    if (!reset.user) {
        await deletePasswordResetById(reset.id);
        return { ok: false, error: 'invalid_token' };
    }

    const check = isPasswordAcceptable(input.password, reset.user.email, reset.user.name || undefined);
    if (!check.ok) {
        return { ok: false, error: 'weak_password', issues: check.issues };
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    await updatePasswordAndDeleteResets({ userId: reset.userId, passwordHash });

    return { ok: true };
}
