import 'server-only';

import { redirect } from 'next/navigation';

import { espaceRoutes, routeBuilders } from '@/config/routes';
import { normalizeProgramSlug } from '@/lib/programmes-content';
import { findEntitlementUserByEmail, findUserAccessibleProgramStateByEmail } from '@/server/apprentissage/apprentissage.repository';
import { getCurrentUser } from '@/server/auth/authz';

type EspaceAccessReason = 'unauthenticated' | 'missing_user' | 'missing_program_access';

type EspaceAllowedDecision = {
    allowed: true;
    reason: 'allowed';
    user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
    learnerUserId: string;
};

type EspaceDeniedDecision = {
    allowed: false;
    reason: EspaceAccessReason;
    redirectTo: string;
};

export type EspaceAccessDecision = EspaceAllowedDecision | EspaceDeniedDecision;

function denied(reason: EspaceAccessReason, redirectTo: string): EspaceDeniedDecision {
    return { allowed: false, reason, redirectTo };
}

/**
 * Vérifie l'accès aux pages payantes de l'espace apprenant.
 * Un entitlement valide correspond à un enrollment ACTIVE, PAUSED ou COMPLETED.
 * Une pause conserve l'accès afin que l'apprenant puisse reprendre sans perte.
 */
export async function getPaidEspaceAccessDecision(nextPath: string): Promise<EspaceAccessDecision> {
    const user = await getCurrentUser();

    if (!user) {
        return denied('unauthenticated', routeBuilders.connexionWithNext(nextPath));
    }

    const access = await findUserAccessibleProgramStateByEmail(user.email);

    if (!access) {
        return denied('missing_user', routeBuilders.connexionWithNext(nextPath));
    }

    if (access.enrollments.length === 0) {
        return denied('missing_program_access', `${espaceRoutes.root}?acces=formation-requise`);
    }

    return { allowed: true, reason: 'allowed', user, learnerUserId: access.id };
}

/**
 * Vérifie l'accès à un programme précis de l'espace apprenant.
 * La page publique du programme reste la destination de repli si l'utilisateur
 * est connecté mais n'a pas l'entitlement correspondant.
 */
export async function getProgrammeEspaceAccessDecision(programSlugLike: string, nextPath: string): Promise<EspaceAccessDecision> {
    const user = await getCurrentUser();

    if (!user) {
        return denied('unauthenticated', routeBuilders.connexionWithNext(nextPath));
    }

    const programSlug = normalizeProgramSlug(programSlugLike);
    const access = await findEntitlementUserByEmail({ email: user.email, programSlug });

    if (!access || access.deletedAt) {
        return denied('missing_user', routeBuilders.connexionWithNext(nextPath));
    }

    if (access.enrollments.length === 0) {
        return denied('missing_program_access', routeBuilders.programme(programSlug));
    }

    return { allowed: true, reason: 'allowed', user, learnerUserId: access.id };
}

export async function requirePaidEspaceAccess(nextPath: string) {
    const decision = await getPaidEspaceAccessDecision(nextPath);
    if (!decision.allowed) redirect(decision.redirectTo);
    return { ...decision.user, learnerUserId: decision.learnerUserId };
}

export async function requireProgrammeEspaceAccess(programSlugLike: string, nextPath: string) {
    const decision = await getProgrammeEspaceAccessDecision(programSlugLike, nextPath);
    if (!decision.allowed) redirect(decision.redirectTo);
    return { ...decision.user, learnerUserId: decision.learnerUserId };
}
