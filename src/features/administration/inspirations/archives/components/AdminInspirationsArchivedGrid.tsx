// src/features/administration/inspirations/archives/components/AdminInspirationsArchivedGrid.tsx
'use client';

import Image from 'next/image';
import RestoreInspirationButton from './RestoreInspirationButton';
import { Archive, PlayCircle, CalendarClock } from 'lucide-react';

import { Badge } from '@/components/ui';
import { AdminStatePanel } from '../../../shared';

type Row = {
    id: string;
    slug: string;
    status: 'draft' | 'published';
    title: string;
    videoUrl: string | null;
    summary: string | null;
    tags: string[];
    timestamps: { createdAt: string | null; updatedAt: string | null; deletedAt?: string | null };
};

function videoThumb(videoUrl: string | null): { src: string | null; alt: string } {
    if (!videoUrl) return { src: null, alt: 'Aucun visuel' };
    try {
        const yt = new URL(videoUrl);
        if (['www.youtube.com', 'youtube.com'].includes(yt.hostname)) {
            const id = yt.searchParams.get('v');
            if (id) return { src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: 'Miniature YouTube' };
        }
        if (yt.hostname === 'youtu.be') {
            const id = yt.pathname.replace('/', '');
            if (id) return { src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: 'Miniature YouTube' };
        }
        return { src: null, alt: 'Aucun visuel' };
    } catch {
        return { src: null, alt: 'Aucun visuel' };
    }
}

function formatRelative(iso: string | null | undefined) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('fr-FR');
}

export default function AdminInspirationsArchivedGrid({ rows }: { rows: Row[] }) {
    if (!rows.length) {
        return <AdminStatePanel kind="empty" title="Aucune inspiration archivée" description="Les inspirations archivées apparaîtront ici." icon={Archive} />;
    }

    return (
        <ul className="@container/admin-archive grid grid-cols-1 gap-5 @min-[40rem]/admin-archive:grid-cols-2 @min-[72rem]/admin-archive:grid-cols-3">
            {rows.map((r) => {
                const thumb = videoThumb(r.videoUrl);
                return (
                    <li key={r.id} className="group overflow-hidden rounded-[1.4rem] border border-border bg-surface shadow-soft">
                        <div className="relative aspect-[16/10] w-full bg-surface-muted">
                            {thumb.src ? (
                                <Image src={thumb.src} alt="" fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 320px" className="object-cover grayscale saturate-50" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                    <PlayCircle className="h-10 w-10" />
                                </div>
                            )}
                            <Badge variant="warning" className="absolute left-2 top-2">Archivé</Badge>
                        </div>

                        <div className="p-4">
                            <div className="text-xs text-muted-foreground">/{r.slug}</div>
                            <h3 className="line-clamp-2 text-base font-semibold">{r.title}</h3>

                            {r.summary && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.summary}</p>}

                            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                                <CalendarClock className="h-4 w-4" />
                                archivé {formatRelative(r.timestamps.deletedAt)}
                            </div>

                            <div className="mt-4 space-y-2">
                                <RestoreInspirationButton slug={r.slug} />
                                <p className="text-center text-xs text-muted-foreground">La suppression définitive n’est pas disponible pour les inspirations.</p>
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
