'use client';

import type { LucideIcon } from 'lucide-react';
import { BookOpen, Boxes, Home, Mail, Newspaper, Tag, Users } from 'lucide-react';
import Link from 'next/link';

import type { AdministrationNavigationIconKey } from '@/config/navigation';
import { administrationNavigationSections } from '@/config/navigation';
import { cn } from '@/lib/cn';
import { isActiveRoute } from '@/lib/navigation';

const adminIcons: Record<AdministrationNavigationIconKey, LucideIcon> = {
    book: BookOpen,
    boxes: Boxes,
    home: Home,
    mail: Mail,
    newspaper: Newspaper,
    tag: Tag,
    users: Users,
};

type AdminNavigationProps = {
    pathname: string;
    idPrefix: string;
    onNavigate?: () => void;
};

export function AdminNavigation({ pathname, idPrefix, onNavigate }: AdminNavigationProps) {
    return (
        <div className="grid gap-6">
            {administrationNavigationSections.map((section, index) => {
                const sectionTitleId = `${idPrefix}-admin-nav-section-${index}`;

                return (
                    <section key={section.title} aria-labelledby={sectionTitleId}>
                        <div className="mb-2 px-3">
                            <h2 id={sectionTitleId} className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                {section.title}
                            </h2>
                            {section.description ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.description}</p> : null}
                        </div>
                        <ul className="grid gap-1">
                            {section.links.map((item) => {
                                const active = isActiveRoute(pathname, item.href, { exact: item.exact });
                                const Icon = adminIcons[item.icon];

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            aria-current={active ? 'page' : undefined}
                                            className={cn(
                                                'group flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold motion-safe:transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                                                active ? 'bg-primary text-primary-foreground shadow-soft' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                                            )}
                                            onClick={onNavigate}
                                        >
                                            <span
                                                className={cn(
                                                    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl motion-safe:transition-colors motion-reduce:transition-none',
                                                    active ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-surface-muted text-muted-foreground group-hover:bg-surface group-hover:text-primary',
                                                )}
                                                aria-hidden="true"
                                            >
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate">{item.label}</span>
                                                {item.description ? (
                                                    <span
                                                        className={cn(
                                                            'mt-0.5 block truncate text-xs font-normal',
                                                            active ? 'text-primary-foreground' : 'text-muted-foreground',
                                                        )}
                                                    >
                                                        {item.description}
                                                    </span>
                                                ) : null}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                );
            })}
        </div>
    );
}
