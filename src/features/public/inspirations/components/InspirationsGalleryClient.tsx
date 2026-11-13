'use client';

import { ArrowRight, Play, SlidersHorizontal, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Badge, Button, SearchInput } from '@/components/ui';
import { Select } from '@/components/ui/forms/client';
import { FullscreenModal } from '@/components/ui/overlays';
import { publicMedia } from '@/config/public-media';
import { routeBuilders } from '@/config/routes';
import { inspirationsContent } from '@/content/inspirations';
import type { InspirationItem } from '@/features/public/inspirations/inspirations.types';
import { cn } from '@/lib/cn';

import { VideoConsentPlayer } from './VideoConsentPlayer';

type SortKey = 'recent' | 'alphaAsc' | 'alphaDesc';

const LS_KEY = 'inspirations:list:v2';
const ALL_VALUE = '__all__';

type Persisted = { q: string; sort: SortKey; tag: string | null };

function formatDateSafe(date?: string | Date) {
    if (!date) return '';
    const value = new Date(date);
    return Number.isNaN(value.getTime()) ? '' : value.toISOString();
}

function itemGridClassName(index: number) {
    if (index % 4 === 0) return 'md:col-span-7';
    if (index % 4 === 1) return 'md:col-span-5';
    if (index % 4 === 2) return 'md:col-span-5';
    return 'md:col-span-7';
}

const sortOptions = (Object.entries(inspirationsContent.toolbar.sortOptions) as [SortKey, string][]).map(([value, label]) => ({ value, label }));

