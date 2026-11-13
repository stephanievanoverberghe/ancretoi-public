import PublicHeaderClient from './PublicHeaderClient';
import { getUserState } from '@/server/apprentissage/user-state';
import { getHeaderUser } from '@/server/auth/header-user';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function PublicHeader() {
    const user = await getHeaderUser();

    if (!user.isAuthed) {
        return <PublicHeaderClient isAuthed={false} email={null} displayName={null} avatarUrl={null} />;
    }

    const userState = await getUserState();

    return <PublicHeaderClient isAuthed email={user.email} displayName={user.displayName} avatarUrl={user.avatarUrl} isAdmin={user.isAdmin} hasActiveProgram={userState.hasActiveProgram} />;
}
