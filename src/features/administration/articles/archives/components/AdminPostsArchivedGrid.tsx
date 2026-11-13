// src/features/administration/articles/archives/components/AdminPostsArchivedGrid.tsx
'use client';

import Image from 'next/image';
import { Archive, CalendarClock, ImageIcon } from 'lucide-react';

import { Badge } from '@/components/ui';

import { AdminStatePanel } from '../../../shared';
import RestorePostButton from './RestorePostButton';
import DeleteArchivedPostButton from './DeleteArchivedPostButton';

type Row = {
    id: string;
    slug: string; // utilisé par les actions, pas affiché
    status: 'draft' | 'published';
    title: string;
    coverPath: string | null;
    summary: string | null; // non affiché ici
    timestamps: { createdAt: string | null; updatedAt: string | null; deletedAt?: string | null };
};

function formatRelative(iso?: string | null) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('fr-FR');
}

export default function AdminPostsArchivedGrid({ rows }: { rows: Row[] }) {
    if (!rows.length) {
        return <AdminStatePanel kind="empty" title="Aucun article archivé" description="Les articles archivés apparaîtront ici." icon={Archive} />;
    }

    return (
        <ul className="@container/admin-archive grid grid-cols-1 gap-5 @min-[40rem]/admin-archive:grid-cols-2 @min-[72rem]/admin-archive:grid-cols-3">
            {rows.map((r) => (
                <li key={r.id} className="group flex flex-col overflow-hidden rounded-[1.4rem] border border-border bg-surface shadow-soft">
                    <div className="relative aspect-[16/10] w-full bg-surface-muted">
                        {r.coverPath ? (
                            <Image src={r.coverPath} alt="" fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" className="object-cover grayscale saturate-50" />
                        ) : (
                            <div className="grid h-full w-full place-items-center text-muted-foreground">
                                <ImageIcon className="h-10 w-10" />
                            </div>
                        )}
                        <Badge variant="warning" className="absolute left-2 top-2">Archivé</Badge>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                        <h3 className="line-clamp-2 text-base font-semibold min-h-[2.75rem]">{r.title}</h3>

                        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarClock className="h-4 w-4" />
                            <span>archivé {formatRelative(r.timestamps.deletedAt)}</span>
                        </div>

                        <div className="mt-auto pt-3">
                            <div className="space-y-2">
                                <RestorePostButton id={r.id} slug={r.slug} />
                                <div className="flex justify-end"><DeleteArchivedPostButton id={r.id} slug={r.slug} className="justify-center" /></div>
                            </div>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}