export default function InspirationsGalleryClient({ items }: { items: InspirationItem[] }) {
    const [qRaw, setQRaw] = useState('');
    const [q, setQ] = useState('');
    const [sort, setSort] = useState<SortKey>('recent');
    const [tag, setTag] = useState<string | null>(null);
    const [storageReady, setStorageReady] = useState(false);
    const [current, setCurrent] = useState<InspirationItem | null>(null);
    const openerRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const id = window.setTimeout(() => setQ(qRaw), 200);
        return () => window.clearTimeout(id);
    }, [qRaw]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) {
                const saved = JSON.parse(raw) as Partial<Persisted>;
                setQRaw(saved.q ?? '');
                setQ(saved.q ?? '');
                setSort(saved.sort ?? 'recent');
                setTag(saved.tag ?? null);
            }
        } catch {
            // La galerie reste utilisable si le stockage local est bloqué.
        } finally {
            setStorageReady(true);
        }
    }, []);

    useEffect(() => {
        if (!storageReady) return;
        try {
            localStorage.setItem(LS_KEY, JSON.stringify({ q, sort, tag } satisfies Persisted));
        } catch {
            // La persistance est optionnelle.
        }
    }, [q, sort, storageReady, tag]);

    const allTags = useMemo(() => {
        const values = new Set<string>();
        for (const item of items) (item.tags ?? []).forEach((value) => value && values.add(value));
        return Array.from(values).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
    }, [items]);

    const list = useMemo(() => {
        const query = q.trim().toLocaleLowerCase('fr');
        const filtered = items.filter((item) => {
            if (tag && !(item.tags ?? []).includes(tag)) return false;
            if (!query) return true;
            return `${item.title} ${item.summary ?? ''} ${(item.tags ?? []).join(' ')}`.toLocaleLowerCase('fr').includes(query);
        });

        filtered.sort((a, b) => {
            if (sort === 'alphaAsc') return a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' });
            if (sort === 'alphaDesc') return b.title.localeCompare(a.title, 'fr', { sensitivity: 'base' });
            return formatDateSafe(b.createdAt).localeCompare(formatDateSafe(a.createdAt));
        });
        return filtered;
    }, [items, q, sort, tag]);

    const hasFilters = Boolean(qRaw || tag || sort !== 'recent');
    const resetFilters = () => {
        setQRaw('');
        setQ('');
        setTag(null);
        setSort('recent');
    };
    const closeModal = () => {
        setCurrent(null);
        window.requestAnimationFrame(() => openerRef.current?.focus());
    };
    const tagOptions = [{ value: ALL_VALUE, label: inspirationsContent.toolbar.tagAll }, ...allTags.map((value) => ({ value, label: value }))];

    return (
        <>
            <div className="rounded-[1.75rem] border border-border bg-surface/90 p-3 shadow-soft sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative min-w-0 flex-1">
                        <SearchInput placeholder={inspirationsContent.toolbar.searchPlaceholder} value={qRaw} onChange={(event) => setQRaw(event.target.value)} aria-label={inspirationsContent.toolbar.searchAriaLabel} className="pr-10" />
                        {qRaw ? (
                            <Button variant="ghost" size="icon" aria-label={inspirationsContent.toolbar.clearSearchLabel} className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2" onClick={() => { setQRaw(''); setQ(''); }}>
                                <X className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        ) : null}
                    </div>
                    <div className="hidden min-w-[20rem] grid-cols-2 gap-2 sm:grid">
                        <Select aria-label={inspirationsContent.toolbar.tagLabel} value={tag ?? ALL_VALUE} onValueChange={(value) => setTag(value === ALL_VALUE ? null : value)} options={tagOptions} />
                        <Select aria-label={inspirationsContent.toolbar.sortLabel} value={sort} onValueChange={(value) => setSort(value as SortKey)} options={sortOptions} />
                    </div>
                    <details className="group rounded-2xl border border-border bg-background sm:hidden">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                            <span className="inline-flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" aria-hidden="true" />Filtres et tri</span>
                            <span className="text-xs text-muted-foreground group-open:hidden">Ouvrir</span><span className="hidden text-xs text-muted-foreground group-open:inline">Fermer</span>
                        </summary>
                        <div className="grid gap-2 border-t border-border p-3">
                            <Select aria-label={inspirationsContent.toolbar.tagLabel} value={tag ?? ALL_VALUE} onValueChange={(value) => setTag(value === ALL_VALUE ? null : value)} options={tagOptions} />
                            <Select aria-label={inspirationsContent.toolbar.sortLabel} value={sort} onValueChange={(value) => setSort(value as SortKey)} options={sortOptions} />
                        </div>
                    </details>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 px-1">
                    <p className="text-xs text-muted-foreground" aria-live="polite">{list.length} {list.length > 1 ? 'inspirations' : 'inspiration'}</p>
                    {hasFilters ? <Button variant="ghost" size="sm" onClick={resetFilters}>Réinitialiser</Button> : null}
                </div>
            </div>

            {list.length ? (
                <ul className="mt-8 grid gap-4 md:grid-cols-12 lg:gap-5">
                    {list.map((item, index) => {
                        const thumbnail = publicMedia.videoPoster.src;
                        const isWide = index % 4 === 0 || index % 4 === 3;

                        return (
                            <li key={`${item.slug ?? 'video'}-${item.videoUrl}`} className={itemGridClassName(index)}>
                                <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-border bg-surface transition hover:border-primary/25 hover:shadow-elevated">
                                    <button type="button" onClick={(event) => { openerRef.current = event.currentTarget; setCurrent(item); }} className="relative aspect-video cursor-pointer overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset" aria-label={`${inspirationsContent.card.openLabel} ${item.title}`}>
                                        <Image src={thumbnail} alt="" fill sizes={isWide ? '(max-width: 768px) 100vw, 58vw' : '(max-width: 768px) 100vw, 42vw'} className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.04]" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden="true" />
                                        <span className="absolute left-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-white text-primary shadow-elevated transition-transform group-hover:scale-105" aria-hidden="true"><Play className="h-5 w-5 fill-current" /></span>
                                        <h3 className={cn('absolute bottom-4 left-5 right-5 max-w-[24ch] font-serif font-semibold leading-tight text-white', isWide ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl')}>{item.title}</h3>
                                    </button>

                                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                                        {item.summary ? <p className="line-clamp-3 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">{item.summary}</p> : <p className="text-sm text-muted-foreground">Une sélection vidéo à découvrir à ton rythme.</p>}
                                        {item.tags?.length ? <div className="mt-4 flex flex-wrap gap-1.5">{item.tags.slice(0, 4).map((value) => <Badge key={value} variant="outline">{value}</Badge>)}</div> : null}
                                        <div className="mt-auto flex flex-wrap items-center gap-4 pt-5">
                                            <Button variant="tertiary" size="sm" onClick={(event) => { openerRef.current = event.currentTarget; setCurrent(item); }}><Play className="h-4 w-4" aria-hidden="true" />Regarder</Button>
                                            {item.slug ? <Link href={routeBuilders.inspiration(item.slug)} className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-primary">Voir la sélection<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link> : null}
                                        </div>
                                    </div>
                                </article>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="mt-8 rounded-[2rem] border border-dashed border-border bg-surface-muted px-6 py-10 text-center" role="status">
                    <p className="font-serif text-2xl text-foreground">{inspirationsContent.empty.noResults}</p>
                    <p className="mx-auto mt-2 max-w-[50ch] text-sm leading-relaxed text-muted-foreground">Modifie ta recherche ou retrouve toute la sélection.</p>
                    <Button variant="tertiary" className="mt-5" onClick={resetFilters}>Voir toutes les inspirations</Button>
                </div>
            )}

            <FullscreenModal open={Boolean(current)} onClose={closeModal} title={current?.title}>
                {current ? (
                    <div>
                        <VideoConsentPlayer key={current.videoUrl} title={current.title} videoUrl={current.videoUrl} />
                        {current.summary ? <p className="mt-4 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">{current.summary}</p> : null}
                    </div>
                ) : null}
            </FullscreenModal>
        </>
    );
}
