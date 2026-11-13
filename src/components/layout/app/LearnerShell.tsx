import type { ReactNode } from 'react';

import type { LearnerResumeView } from './LearnerNavigation';
import { LearnerNavigation } from './LearnerNavigation';
import { LearnerTopbar } from './LearnerTopbar';
import { learnerShellStyle } from './learner-shell.constants';

type LearnerShellProps = {
    children: ReactNode;
    isAdmin?: boolean;
    hasActiveProgram?: boolean;
    resume?: LearnerResumeView | null;
    user?: {
        email?: string | null;
        displayName?: string | null;
        avatarUrl?: string | null;
    };
};

export function LearnerShell({ children, isAdmin = false, hasActiveProgram = false, resume = null, user }: LearnerShellProps) {
    return (
        <div className="min-h-dvh bg-surface-muted/30" style={learnerShellStyle}>
            <div className="grid min-h-dvh lg:grid-cols-[19rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
                <LearnerNavigation hasActiveProgram={hasActiveProgram} isAdmin={isAdmin} resume={resume} />
                <div className="min-w-0">
                    <LearnerTopbar isAdmin={isAdmin} user={user} />
                    <main
                        id="main-content"
                        tabIndex={-1}
                        className="min-h-[calc(100dvh-4rem)] px-4 py-6 pb-[var(--learner-mobile-content-bottom)] focus:outline-none sm:px-7 sm:py-8 lg:px-10 lg:py-10 lg:pb-12 xl:px-12 xl:py-12"
                    >
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
