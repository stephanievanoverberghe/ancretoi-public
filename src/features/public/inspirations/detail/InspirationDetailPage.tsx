import 'server-only';

import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Badge, Container, Section } from '@/components/ui';
import { publicMedia } from '@/config/public-media';
import { publicRoutes, routeBuilders } from '@/config/routes';
import { inspirationsContent } from '@/content/inspirations';
import { VideoConsentPlayer } from '@/features/public/inspirations/components/VideoConsentPlayer';
import { getPublishedInspirationDetail } from '@/server/inspirations/public-inspirations.service';

export async function generateInspirationDetailMetadata(slug: string): Promise<Metadata> {
    const { doc } = await getPublishedInspirationDetail(slug);
    if (!doc) return {};

    const img = publicMedia.videoPoster.src;
    const desc = doc.summary ?? 'Vidéo inspirante sélectionnée par Ancre-toi.';
    const url = routeBuilders.inspiration(doc.slug);

    return {
        title: `${doc.title} — Inspirations`,
        description: desc,
        alternates: { canonical: url },
        openGraph: {
            type: 'article',
            url,
            title: doc.title,
            description: desc,
            images: [{ url: img }],
        },
    };
}

export async function InspirationDetailPage({ slug }: { slug: string }) {
    const { doc, related } = await getPublishedInspirationDetail(slug);
    if (!doc) notFound();

    return (
        <Section spacing="lg" className="relative overflow-hidden bg-background">
            <div className="absolute -right-32 top-16 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" aria-hidden="true" />
            <Container size="xl">
                <Link
                    href={publicRoutes.inspirations}
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    {inspirationsContent.hero.eyebrow}
                </Link>

                <div className="relative mt-8 grid gap-7 lg:grid-cols-[minmax(18rem,0.65fr)_minmax(0,1.35fr)] lg:items-end lg:gap-10">
                    <header className="pb-2">
                        <Badge variant="secondary">Sélection vidéo</Badge>
                        <h1 className="mt-4 max-w-[16ch] text-balance font-serif text-4xl font-semibold leading-[1.04] text-foreground sm:text-5xl">{doc.title}</h1>
                        {doc.summary ? <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-muted-foreground sm:text-lg">{doc.summary}</p> : null}
                        {doc.tags?.length ? (
                            <div className="mt-5 flex flex-wrap gap-1.5">
                                {doc.tags.slice(0, 8).map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                            </div>
                        ) : null}
                        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                            <Play className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            Le lecteur externe reste désactivé tant que tu ne lances pas la vidéo.
                        </p>
                    </header>

                    <VideoConsentPlayer
                        title={doc.title}
                        videoUrl={doc.videoUrl}
                        poster={publicMedia.videoPoster.src}
                        className="rounded-[2rem] border border-border shadow-elevated"
                    />
                </div>

                {related.length ? (
                    <section className="mt-14">
                        <h2 className="font-serif text-2xl font-semibold leading-tight text-foreground">{inspirationsContent.detail.relatedTitle}</h2>
                        <ul className="mt-6 grid gap-4 md:grid-cols-12">
                            {related.map((it) => {
                                const thumbnail = publicMedia.videoPoster.src;

                                return (
                                    <li key={it.slug} className="md:col-span-4">
                                        <article className="group h-full overflow-hidden rounded-[1.75rem] border border-border bg-surface transition hover:border-primary/25 hover:shadow-elevated">
                                            <Link href={routeBuilders.inspiration(it.slug)} className="block">
                                                <div className="relative aspect-video bg-surface-muted">
                                                    <Image
                                                        src={thumbnail}
                                                        alt=""
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, 33vw"
                                                        className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.04]"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden="true" />
                                                    <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white text-primary shadow-soft" aria-hidden="true">
                                                        <Play className="h-4 w-4 fill-current" />
                                                    </span>
                                                    <div className="absolute bottom-4 left-4 right-4 text-white drop-shadow-sm">
                                                        <h3 className="line-clamp-2 font-serif text-xl font-semibold leading-snug">{it.title}</h3>
                                                    </div>
                                                </div>
                                                {it.summary ? (
                                                    <div className="p-5">
                                                        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{it.summary}</p>
                                                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground">Voir la sélection<ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                                                    </div>
                                                ) : null}
                                            </Link>
                                        </article>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                ) : null}
            </Container>
        </Section>
    );
}
