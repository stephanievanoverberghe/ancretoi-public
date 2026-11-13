'use client';

import { ExternalLink, Play } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui';
import { publicMedia } from '@/config/public-media';
import { inspirationsContent } from '@/content/inspirations';
import { getYoutubeId } from '@/features/public/inspirations/inspirations.utils';
import { cn } from '@/lib/cn';

type VideoConsentPlayerProps = {
    title: string;
    videoUrl: string;
    poster?: string | null;
    className?: string;
};

export function VideoConsentPlayer({ title, videoUrl, poster, className }: VideoConsentPlayerProps) {
    const [isActivated, setIsActivated] = useState(false);
    const frameRef = useRef<HTMLIFrameElement | null>(null);
    const youtubeId = getYoutubeId(videoUrl);
    const posterSrc = poster || publicMedia.videoPoster.src;

    useEffect(() => {
        if (isActivated) frameRef.current?.focus();
    }, [isActivated]);

    return (
        <div className={cn('relative aspect-video overflow-hidden bg-foreground', className)}>
            {isActivated && youtubeId ? (
                <iframe
                    ref={frameRef}
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                />
            ) : (
                <>
                    <Image src={posterSrc} alt="" fill sizes="(max-width: 768px) 100vw, 70vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" aria-hidden="true" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-5 text-center text-white">
                        {youtubeId ? (
                            <>
                                <Button
                                    type="button"
                                    size="lg"
                                    onClick={() => setIsActivated(true)}
                                    className="rounded-full bg-white text-foreground shadow-elevated hover:bg-white/90"
                                >
                                    <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                                    Lancer la vidéo
                                </Button>
                                <p className="max-w-[46ch] text-xs leading-relaxed text-white/75">
                                    Le lecteur YouTube ne se charge qu’après ton action.
                                </p>
                            </>
                        ) : videoUrl ? (
                            <a
                                href={videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                Ouvrir sur la plateforme
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </a>
                        ) : (
                            <p className="text-sm text-white/75">{inspirationsContent.card.videoUnavailable}</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
