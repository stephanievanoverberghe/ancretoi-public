import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { administrationRoutes, espaceRoutes, routeBuilders } from '@/config/routes';
import { getAuthUserByEmail } from '@/server/auth/auth.service';
import { getSession } from '@/server/auth/session';

export const getCurrentUser = cache(async function getCurrentUserForRequest() {
    const sess = await getSession();
    if (!sess?.email) return null;
    const user = await getAuthUserByEmail(sess.email);
    if (!user) return null;
    if (user.passwordChangedAt && sess.iat && sess.iat * 1000 < new Date(user.passwordChangedAt).getTime()) {
        return null;
    }
    return user;
});

/**
 * Exige un utilisateur admin et redirige sans exposer de detail d'autorisation.
 */
export const requireAdmin = cache(async function requireAdminForRequest() {
    const user = await getCurrentUser();
    if (!user) redirect(routeBuilders.connexionWithNext(administrationRoutes.root));
    if (user.role !== 'admin') redirect('/');
    return user;
});

/**
 * Exige un utilisateur connecte pour une route serveur protegee.
 */
export async function requireUser(nextPath: string = espaceRoutes.root) {
    const user = await getCurrentUser();
    if (!user) {
        redirect(routeBuilders.connexionWithNext(nextPath));
    }
    return user;
}
