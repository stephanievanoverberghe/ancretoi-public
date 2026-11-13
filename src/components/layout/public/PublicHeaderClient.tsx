'use client';

import * as Dialog from '@radix-ui/react-dialog';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Boxes, ChevronDown, Menu, Play, Sparkles, Target, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button, Container, LinkButton } from '@/components/ui';
import { accountNavigationItems, programmesMenuItems, publicHeaderNavigationItems, type NavigationIconKey } from '@/config/navigation';
import { administrationRoutes, publicRoutes } from '@/config/routes';
import { publicHeaderContent, siteIdentity } from '@/content/layout';
import type { AuthDialogView } from '@/features/auth/components/AuthDialog';
import { cn } from '@/lib/cn';
import { isActiveRoute } from '@/lib/navigation';

import { AccountAvatar } from '../AccountAvatar';
import PublicLogoutButton from './PublicLogoutButton';

const AuthDialog = dynamic(
    () =>
        import('@/features/auth/components/AuthDialog').then(
            (module) => module.AuthDialog,
        ),
    { ssr: false },
);

type PublicHeaderClientProps = {
    isAuthed: boolean;
    email: string | null;
    displayName: string | null;
    avatarUrl?: string | null;
    isAdmin?: boolean;
    hasActiveProgram?: boolean;
};

const menuIcons: Partial<Record<NavigationIconKey, typeof Boxes>> = {
    boxes: Boxes,
    play: Play,
    target: Target,
    sparkles: Sparkles,
};

function BrandLink({ onNavigate }: { onNavigate?: () => void }) {
    return (
        <Link
            href={publicRoutes.home}
            onClick={onNavigate}
            className="group inline-flex cursor-pointer items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
            <span className="grid h-10 w-10 place-items-center rounded-full border border-border/80 bg-surface/85 shadow-soft transition-transform duration-300 group-hover:-rotate-3">
                <Image src={siteIdentity.logoSrc} alt="" width={32} height={32} priority={false} className="rounded-full p-0.5" />
            </span>
            <span className="grid leading-none">
                <span className="font-serif text-xl tracking-tight text-foreground">{siteIdentity.name}</span>
                <span className="mt-1 hidden text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground xl:block">Rituels guidés</span>
            </span>
        </Link>
    );
}

/** Lien du menu déroulant Programmes : icône, label et description. */
function ProgrammesMenuLink({ item, onNavigate }: { item: (typeof programmesMenuItems)[number]; onNavigate?: () => void }) {
    const Icon = (item.icon && menuIcons[item.icon]) || Boxes;

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            className="group flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/15 bg-primary/8 text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{item.label}</span>
                {item.description ? <span className="block truncate text-xs text-muted-foreground">{item.description}</span> : null}
            </span>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
        </Link>
    );
}

