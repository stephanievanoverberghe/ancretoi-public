'use client';

import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAdminFormFieldValues } from '../../shared/AdminServerActionFormControls';

type ArticleEditorMediaPreviewProps = {
    initialTitle?: string | null;
    initialCoverPath?: string | null;
    initialCoverAlt?: string | null;
};

function isLocalPublicPath(value: string): boolean {
    return value.startsWith('/') && !value.startsWith('//');
}

export function ArticleEditorMediaPreview({ initialTitle, initialCoverPath, initialCoverAlt }: ArticleEditorMediaPreviewProps) {
    const { markerRef, values } = useAdminFormFieldValues(['title', 'coverPath', 'coverAlt'], {
        title: initialTitle ?? '',
        coverPath: initialCoverPath ?? '',
        coverAlt: initialCoverAlt ?? '',
    });
    const [imageFailed, setImageFailed] = useState(false);
    const coverPath = values.coverPath.trim();
    const hasUsableCover = isLocalPublicPath(coverPath) && !imageFailed;

    useEffect(() => setImageFailed(false), [coverPath]);

    return (
        <aside ref={markerRef} className="overflow-hidden rounded-2xl border border-border bg-surface-muted/50" aria-label="Aperçu immédiat de la couverture">
            <div className="relative aspect-[16/7] min-h-48 overflow-hidden bg-surface-muted">
                {hasUsableCover ? (
                    <Image
                        src={coverPath}
                        alt={values.coverAlt.trim()}
                        fill
                        sizes="(max-width: 768px) 100vw, 70rem"
                        className="object-cover"
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <>
                        <Image
                            src="/images/administration/editorial-studio.webp"
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 70rem"
                            className="object-cover opacity-45 saturate-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
                        <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                            <ImageIcon className="h-9 w-9" aria-hidden="true" />
                        </div>
                    </>
                )}

                <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">Aperçu de couverture</p>
                    <p className="mt-1 line-clamp-2 font-display text-xl font-semibold text-foreground">{values.title.trim() || 'Titre de l’article'}</p>
                </div>
            </div>

            <div className="grid gap-1 px-4 py-3 text-xs text-muted-foreground sm:grid-cols-2">
                <span className="truncate">{coverPath || 'Ajoute un chemin local depuis /public.'}</span>
                <span className="sm:text-right">
                    {coverPath && !isLocalPublicPath(coverPath)
                        ? 'Le chemin doit commencer par /.'
                        : imageFailed
                          ? 'Image introuvable : fallback affiché.'
                          : values.coverAlt.trim() || 'Texte alternatif à renseigner.'}
                </span>
            </div>
        </aside>
    );
}
