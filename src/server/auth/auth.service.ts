import 'server-only';

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import { isPasswordAcceptable } from '@/lib/password';

import {
    createPasswordResetWithPrisma,
    findUserByEmailWithPrisma,
    hashPasswordResetToken,
    registerPasswordUserWithPrisma,
    updatePrismaUserAvatar,
    updatePrismaUserPasswordByEmail,
    updatePrismaUserPreferences,
    updatePrismaUserProfile,
    verifyPasswordResetWithPrisma,
    verifyUserPasswordWithPrisma,
    consumePasswordResetWithPrisma,
    normalizeAuthEmail,
    recordPrismaUserLogin,
} from './auth-prisma.service';
import type { AuthUser, AuthUserTheme, PasswordResetResult, RegisterPasswordUserResult } from './auth.types';

export { normalizeAuthEmail };

type PasswordAuthResult =
    | {
          ok: true;
          user: AuthUser;
      }
    | {
          ok: false;
          reason: 'user_not_found' | 'missing_password' | 'bad_password';
          user?: AuthUser | null;
      };

type ChangePasswordResult =
    | {
          ok: true;
      }
    | {
          ok: false;
          error: 'invalid_account' | 'current_password' | 'weak_password';
          issues?: string[];
      };

export async function getAuthUserByEmail(email: string, options: { includeDeleted?: boolean } = {}) {
    return await findUserByEmailWithPrisma(email, options);
}

export async function registerPasswordUser(input: { email: string; name?: string | null; passwordHash: string }): Promise<RegisterPasswordUserResult> {
    return await registerPasswordUserWithPrisma(input);
}

export async function authenticatePasswordUser(input: { email: string; password: string }): Promise<PasswordAuthResult> {
    const prismaResult = await verifyUserPasswordWithPrisma(input);
    if (prismaResult.ok && prismaResult.user) {
        return {
            ok: true,
            user: prismaResult.user,
        };
    }

    return {
        ok: false,
        reason: prismaResult.reason ?? 'missing_password',
        user: prismaResult.user,
    };
}

export async function recordSuccessfulPasswordLogin(email: string) {
    await recordPrismaUserLogin(email);
}

export async function requestPasswordReset(input: { email: string; baseUrl: string }) {
    const email = normalizeAuthEmail(input.email);
    const raw = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashPasswordResetToken(raw);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const user = await createPasswordResetWithPrisma({
        email,
        tokenHash,
        expiresAt,
    });

    if (!user) return null;

    return {
        email,
        resetUrl: `${input.baseUrl}/reinitialiser-mot-de-passe?token=${raw}`,
    };
}

export async function verifyPasswordResetToken(token: string) {
    const tokenHash = hashPasswordResetToken(token);
    return await verifyPasswordResetWithPrisma(tokenHash);
}

export async function resetPasswordWithToken(input: { token: string; password: string }): Promise<PasswordResetResult> {
    const tokenHash = hashPasswordResetToken(input.token);
    return await consumePasswordResetWithPrisma({ tokenHash, password: input.password });
}

export async function changeUserPassword(input: { email: string; currentPassword: string; nextPassword: string }): Promise<ChangePasswordResult> {
    const prismaResult = await verifyUserPasswordWithPrisma({ email: input.email, password: input.currentPassword });
    if (!prismaResult.ok || !prismaResult.user) {
        return { ok: false, error: prismaResult.reason === 'bad_password' ? 'current_password' : 'invalid_account' };
    }

    const check = isPasswordAcceptable(input.nextPassword, prismaResult.user.email, prismaResult.user.name || undefined);
    if (!check.ok) return { ok: false, error: 'weak_password', issues: check.issues };

    const passwordHash = await bcrypt.hash(input.nextPassword, 12);
    await updatePrismaUserPasswordByEmail({ email: prismaResult.user.email, passwordHash });
    return { ok: true };
}

export async function updateAuthUserProfile(input: { email: string; name: string }) {
    return await updatePrismaUserProfile(input);
}

export async function updateAuthUserPreferences(input: {
    email: string;
    theme?: AuthUserTheme;
    marketing?: boolean;
    productUpdates?: boolean;
}) {
    return await updatePrismaUserPreferences(input);
}

export async function updateAuthUserAvatar(input: { email: string; name?: string; avatarUrl?: string | null }) {
    return await updatePrismaUserAvatar(input);
}
