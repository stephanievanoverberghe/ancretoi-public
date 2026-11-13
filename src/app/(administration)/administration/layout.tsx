import 'server-only';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import { AdministrationShell } from '@/components/layout';
import { getUserState } from '@/server/apprentissage/user-state';
import { requireAdmin } from '@/server/auth/authz';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const user = await requireAdmin();
    const userState = await getUserState();

    return (
        <AdministrationShell hasActiveProgram={userState.hasActiveProgram} user={{ email: user.email, displayName: user.name ?? user.email, avatarUrl: user.avatarUrl }}>
            {children}
        </AdministrationShell>
    );
}
