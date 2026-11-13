'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Menu, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { Badge, Button } from '@/components/ui';
import { administrationNavigationItems } from '@/config/navigation';
import { administrationRoutes } from '@/config/routes';
import { adminShellContent, siteIdentity } from '@/content/layout';
import { isActiveRoute } from '@/lib/navigation';

import { AdminAccountMenu } from './AdminAccountMenu';
import { AdminCreateDialog } from './AdminCreateDialog';
import { AdminNavigation } from './AdminNavigation';

type AdministrationShellProps = {
    children: ReactNode;
    hasActiveProgram?: boolean;
    user?: {
        email?: string | null;
        displayName?: string | null;
        avatarUrl?: string | null;
    };
};

export default function AdministrationShell({ children, hasActiveProgram = false, user }: AdministrationShellProps) {
    const pathname = usePathname();
    const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
    const currentLabel = administrationNavigationItems.find((item) => isActiveRoute(pathname, item.href, { exact: item.exact }))?.label ?? adminShellContent.title;

    return (
        <div className="min-h-dvh bg-surface-muted/25">
            <div className="grid min-h-dvh xl:grid-cols-[17rem_minmax(0,1fr)]">
                <aside className="hidden border-r border-border/80 bg-surface xl:block">
                    <nav className="sticky top-0 flex h-dvh flex-col overflow-y-auto p-4" aria-label={adminShellContent.navigationLabel}>
                        <Link href={administrationRoutes.root} className="group mb-6 block rounded-3xl border border-border/80 bg-gradient-to-br from-primary/12 via-surface to-secondary/10 p-4 shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                            <span className="flex items-center gap-3">
                                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft" aria-hidden="true">
                                    <Sparkles className="h-5 w-5" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate font-serif text-xl font-semibold text-foreground">{siteIdentity.name}</span>
                                    <span className="block truncate text-xs text-muted-foreground">Studio éditorial</span>
                                </span>
                            </span>
                        </Link>

                        <AdminNavigation pathname={pathname} idPrefix="desktop" />

                        <div className="mt-auto pt-6">
                            <div className="rounded-2xl border border-border/80 bg-surface-muted/55 p-3">
                                <Badge variant="secondary" size="sm">{adminShellContent.badge}</Badge>
                                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Pilotez les contenus et l’audience depuis un espace unique.</p>
                            </div>
                        </div>
                    </nav>
                </aside>

                <div className="min-w-0">
                    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/92 backdrop-blur supports-[backdrop-filter]:bg-surface/82">
                        <div className="flex h-16 items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
                            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                                <DialogPrimitive.Root open={mobileNavigationOpen} onOpenChange={setMobileNavigationOpen}>
                                    <DialogPrimitive.Trigger asChild>
                                        <Button type="button" variant="ghost" size="icon" className="xl:hidden" aria-label={adminShellContent.mobileOpenLabel}>
                                            <Menu aria-hidden="true" className="h-5 w-5" />
                                        </Button>
                                    </DialogPrimitive.Trigger>
                                    <DialogPrimitive.Portal>
                                        <DialogPrimitive.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-overlay/50 backdrop-blur-[2px] xl:hidden" />
                                        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-[var(--z-modal)] flex w-[min(19rem,92vw)] flex-col border-r border-border bg-surface text-foreground shadow-elevated outline-none xl:hidden">
                                            <div className="flex min-h-16 items-center justify-between gap-3 border-b border-border px-4 pt-[env(safe-area-inset-top)]">
                                                <div className="min-w-0">
                                                    <DialogPrimitive.Title className="truncate font-serif text-xl font-semibold">{adminShellContent.title}</DialogPrimitive.Title>
                                                    <DialogPrimitive.Description className="truncate text-xs text-muted-foreground">{adminShellContent.eyebrow}</DialogPrimitive.Description>
                                                </div>
                                                <DialogPrimitive.Close asChild>
                                                    <Button type="button" variant="ghost" size="icon" aria-label={adminShellContent.mobileCloseLabel}>
                                                        <X aria-hidden="true" className="h-5 w-5" />
                                                    </Button>
                                                </DialogPrimitive.Close>
                                            </div>
                                            <nav className="min-h-0 flex-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]" aria-label={adminShellContent.mobileNavigationLabel}>
                                                <AdminNavigation pathname={pathname} idPrefix="mobile" onNavigate={() => setMobileNavigationOpen(false)} />
                                            </nav>
                                        </DialogPrimitive.Content>
                                    </DialogPrimitive.Portal>
                                </DialogPrimitive.Root>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Link href={administrationRoutes.root} className="truncate rounded-md font-serif text-lg font-semibold leading-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:text-xl">
                                            {currentLabel}
                                        </Link>
                                        <Badge variant="outline" size="sm" className="hidden md:inline-flex">CMS</Badge>
                                    </div>
                                    <span className="hidden truncate text-xs text-muted-foreground sm:block">{adminShellContent.breadcrumbRoot} / {currentLabel}</span>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <AdminCreateDialog />
                                <AdminAccountMenu hasActiveProgram={hasActiveProgram} user={user} />
                            </div>
                        </div>
                    </header>

                    <main id="main-content" tabIndex={-1} className="min-h-[calc(100dvh-4rem)] px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6 focus:outline-none sm:px-6 sm:pb-[calc(2.5rem+env(safe-area-inset-bottom))] sm:pt-8 lg:px-8 lg:pt-10 xl:px-10 2xl:px-12">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
