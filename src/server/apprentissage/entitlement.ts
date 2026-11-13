import 'server-only';

import { normalizeProgramSlug } from '@/lib/programmes-content';
import { getSession } from '@/server/auth/session';
import { findEntitlementUserByEmail } from './apprentissage.repository';

/** Jours offerts (preview) par programme, uniquement pour utilisateurs connectes. */
const PUBLIC_PREVIEW: Record<string, number[]> = {
    'reset-7': [1],
};

type AccessOK = { ok: true; mode: 'enrolled'; userId: string; email: string } | { ok: true; mode: 'preview'; userId: string; email: string };

type AccessNO = { ok: false; reason: 'auth' | 'user' | 'not_allowed' | 'enrollment' };

/**
 * Exige d'etre connecte.
 * - Si inscrit : acces total.
 * - Sinon, acces seulement si dayNum appartient a PUBLIC_PREVIEW[slug].
 */
export async function requireEnrollmentOrPreview(programSlugLike: string, dayNum: number): Promise<AccessOK | AccessNO> {
    const sess = await getSession();
    if (!sess?.email) return { ok: false, reason: 'auth' };

    const slug = normalizeProgramSlug(programSlugLike);
    const user = await findEntitlementUserByEmail({ email: sess.email, programSlug: slug });

    if (!user || user.deletedAt) return { ok: false, reason: 'user' };

    if (user.enrollments.length > 0) {
        return { ok: true, mode: 'enrolled', userId: user.id, email: user.email };
    }

    const allowed = PUBLIC_PREVIEW[slug] ?? [];
    if (allowed.includes(dayNum)) {
        return { ok: true, mode: 'preview', userId: user.id, email: user.email };
    }

    return { ok: false, reason: 'not_allowed' };
}
