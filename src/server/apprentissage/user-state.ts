import 'server-only';

import { getSession } from '@/server/auth/session';
import { findUserAccessibleProgramStateByEmail } from './apprentissage.repository';

/** Renvoie l'état utile pour le CTA du teaser. */
export async function getUserState() {
    const sess = await getSession();
    const email = sess?.email ?? null;

    if (!email) {
        return {
            isAuthed: false,
            hasActiveProgram: false,
            activeProgramSlug: null as string | null,
        };
    }

    const user = await findUserAccessibleProgramStateByEmail(email);

    if (!user) {
        return {
            isAuthed: false,
            hasActiveProgram: false,
            activeProgramSlug: null,
        };
    }

    return {
        isAuthed: true,
        hasActiveProgram: user.enrollments.length > 0,
        activeProgramSlug: user.enrollments[0]?.programSlug ?? null,
    };
}
