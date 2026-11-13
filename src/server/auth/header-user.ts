import 'server-only';

import { getAuthUserByEmail } from './auth.service';
import { getSession } from './session';

export type HeaderUser = {
    isAuthed: boolean;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    isAdmin?: boolean;
};

export async function getHeaderUser(): Promise<HeaderUser> {
    const session = await getSession();

    if (!session?.email) {
        return {
            isAuthed: false,
            email: null,
            displayName: null,
            avatarUrl: null,
        };
    }

    const user = await getAuthUserByEmail(session.email, { includeDeleted: true });

    return {
        isAuthed: true,
        email: user?.email ?? session.email,
        displayName: user?.name ?? null,
        avatarUrl: user?.avatarUrl ?? null,
        isAdmin: user?.role === 'admin',
    };
}
