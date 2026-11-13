import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import { LearnerShell } from '@/components/layout';
import { getLearnerResume } from '@/server/apprentissage/espace-pages.service';
import { getUserState } from '@/server/apprentissage/user-state';
import { requireUser } from '@/server/auth/authz';

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default async function LearnerLayout({ children }: { children: ReactNode }) {
    const user = await requireUser('/espace');
    const userState = await getUserState();
    const resume = userState.hasActiveProgram ? await getLearnerResume(user) : null;

    return (
        <LearnerShell
            isAdmin={user.role === 'admin'}
            hasActiveProgram={userState.hasActiveProgram}
            resume={resume}
            user={{ email: user.email, displayName: user.name ?? user.email, avatarUrl: user.avatarUrl }}
        >
            {children}
        </LearnerShell>
    );
}
