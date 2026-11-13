'use client';

import { Share2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui';
import { routeBuilders } from '@/config/routes';
import { blogContent } from '@/content/blog';

export function ReadingProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Le scroll du site vit sur document.body (layout flex plein écran), pas sur window.
        const getScroller = () => (document.body.scrollHeight > document.documentElement.clientHeight ? document.body : document.documentElement);

        const onScroll = () => {
            const scroller = getScroller();
            const height = scroller.scrollHeight - scroller.clientHeight;
            setProgress(height > 0 ? Math.min(100, (scroller.scrollTop / height) * 100) : 0);
        };

        onScroll();
        document.body.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            document.body.removeEventListener('scroll', onScroll);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <div className="sticky top-0 z-20 h-[3px] w-full bg-transparent">
            <div className="h-[3px] bg-gradient-to-r from-secondary to-primary" style={{ width: `${progress}%` }} aria-hidden="true" />
        </div>
    );
}

export function ShareBar({ title }: { title: string }) {
    const [copied, setCopied] = useState(false);

    const share = useCallback(async () => {
        try {
            const url = window.location.href;
            if (navigator.share) {
                await navigator.share({ title, url });
            } else {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch {
            /* ignore */
        }
    }, [title]);

    return (
        <Button variant="tertiary" size="sm" onClick={share}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            {copied ? blogContent.article.shareCopied : blogContent.article.shareLabel}
        </Button>
    );
}

export function NavCard({ kind, slug, title }: { kind: 'prev' | 'next'; slug?: string; title?: string }) {
    if (!slug) return <div className="hidden sm:block" />;

    return (
        <Link
            href={routeBuilders.article(slug)}
            className={`group rounded-[1.75rem] border border-border bg-surface px-5 py-5 transition hover:border-primary/30 hover:bg-surface-hover ${
                kind === 'prev' ? 'text-left' : 'text-right'
            }`}
        >
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {kind === 'prev' ? `← ${blogContent.article.prevLabel}` : `${blogContent.article.nextLabel} →`}
            </div>
            <div className="mt-1 font-serif text-lg leading-snug text-foreground transition group-hover:text-primary">
                {title || slug.replace(/-/g, ' ')}
            </div>
        </Link>
    );
}
