import { Suspense, type ReactNode } from 'react';

import PublicFooter from './PublicFooter';
import PublicHeader from './PublicHeader';

type PublicChromeProps = {
    children: ReactNode;
};

export default function PublicChrome({ children }: PublicChromeProps) {
    return (
        <div className="public-theme public-shell flex w-full flex-1 flex-col">
            <Suspense
                fallback={
                    <div className="h-16 shrink-0 border-b border-border/70 bg-surface/80 sm:h-[4.5rem]">
                        <span className="sr-only">Chargement de la navigation…</span>
                    </div>
                }
            >
                <PublicHeader />
            </Suspense>
            <main id="main-content" tabIndex={-1} className="w-full flex-1 overflow-clip focus:outline-none">
                {children}
            </main>
            <PublicFooter />
        </div>
    );
}
