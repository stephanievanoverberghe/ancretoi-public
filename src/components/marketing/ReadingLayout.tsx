import type { ReactNode } from 'react';

import { Container, Section } from '@/components/ui';
import { cn } from '@/lib/cn';

export type ReadingLayoutProps = {
    children: ReactNode;
    aside?: ReactNode;
    before?: ReactNode;
    className?: string;
    articleClassName?: string;
};

/** Colonne de lecture confortable, avec repères latéraux facultatifs sur grand écran. */
export function ReadingLayout({ children, aside, before, className, articleClassName }: ReadingLayoutProps) {
    return (
        <Section spacing="lg" className={cn('bg-background', className)}>
            <Container size="xl">
                {before ? <div className="mb-8 sm:mb-10">{before}</div> : null}
                <div className={cn('grid gap-10', Boolean(aside) && 'lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-14')}>
                    <article className={cn('public-reading-copy min-w-0 text-base leading-8 text-foreground', articleClassName)}>
                        {children}
                    </article>
                    {aside ? (
                        <aside className="border-t border-[var(--public-rule)] pt-6 text-sm text-muted-foreground lg:sticky lg:top-28 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                            {aside}
                        </aside>
                    ) : null}
                </div>
            </Container>
        </Section>
    );
}
