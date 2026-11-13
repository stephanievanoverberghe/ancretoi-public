import 'server-only';
import { espaceRoutes } from '@/config/routes';
import { requireUser } from '@/server/auth/authz';
import { getAuthUserByEmail } from './auth.service';

/**
 * Retourne le prenom affiche dans l'espace apprenant pour l'utilisateur courant.
 * Le local-part email sert uniquement de repli si le profil n'a pas encore de nom.
 */
export async function getDisplayName(redirectTo = espaceRoutes.root) {
    const user = await requireUser(redirectTo);
    const userDoc = await getAuthUserByEmail(user.email);

    const raw = (userDoc?.name ?? '').trim();
    if (raw) return raw.split(' ')[0];

    const local = user.email.split('@')[0] ?? '';
    return local ? local.charAt(0).toUpperCase() + local.slice(1) : 'toi';
}
