import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ImageIcon } from 'lucide-react';

import { Badge, Card } from '@/components/ui';

type AdminMediaCardProps = {
    title: string;
    href: string;
    kindLabel: string;
    statusLabel: string;
    statusVariant?: 'secondary' | 'success' | 'warning' | 'outline';
    imageSrc?: string | null;
    imageAlt?: string;
    summary?: string | null;
    meta?: string;
};

export function AdminMediaCard({
    title,
    href,
    kindLabel,
    statusLabel,
    statusVariant = 'outline',
    imageSrc,
    imageAlt = '',
    summary,
    meta,
}: AdminMediaCardProps) {
    return (
        <Card className="group grid min-h-44 overflow-hidden rounded-3xl border-border/80 bg-surface sm:grid-cols-[9rem_minmax(0,1fr)]">
            <div className="relative min-h-40 overflow-hidden bg-surface-muted sm:min-h-full">
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={imageAlt}
                        fill
                        unoptimized
                        sizes="(max-width: 639px) 100vw, 144px"
                        className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
                    />
                ) : (
                    <div className="grid h-full min-h-40 place-items-center bg-gradient-to-br from-primary/12 via-surface-muted to-secondary/10 text-primary" aria-hidden="true">
                        <ImageIcon className="h-7 w-7" />
                    </div>
                )}
            </div>
            <div className="flex min-w-0 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{kindLabel}</span>
                    <Badge variant={statusVariant} size="sm">{statusLabel}</Badge>
                </div>
                <h3 className="mt-3 font-serif text-xl font-semibold leading-tight text-foreground">
                    <Link href={href} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                        {title}
                    </Link>
                </h3>
                {summary ? <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{summary}</p> : null}
                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : <span />}
                    <Link href={href} aria-label={`Ouvrir ${title}`} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground motion-safe:transition-colors motion-reduce:transition-none hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </Card>
    );
}
