// src/app/(espace)/espace/formations/[programme]/layout.tsx
import 'server-only';
import type { ReactNode } from 'react';

import { routeBuilders } from '@/config/routes';
import { LearnerPage } from '@/features/espace/components';
import { ProgrammeOutline } from '@/features/espace/formations/components';
import { getCourseLayoutData } from '@/server/apprentissage/espace-pages.service';
import { requireProgrammeEspaceAccess } from '@/server/espace/access.service';

type RouteParams = { programme: string };

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function CourseLayout({ children, params }: { children: ReactNode; params: Promise<RouteParams> }) {
    const { programme } = await params;
    const safeSlug = programme.toLowerCase();

    const user = await requireProgrammeEspaceAccess(safeSlug, routeBuilders.formation(safeSlug));
    const { items, percent, total, doneCount, isCompleted, programName, primaryHref, primaryLabel } = await getCourseLayoutData({ safeSlug, user });

    return (
        <LearnerPage
            size="wide"
            spacing="none"
            className="grid grid-cols-1 gap-7 xl:grid-cols-[18rem_minmax(0,1fr)] xl:gap-10"
        >
            <ProgrammeOutline
                items={items}
                percent={percent}
                total={total}
                doneCount={doneCount}
                isCompleted={isCompleted}
                programName={programName}
                primaryHref={primaryHref}
                primaryLabel={primaryLabel}
            />

            <div className="min-w-0">{children}</div>
        </LearnerPage>
    );
}
