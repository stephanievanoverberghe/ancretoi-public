'use client';

import { ArrowUpRight, SlidersHorizontal, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button, SearchInput } from '@/components/ui';
import { Select } from '@/components/ui/forms/client';
import { publicMedia } from '@/config/public-media';
import { routeBuilders } from '@/config/routes';
import { blogContent } from '@/content/blog';
import type { BlogItem } from '@/features/public/blog/blog.types';
import { cn } from '@/lib/cn';

type SortKey = 'recent' | 'alphaAsc' | 'alphaDesc' | 'short' | 'long';

const LS_KEY = 'blog:list:v3';
const ALL_VALUE = '__all__';
const FALLBACK_COVER = publicMedia.editorialFallback.src;

type Persisted = { q: string; sort: SortKey; tag: string | null; category: string | null };

function normalizePublicPath(path?: string | null) {
    if (!path) return '';
    return path.startsWith('/') ? path : `/${path}`;
}

function formatDateSafe(date?: string | Date | null) {
    if (!date) return '';
    const value = new Date(date);
    return Number.isNaN(value.getTime()) ? '' : value.toISOString();
}

function formatDateHuman(date?: string | Date | null) {
    if (!date) return '';
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return '';
    return value.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function articleGridClassName(index: number) {
    const position = index % 5;
    if (position === 0) return 'md:col-span-7 lg:col-span-8';
    if (position === 1) return 'md:col-span-5 lg:col-span-4';
    if (position === 2) return 'md:col-span-5 lg:col-span-4';
    return 'md:col-span-7 lg:col-span-4';
}

const sortOptions = (Object.entries(blogContent.toolbar.sortOptions) as [SortKey, string][]).map(([value, label]) => ({ value, label }));

export default function BlogGalleryClient({ items }: { items: BlogItem[] }) {
    const [qRaw, setQRaw] = useState('');
    const [q, setQ] = useState('');
    const [sort, setSort] = useState<SortKey>('recent');
    const [tag, setTag] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [storageReady, setStorageReady] = useState(false);
    const searchRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const id = window.setTimeout(() => setQ(qRaw), 220);
        return () => window.clearTimeout(id);
    }, [qRaw]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
            const target = event.target as HTMLElement | null;
            if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
            event.preventDefault();
            searchRef.current?.focus();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) {
                const saved = JSON.parse(raw) as Partial<Persisted>;
                setQRaw(saved.q ?? '');
                setQ(saved.q ?? '');
                setSort(saved.sort ?? 'recent');
                setTag(saved.tag ?? null);
                setCategory(saved.category ?? null);
            }
        } catch {
            // La persistance est un confort : la collection reste utilisable sans stockage local.
        } finally {
            setStorageReady(true);
        }
    }, []);

    useEffect(() => {
        if (!storageReady) return;
        const saved: Persisted = { q, sort, tag, category };
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(saved));
        } catch {
            // Certains navigateurs bloquent le stockage en navigation privée.
        }
    }, [category, q, sort, storageReady, tag]);

    const allTags = useMemo(() => {
        const values = new Set<string>();
        for (const item of items) (item.tags ?? []).forEach((value) => value && values.add(value));
        return Array.from(values).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
    }, [items]);

    const allCategories = useMemo(() => {
        const values = new Set<string>();
        for (const item of items) if (item.category) values.add(item.category);
        return Array.from(values).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
    }, [items]);

    const list = useMemo(() => {
        const query = q.trim().toLocaleLowerCase('fr');
        const filtered = items.filter((item) => {
            if (tag && !(item.tags ?? []).includes(tag)) return false;
            if (category && item.category !== category) return false;
            if (!query) return true;
            const searchable = `${item.title ?? ''} ${item.summary ?? ''} ${(item.tags ?? []).join(' ')} ${item.category ?? ''}`.toLocaleLowerCase('fr');
            return searchable.includes(query);
        });

        filtered.sort((a, b) => {
            if (sort === 'alphaAsc') return (a.title ?? '').localeCompare(b.title ?? '', 'fr', { sensitivity: 'base' });
            if (sort === 'alphaDesc') return (b.title ?? '').localeCompare(a.title ?? '', 'fr', { sensitivity: 'base' });
            if (sort === 'short') return (a.readingTimeMin ?? 9999) - (b.readingTimeMin ?? 9999);
            if (sort === 'long') return (b.readingTimeMin ?? 0) - (a.readingTimeMin ?? 0);
            return formatDateSafe(b.publishedAt).localeCompare(formatDateSafe(a.publishedAt));
        });
        return filtered;
    }, [category, items, q, sort, tag]);

    const hasFilters = Boolean(qRaw || tag || category || sort !== 'recent');
    const resetFilters = () => {
        setQRaw('');
        setQ('');
        setTag(null);
        setCategory(null);
        setSort('recent');
    };

    const categoryOptions = [{ value: ALL_VALUE, label: blogContent.toolbar.categoryAll }, ...allCategories.map((value) => ({ value, label: value }))];
    const tagOptions = [{ value: ALL_VALUE, label: blogContent.toolbar.tagAll }, ...allTags.map((value) => ({ value, label: value }))];

    return (
        <>
            <div className="rounded-[1.75rem] border border-border bg-surface/90 p-3 shadow-soft sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative min-w-0 flex-1">
                        <SearchInput
                            ref={searchRef}
                            placeholder={blogContent.toolbar.searchPlaceholder}
                            value={qRaw}
                            onChange={(event) => setQRaw(event.target.value)}
                            aria-label={blogContent.toolbar.searchAriaLabel}
                            className="pr-10"
                        />
                        {qRaw ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={blogContent.toolbar.clearSearchLabel}
                                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                                onClick={() => {
                                    setQRaw('');
                                    setQ('');
                                }}
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        ) : null}
                    </div>

                    <div className="hidden min-w-[30rem] grid-cols-3 gap-2 sm:grid">
                        <Select aria-label={blogContent.toolbar.categoryLabel} value={category ?? ALL_VALUE} onValueChange={(value) => setCategory(value === ALL_VALUE ? null : value)} options={categoryOptions} />
                        <Select aria-label={blogContent.toolbar.tagLabel} value={tag ?? ALL_VALUE} onValueChange={(value) => setTag(value === ALL_VALUE ? null : value)} options={tagOptions} />
                        <Select aria-label={blogContent.toolbar.sortLabel} value={sort} onValueChange={(value) => setSort(value as SortKey)} options={sortOptions} />
                    </div>

                    <details className="group rounded-2xl border border-border bg-background sm:hidden">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                            <span className="inline-flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" aria-hidden="true" />Filtres et tri</span>
                            <span className="text-xs text-muted-foreground group-open:hidden">Ouvrir</span>
                            <span className="hidden text-xs text-muted-foreground group-open:inline">Fermer</span>
                        </summary>
                        <div className="grid gap-2 border-t border-border p-3">
                            <Select aria-label={blogContent.toolbar.categoryLabel} value={category ?? ALL_VALUE} onValueChange={(value) => setCategory(value === ALL_VALUE ? null : value)} options={categoryOptions} />
                            <Select aria-label={blogContent.toolbar.tagLabel} value={tag ?? ALL_VALUE} onValueChange={(value) => setTag(value === ALL_VALUE ? null : value)} options={tagOptions} />
                            <Select aria-label={blogContent.toolbar.sortLabel} value={sort} onValueChange={(value) => setSort(value as SortKey)} options={sortOptions} />
                        </div>
                    </details>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 px-1">
                    <p className="text-xs text-muted-foreground" aria-live="polite">
                        {list.length} {list.length > 1 ? 'articles' : 'article'}
                    </p>
                    {hasFilters ? (
                        <Button variant="ghost" size="sm" onClick={resetFilters}>Réinitialiser</Button>
                    ) : null}
                </div>
            </div>

            {list.length ? (
                <ul className="mt-8 grid items-stretch gap-4 md:grid-cols-12 lg:gap-5">
                    {list.map((post, index) => {
                        const providedCover = normalizePublicPath(post.coverPath);
                        const cover = providedCover || FALLBACK_COVER;
                        const date = formatDateHuman(post.publishedAt);
                        const href = routeBuilders.article(post.slug);
                        const isLead = index % 5 === 0;

                        return (
                            <li key={post.slug} className={articleGridClassName(index)}>
                                <article className="group relative flex h-full min-h-[25rem] overflow-hidden rounded-[2rem] border border-border bg-surface shadow-soft">
                                    <Image
                                        src={cover}
                                        alt={providedCover ? post.coverAlt?.trim() || blogContent.card.coverAltFallback : ''}
                                        fill
                                        sizes={isLead ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 34vw'}
                                        className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.035]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/5" aria-hidden="true" />
                                    <div className="relative mt-auto flex w-full flex-col p-5 text-white sm:p-6 lg:p-7">
                                        <div className="flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.13em] text-white/75">
                                            {post.category ? <span>{post.category}</span> : null}
                                            {post.category && date ? <span aria-hidden="true">·</span> : null}
                                            {date ? <time dateTime={formatDateSafe(post.publishedAt)}>{date}</time> : null}
                                            {typeof post.readingTimeMin === 'number' ? <span>· {post.readingTimeMin} min</span> : null}
                                        </div>
                                        <h3 className={cn('mt-3 max-w-[22ch] font-serif font-semibold leading-[1.08] text-white', isLead ? 'text-3xl sm:text-4xl' : 'text-2xl')}>
                                            <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                                                {post.title?.trim() || blogContent.card.untitled}
                                            </Link>
                                        </h3>
                                        {post.summary ? <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-white/78 line-clamp-3">{post.summary}</p> : null}
                                        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                                            {blogContent.card.readCta}<ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                                        </span>
                                    </div>
                                </article>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="mt-8 rounded-[2rem] border border-dashed border-border bg-surface-muted px-6 py-10 text-center" role="status">
                    <p className="font-serif text-2xl text-foreground">{blogContent.empty.noResults}</p>
                    <p className="mx-auto mt-2 max-w-[50ch] text-sm leading-relaxed text-muted-foreground">Essaie un autre mot ou reviens à l’ensemble du carnet.</p>
                    <Button variant="tertiary" className="mt-5" onClick={resetFilters}>Voir tous les articles</Button>
                </div>
            )}
        </>
    );
}
