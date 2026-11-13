'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    from: number;
    to: number;
    currentSearch: string;
};

function buildPageHref(currentSearch: string, page: number) {
    const params = new URLSearchParams(currentSearch);
    if (page > 1) params.set('page', String(page));
    else params.delete('page');
    const query = params.toString();
    return query ? `/administration/apprenants?${query}` : '/administration/apprenants';
}

function getVisiblePages(page: number, totalPages: number) {
    const pages = new Set([1, totalPages, page - 1, page, page + 1]);
    return [...pages].filter((value) => value >= 1 && value <= totalPages).sort((left, right) => left - right);
}

export default function AdminUsersPagination({ page, pageSize, total, totalPages, from, to, currentSearch }: Props) {
    const visiblePages = getVisiblePages(page, totalPages);

    return (
        <nav aria-label="Pagination des apprenants" className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                {total === 0 ? 'Aucun résultat' : `${from}–${to} sur ${total}`} · {pageSize} par page
            </p>

            <div className="flex flex-wrap items-center gap-1">
                {page > 1 ? (
                    <Link
                        href={buildPageHref(currentSearch, page - 1)}
                        rel="prev"
                        className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        Précédent
                    </Link>
                ) : (
                    <span className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground opacity-55" aria-disabled="true">
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        Précédent
                    </span>
                )}

                <div className="hidden items-center gap-1 sm:flex">
                    {visiblePages.map((pageNumber, index) => {
                        const previousPage = visiblePages[index - 1];
                        return (
                            <span key={pageNumber} className="contents">
                                {previousPage && pageNumber - previousPage > 1 ? <span className="px-1 text-muted-foreground" aria-hidden="true">…</span> : null}
                                <Link
                                    href={buildPageHref(currentSearch, pageNumber)}
                                    aria-current={pageNumber === page ? 'page' : undefined}
                                    aria-label={`Page ${pageNumber}`}
                                    className={`grid h-10 min-w-10 place-items-center rounded-xl border px-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
                                        pageNumber === page
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border text-foreground hover:bg-surface-muted'
                                    }`}
                                >
                                    {pageNumber}
                                </Link>
                            </span>
                        );
                    })}
                </div>

                {page < totalPages ? (
                    <Link
                        href={buildPageHref(currentSearch, page + 1)}
                        rel="next"
                        className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    >
                        Suivant
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                ) : (
                    <span className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground opacity-55" aria-disabled="true">
                        Suivant
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                )}
            </div>
        </nav>
    );
}
