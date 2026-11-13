import { CalendarDays, Clock3, ListTree } from 'lucide-react';
import type { ReactNode } from 'react';

import { Container } from '@/components/ui';
import { legalIdentity } from '@/content/legal/legal-identity';
import { legalDocumentUpdatedAt } from '@/content/legal/legal-registry';
import { cn } from '@/lib/cn';

export type LegalTocItem = {
    href: `#${string}`;
    label: string;
};

type LegalDocumentLayoutProps = {
    title: string;
    description: string;
    eyebrow?: string;
    updatedAt?: string;
    readingTime?: string;
    toc?: readonly LegalTocItem[];
    notice?: ReactNode;
    children: ReactNode;
};

type LegalSectionProps = {
    id: string;
    title: string;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
};

function LegalToc({ items }: { items: readonly LegalTocItem[] }) {
    return (
        <ol className="mt-4 space-y-1.5">
            {items.map((item) => (
                <li key={item.href}>
                    <a
                        href={item.href}
                        className="group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm leading-snug text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                        <span className="h-px w-4 shrink-0 bg-[var(--public-rule)] transition-all group-hover:w-6 group-hover:bg-primary" aria-hidden="true" />
                        <span>{item.label}</span>
                    </a>
                </li>
            ))}
        </ol>
    );
}

function toIsoDate(date: string) {
    return date.split('/').reverse().join('-');
}

export function createLegalPageJsonLd(name: string, updatedAt = legalDocumentUpdatedAt) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name,
        about: legalIdentity.siteName,
        isPartOf: {
            '@type': 'WebSite',
            name: legalIdentity.siteName,
            url: '/',
        },
        publisher: {
            '@type': 'Organization',
            name: legalIdentity.legalName,
            url: legalIdentity.website,
            email: legalIdentity.email,
            address: {
                '@type': 'PostalAddress',
                postalCode: legalIdentity.postalCode,
                addressLocality: legalIdentity.addressLocality,
                addressCountry: 'FR',
            },
        },
        dateModified: toIsoDate(updatedAt),
    } as const;
}

export function LegalDocumentLayout({
    title,
    description,
    eyebrow = 'Informations légales',
    updatedAt = legalDocumentUpdatedAt,
    readingTime,
    toc = [],
    notice,
    children,
}: LegalDocumentLayoutProps) {
    return (
        <div className="relative overflow-clip">
            <header className="relative border-b border-[var(--public-rule)] bg-surface/45">
                <div className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-primary/8 blur-3xl" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-36 left-[8%] size-72 rounded-full bg-[color-mix(in_srgb,var(--public-gold)_10%,transparent)] blur-3xl" aria-hidden="true" />
                <Container size="xl" className="relative py-12 sm:py-16 lg:py-20">
                    <div className="max-w-4xl">
                        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            <span className="size-2 rounded-full bg-[var(--public-gold)]" aria-hidden="true" />
                            {eyebrow}
                        </p>
                        <h1 className="mt-5 max-w-[20ch] text-balance font-serif text-4xl font-semibold leading-[1.03] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">
                            {title}
                        </h1>
                        <p className="mt-5 max-w-[68ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                            {description}
                        </p>
                        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 border-t border-[var(--public-rule)] pt-5 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                                <CalendarDays className="size-4 text-primary" aria-hidden="true" />
                                Mis à jour le {updatedAt}
                            </span>
                            {readingTime ? (
                                <span className="inline-flex items-center gap-2">
                                    <Clock3 className="size-4 text-primary" aria-hidden="true" />
                                    {readingTime}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </Container>
            </header>

            <Container size="xl" className="py-10 sm:py-14 lg:py-20">
                {notice ? (
                    <div className="mx-auto mb-8 max-w-[72ch] border-l-2 border-[var(--public-gold)] bg-surface-muted/65 px-5 py-4 text-sm leading-6 text-muted-foreground sm:mb-10 sm:px-6">
                        {notice}
                    </div>
                ) : null}

                {toc.length ? (
                    <details className="group mb-8 rounded-2xl border border-border/80 bg-surface/75 p-4 shadow-soft lg:hidden">
                        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 font-semibold text-foreground marker:content-none">
                            <span className="inline-flex items-center gap-2">
                                <ListTree className="size-4 text-primary" aria-hidden="true" />
                                Sommaire
                            </span>
                            <span className="text-xl font-light text-muted-foreground transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                        </summary>
                        <nav aria-label="Sommaire de la page">
                            <LegalToc items={toc} />
                        </nav>
                    </details>
                ) : null}

                <div className={cn('mx-auto grid max-w-5xl gap-12', toc.length && 'lg:grid-cols-[15rem_minmax(0,72ch)] lg:items-start lg:gap-14')}>
                    {toc.length ? (
                        <nav className="sticky top-28 hidden max-h-[calc(100dvh-8rem)] overflow-y-auto pr-2 lg:block" aria-label="Sommaire de la page">
                            <p className="flex items-center gap-2 font-serif text-lg font-semibold text-foreground">
                                <ListTree className="size-4 text-primary" aria-hidden="true" />
                                Sommaire
                            </p>
                            <LegalToc items={toc} />
                        </nav>
                    ) : null}

                    <article className="min-w-0 max-w-[72ch] text-pretty text-base leading-8 text-muted-foreground [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/30 [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:decoration-primary [&_li]:pl-1 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p+p]:mt-4 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:my-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
                        {children}
                    </article>
                </div>
            </Container>
        </div>
    );
}

export function LegalSection({ id, title, icon, children, className }: LegalSectionProps) {
    return (
        <section id={id} className={cn('scroll-mt-28 border-b border-[var(--public-rule)] py-9 first:pt-0 last:border-b-0 last:pb-0 sm:py-11', className)}>
            <div className="mb-5 flex items-start gap-4">
                {icon ? (
                    <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                        {icon}
                    </span>
                ) : null}
                <h2 className="text-balance font-serif text-2xl font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-3xl">
                    {title}
                </h2>
            </div>
            <div>{children}</div>
        </section>
    );
}

export function LegalNote({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('my-5 border-l-2 border-[var(--public-sage)] bg-surface-muted/60 px-5 py-4 text-sm leading-6 text-muted-foreground', className)}>
            {children}
        </div>
    );
}
