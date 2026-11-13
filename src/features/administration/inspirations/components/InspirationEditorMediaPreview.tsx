'use client';

import Image from 'next/image';
import { PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAdminFormFieldValues } from '../../shared/AdminServerActionFormControls';
import { getInspirationVideoThumb } from './admin-inspirations.utils';

type InspirationEditorMediaPreviewProps = {
    initialTitle?: string | null;
    initialVideoUrl?: string | null;
};

type VideoPreview =
    | { kind: 'image'; src: string }
    | { kind: 'video'; src: string }
    | { kind: 'fallback'; host: string | null };

function getVideoPreview(value: string): VideoPreview {
    const videoUrl = value.trim();
    if (!videoUrl) return { kind: 'fallback', host: null };

    const youtubeThumb = getInspirationVideoThumb(videoUrl);
    if (youtubeThumb.src) return { kind: 'image', src: youtubeThumb.src };

    try {
        const url = new URL(videoUrl);
        const vimeoId = url.hostname.includes('vimeo.com') ? url.pathname.split('/').filter(Boolean).findLast((part) => /^\d+$/.test(part)) : null;
        if (vimeoId) return { kind: 'image', src: `https://vumbnail.com/${vimeoId}.jpg` };
        if (/\.(mp4|webm|ogg)(?:$|\?)/i.test(url.pathname + url.search)) return { kind: 'video', src: videoUrl };
        return { kind: 'fallback', host: url.hostname };
    } catch {
        return { kind: 'fallback', host: null };
    }
}

export function InspirationEditorMediaPreview({ initialTitle, initialVideoUrl }: InspirationEditorMediaPreviewProps) {
    const { markerRef, values } = useAdminFormFieldValues(
        ['title', 'videoUrl'],
        { title: initialTitle ?? '', videoUrl: initialVideoUrl ?? '' },
    );
    const [mediaFailed, setMediaFailed] = useState(false);
    const preview = getVideoPreview(values.videoUrl);

    useEffect(() => setMediaFailed(false), [values.videoUrl]);

    const showFallback = preview.kind === 'fallback' || mediaFailed;

    return (
        <aside ref={markerRef} className="overflow-hidden rounded-2xl border border-border bg-surface-muted/50" aria-label="Aperçu immédiat de la vidéo">
            <div className="relative aspect-video overflow-hidden bg-surface-muted">
                {!showFallback && preview.kind === 'image' ? (
                    <Image
                        src={preview.src}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 42rem"
                        className="object-cover"
                        onError={() => setMediaFailed(true)}
                    />
                ) : null}

                {!showFallback && preview.kind === 'video' ? (
                    <video key={preview.src} src={preview.src} controls preload="metadata" onError={() => setMediaFailed(true)} className="h-full w-full bg-black object-contain">
                        Ton navigateur ne peut pas afficher cette vidéo.
                    </video>
                ) : null}

                {showFallback ? (
                    <>
                        <Image
                            src="/images/administration/inspirations-studio.webp"
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 42rem"
                            className="object-cover opacity-45 saturate-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                    </>
                ) : (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                )}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-3 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-background/85 text-primary shadow-soft backdrop-blur">
                        <PlayCircle className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">Aperçu média</p>
                        <p className="line-clamp-2 font-display text-lg font-semibold text-foreground">{values.title.trim() || 'Titre de l’inspiration'}</p>
                    </div>
                </div>
            </div>

            <p className="px-4 py-3 text-xs text-muted-foreground">
                {!values.videoUrl.trim()
                    ? 'Ajoute une URL YouTube, Vimeo ou un fichier vidéo public.'
                    : mediaFailed
                      ? 'Le média ne peut pas être chargé : fallback affiché.'
                      : preview.kind === 'fallback'
                        ? preview.host
                            ? `Aperçu automatique indisponible pour ${preview.host}.`
                            : 'URL vidéo invalide.'
                        : 'Aperçu issu de l’URL renseignée.'}
            </p>
        </aside>
    );
}
