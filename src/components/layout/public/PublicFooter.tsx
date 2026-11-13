import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Youtube } from 'lucide-react';

import { NewsletterSignup } from '@/components/marketing';
import { Container } from '@/components/ui';
import { legalNavigationItems, publicFooterNavigationSections, socialNavigationItems } from '@/config/navigation';
import { authRoutes, espaceRoutes, publicRoutes } from '@/config/routes';
import { publicFooterContent, siteIdentity } from '@/content/layout';
import { legalIdentity } from '@/content/legal/legal-identity';
import { getHeaderUser } from '@/server/auth/header-user';

const socialIcons = {
    instagram: Instagram,
    youtube: Youtube,
} as const;

export default async function PublicFooter() {
    const year = new Date().getFullYear();
    const user = await getHeaderUser();
    const hiddenFooterHrefs = new Set<string>([
        ...(user.isAuthed ? [authRoutes.connexion, authRoutes.inscription] : []),
        ...(user.isAuthed ? [] : [espaceRoutes.root]),
    ]);
    const footerSections = publicFooterNavigationSections
        .map((section) => ({
            ...section,
            links: section.links.filter((link) => !hiddenFooterHrefs.has(link.href)),
        }))
        .filter((section) => section.links.length > 0);
    const socialLinks = socialNavigationItems.filter((item) => item.external);

    return (
        // shrink-0 : le body est un conteneur flex ; avec overflow-hidden le
        // footer deviendrait sinon écrasable par flexbox (min-height passe à 0).
        <footer role="contentinfo" className="public-footer relative shrink-0 overflow-hidden border-t border-border/80 text-foreground">
            <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full border border-primary/10" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-secondary/7 blur-3xl" aria-hidden="true" />

            <Container size="xl" className="relative py-14 sm:py-16 lg:py-20">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
                    <div className="max-w-2xl">
                        <p className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--public-sage)]">Un espace pour revenir à soi</p>
                        <Link
                            href={publicRoutes.home}
                            className="inline-flex cursor-pointer items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                        >
                            <span className="grid h-12 w-12 place-items-center rounded-full border border-border bg-surface/80 shadow-soft">
                                <Image src={siteIdentity.logoSrc} alt="" width={38} height={38} className="rounded-full p-0.5" />
                            </span>
                            <span className="font-serif text-2xl tracking-tight">{siteIdentity.name}</span>
                        </Link>
                        <p className="mt-6 max-w-xl font-serif text-3xl leading-[1.15] tracking-tight text-foreground sm:text-4xl">{publicFooterContent.tagline}</p>
                        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">{publicFooterContent.description}</p>

                        <div id="newsletter" className="mt-8 scroll-mt-28 rounded-[1.5rem] border border-border/80 bg-surface/65 p-4 shadow-soft backdrop-blur sm:p-5">
                            <h2 className="text-sm font-semibold text-foreground">{publicFooterContent.newsletter.title}</h2>
                            <p className="mt-1 text-xs text-muted-foreground">{publicFooterContent.newsletter.description}</p>
                            <NewsletterSignup className="mt-3" />
                        </div>

                        {socialLinks.length > 0 && (
                            <nav aria-label={publicFooterContent.socialLabel} className="mt-7 flex items-center gap-2">
                                {socialLinks.map(({ href, label, icon, external }) => {
                                    const Icon = icon ? socialIcons[icon as keyof typeof socialIcons] : Instagram;

                                    return (
                                        <a
                                            key={href}
                                            href={href}
                                            target={external ? '_blank' : undefined}
                                            rel={external ? 'noreferrer' : undefined}
                                            aria-label={label}
                                            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                        >
                                            <Icon aria-hidden="true" className="h-4 w-4" />
                                        </a>
                                    );
                                })}
                            </nav>
                        )}
                    </div>

                    <div className="grid gap-9 border-t border-border/80 pt-8 sm:grid-cols-3 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-4 xl:pl-14">
                        {footerSections.map((section) => (
                            <nav key={section.title} aria-label={section.title}>
                                <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--public-sage)]">{section.title}</h3>
                                <ul className="mt-5 grid gap-3 text-sm">
                                    {section.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="cursor-pointer rounded-md text-foreground/80 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>
                </div>

                <div className="mt-14 flex flex-col gap-5 border-t border-border/80 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <p>
                            &copy; {year} {siteIdentity.name}. {publicFooterContent.copyrightSuffix}
                        </p>
                        <p>
                            Site de démonstration conçu par{' '}
                            <a
                                href={legalIdentity.website}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {legalIdentity.websiteLabel}
                            </a>
                        </p>
                    </div>
                    <nav aria-label={publicFooterContent.legalLabel} className="flex flex-wrap gap-x-4 gap-y-2">
                        {legalNavigationItems.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="cursor-pointer rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </Container>
        </footer>
    );
}