function DesktopNav({ pathname }: { pathname: string }) {
    const [programmesOpen, setProgrammesOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!programmesOpen) return;

        function handlePointerDown(event: MouseEvent) {
            const target = event.target as Node;
            if (menuRef.current?.contains(target)) return;
            setProgrammesOpen(false);
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setProgrammesOpen(false);
                menuButtonRef.current?.focus();
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [programmesOpen]);

    const programmesActive = isActiveRoute(pathname, publicRoutes.programmes) || isActiveRoute(pathname, publicRoutes.quizBoussole);
    const otherItems = publicHeaderNavigationItems.filter((item) => item.href !== publicRoutes.programmes);

    return (
        <nav className="hidden items-center gap-0.5 rounded-full border border-border/70 bg-surface/65 p-1 shadow-soft backdrop-blur-xl lg:flex" aria-label={publicHeaderContent.mainNavLabel}>
            <div ref={menuRef} className="relative">
                <button
                    ref={menuButtonRef}
                    type="button"
                    aria-expanded={programmesOpen}
                    aria-haspopup="true"
                    aria-controls="programmes-menu"
                    onClick={() => setProgrammesOpen((value) => !value)}
                    className={cn(
                        'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                        programmesActive || programmesOpen ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                    )}
                >
                    Programmes
                    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', programmesOpen && 'rotate-180')} aria-hidden="true" />
                </button>

                {programmesOpen ? (
                    <div
                        id="programmes-menu"
                        role="group"
                        aria-label={publicHeaderContent.programmesMenuLabel}
                        className="absolute left-0 top-full z-50 mt-3 w-80 rounded-[1.5rem] border border-border/80 bg-surface/95 p-2 shadow-elevated backdrop-blur-xl"
                    >
                        {programmesMenuItems.map((item) => (
                            <ProgrammesMenuLink key={item.href} item={item} onNavigate={() => setProgrammesOpen(false)} />
                        ))}
                    </div>
                ) : null}
            </div>

            {otherItems.map((item) => {
                const active = isActiveRoute(pathname, item.href, { exact: item.exact });

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                            'cursor-pointer rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                            active ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                        )}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

export default function PublicHeaderClient({ isAuthed, email, displayName, avatarUrl, isAdmin = false, hasActiveProgram = false }: PublicHeaderClientProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [authView, setAuthView] = useState<AuthDialogView>('login');
    const [scrolled, setScrolled] = useState(false);
    const accountButtonRef = useRef<HTMLButtonElement>(null);
    const accountPanelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Le scroll du site vit sur document.body (layout flex plein écran).
        const onScroll = () => setScrolled((document.body.scrollTop || document.documentElement.scrollTop) > 8);

        onScroll();
        document.body.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            document.body.removeEventListener('scroll', onScroll);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    useEffect(() => {
        if (!accountOpen) return;

        function handlePointerDown(event: MouseEvent) {
            const target = event.target as Node;
            if (accountPanelRef.current?.contains(target) || accountButtonRef.current?.contains(target)) return;
            setAccountOpen(false);
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setAccountOpen(false);
                accountButtonRef.current?.focus();
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [accountOpen]);

    const closeMobile = () => setMobileOpen(false);
    const openAuth = (view: AuthDialogView) => {
        setAuthView(view);
        setAuthOpen(true);
        setMobileOpen(false);
    };
    const otherMobileItems = publicHeaderNavigationItems.filter((item) => item.href !== publicRoutes.programmes);
    const accountItems = accountNavigationItems;

    return (
        <header
            className={cn(
                'sticky top-0 z-50 border-b bg-background/82 backdrop-blur-xl transition-[box-shadow,border-color,background-color] duration-300 supports-[backdrop-filter]:bg-background/72',
                scrolled ? 'border-border/80 shadow-soft' : 'border-transparent',
            )}
        >
            <Container size="xl" className="flex h-16 items-center justify-between gap-3 sm:h-[4.5rem] lg:gap-5">
                <BrandLink />

                <DesktopNav pathname={pathname} />

                <div className="hidden items-center gap-2 lg:flex">
                    {isAuthed ? (
                        <>
                            {hasActiveProgram ? (
                                <LinkButton href={publicHeaderContent.learnerCta.href} variant="primary" size="md" className="rounded-full px-5">
                                    {publicHeaderContent.learnerCta.label}
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </LinkButton>
                            ) : (
                                <LinkButton href={publicHeaderContent.primaryCta.href} variant="primary" size="md" className="rounded-full px-5">
                                    Voir les programmes
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </LinkButton>
                            )}
                            <div className="relative">
                                <button
                                    ref={accountButtonRef}
                                    type="button"
                                    aria-label={publicHeaderContent.accountMenuLabel}
                                    aria-expanded={accountOpen}
                                    aria-controls="public-account-menu"
                                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border/80 bg-surface/75 py-1 pl-1 pr-2.5 text-left shadow-soft transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                    onClick={() => setAccountOpen((value) => !value)}
                                >
                                    <AccountAvatar displayName={displayName} email={email} avatarUrl={avatarUrl} />
                                    <span className="hidden max-w-32 truncate text-sm font-medium text-foreground xl:block">{displayName ?? email}</span>
                                    <ChevronDown aria-hidden="true" className={cn('h-4 w-4 text-muted-foreground transition-transform', accountOpen && 'rotate-180')} />
                                </button>

                                {accountOpen && (
                                    <div
                                        ref={accountPanelRef}
                                        id="public-account-menu"
                                        className="absolute right-0 top-14 w-80 rounded-[1.5rem] border border-border/80 bg-surface/95 p-3 shadow-elevated backdrop-blur-xl"
                                    >
                                        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted p-3">
                                            <AccountAvatar displayName={displayName} email={email} avatarUrl={avatarUrl} size="md" />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-foreground">{displayName ?? email}</p>
                                                {displayName && <p className="truncate text-xs text-muted-foreground">{email}</p>}
                                            </div>
                                        </div>
                                        <nav className="mt-3 grid gap-1" aria-label={publicHeaderContent.accountLinksLabel}>
                                            {accountItems.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                                    onClick={() => setAccountOpen(false)}
                                                >
                                                    {item.label}
                                                </Link>
                                            ))}
                                            {isAdmin && (
                                                <Link
                                                    href={administrationRoutes.root}
                                                    className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                                    onClick={() => setAccountOpen(false)}
                                                >
                                                    {publicHeaderContent.accountAdminLabel}
                                                </Link>
                                            )}
                                        </nav>
                                        <div className="mt-3 border-t border-border pt-3">
                                            <PublicLogoutButton variant="menu" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Button type="button" variant="ghost" size="md" onClick={() => openAuth('login')}>
                                {publicHeaderContent.auth.login}
                            </Button>
                            <LinkButton href={publicHeaderContent.primaryCta.href} variant="primary" size="md" className="rounded-full px-5">
                                {publicHeaderContent.primaryCta.label}
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </LinkButton>
                        </>
                    )}
                </div>

                <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
                    <Dialog.Trigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="lg:hidden" aria-label={publicHeaderContent.mobileOpenLabel}>
                            <Menu aria-hidden="true" className="h-5 w-5" />
                        </Button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Overlay className="public-theme fixed inset-0 z-50 bg-overlay/80 backdrop-blur-sm lg:hidden" />
                        <Dialog.Content
                            id="public-mobile-menu"
                            aria-label={publicHeaderContent.mobileNavLabel}
                            className="public-theme fixed right-0 top-0 z-50 h-dvh w-[min(26rem,94vw)] overflow-y-auto border-l border-border bg-background shadow-elevated transition-transform duration-200 data-[state=closed]:translate-x-full data-[state=open]:translate-x-0 lg:hidden"
                        >
                            <Dialog.Title className="sr-only">{publicHeaderContent.mobileNavLabel}</Dialog.Title>
                            <Dialog.Description className="sr-only">{publicHeaderContent.mainNavLabel}</Dialog.Description>
                            <div className="flex h-16 items-center justify-between border-b border-border/80 px-4 pt-[env(safe-area-inset-top)]">
                                <BrandLink onNavigate={closeMobile} />
                                <Dialog.Close asChild>
                                    <Button type="button" variant="ghost" size="icon" aria-label={publicHeaderContent.mobileCloseLabel}>
                                        <X aria-hidden="true" className="h-5 w-5" />
                                    </Button>
                                </Dialog.Close>
                            </div>

                            <div className="grid gap-6 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-6">
                                {isAuthed && (
                                    <div className="flex items-center gap-3 rounded-2xl bg-surface-muted/75 p-3">
                                        <AccountAvatar displayName={displayName} email={email} avatarUrl={avatarUrl} size="md" />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-foreground">{displayName ?? email}</p>
                                            {displayName && <p className="truncate text-xs text-muted-foreground">{email}</p>}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Programmes</p>
                                    <nav className="mt-2 grid gap-1 rounded-2xl bg-surface/70 p-2" aria-label={publicHeaderContent.programmesMenuLabel}>
                                        {programmesMenuItems.map((item) => (
                                            <ProgrammesMenuLink key={item.href} item={item} onNavigate={closeMobile} />
                                        ))}
                                    </nav>
                                </div>

                                <div>
                                    <p className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Explorer</p>
                                    <nav className="mt-2 grid gap-1 rounded-2xl bg-surface/70 p-2" aria-label={publicHeaderContent.mobileNavLabel}>
                                        {otherMobileItems.map((item) => {
                                            const active = isActiveRoute(pathname, item.href, { exact: item.exact });

                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    aria-current={active ? 'page' : undefined}
                                                    className={cn(
                                                        'cursor-pointer rounded-xl px-3 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                                                        active ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                                                    )}
                                                    onClick={closeMobile}
                                                >
                                                    {item.label}
                                                </Link>
                                            );
                                        })}
                                    </nav>
                                </div>

                                {isAuthed && (
                                    <div>
                                        <p className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{publicHeaderContent.accountLinksLabel}</p>
                                        <nav className="mt-2 grid gap-1 rounded-2xl bg-surface/70 p-2" aria-label={publicHeaderContent.accountLinksLabel}>
                                            {hasActiveProgram && (
                                                <Link
                                                    href={publicHeaderContent.learnerCta.href}
                                                    className="cursor-pointer rounded-xl bg-primary px-3 py-3 text-base font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                                    onClick={closeMobile}
                                                >
                                                    {publicHeaderContent.learnerCta.label}
                                                </Link>
                                            )}
                                            {accountItems.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="cursor-pointer rounded-xl px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                                    onClick={closeMobile}
                                                >
                                                    {item.label}
                                                </Link>
                                            ))}
                                            {isAdmin && (
                                                <Link
                                                    href={administrationRoutes.root}
                                                    className="cursor-pointer rounded-xl px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                                    onClick={closeMobile}
                                                >
                                                    {publicHeaderContent.accountAdminLabel}
                                                </Link>
                                            )}
                                        </nav>
                                    </div>
                                )}

                                {isAuthed ? (
                                    <PublicLogoutButton variant="primary" />
                                ) : (
                                    <div className="grid gap-2">
                                        <Link
                                            href={publicHeaderContent.primaryCta.href}
                                            onClick={closeMobile}
                                            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-medium leading-none text-primary-foreground shadow-soft transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                        >
                                            {publicHeaderContent.primaryCta.label}
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => openAuth('login')}
                                            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium leading-none text-foreground shadow-soft transition-colors duration-200 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                        >
                                            {publicHeaderContent.auth.login}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openAuth('register')}
                                            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md px-4 text-sm font-medium leading-none text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                        >
                                            {publicHeaderContent.auth.register}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
                {!isAuthed ? <AuthDialog open={authOpen} initialView={authView} nextPath="/espace" onOpenChange={setAuthOpen} /> : null}
            </Container>
        </header>
    );
}
