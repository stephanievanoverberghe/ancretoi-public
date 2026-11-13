import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type AdminPageProps = {
    children: ReactNode;
    className?: string;
    spacing?: 'default' | 'relaxed';
};

export function AdminPage({ children, className, spacing = 'default' }: AdminPageProps) {
    return (
        <div
            className={cn(
                'mx-auto w-full max-w-[var(--container-max)]',
                spacing === 'relaxed' ? 'space-y-8 lg:space-y-10' : 'space-y-6 lg:space-y-8',
                className,
            )}
        >
            {children}
        </div>
    );
}
