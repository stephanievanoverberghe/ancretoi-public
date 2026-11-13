import { ArrowRight, PlayCircle } from 'lucide-react';
import Link from 'next/link';

import { PublicHero } from '@/components/marketing';
import { Badge, LinkButton } from '@/components/ui';
import { publicMedia } from '@/config/public-media';
import { routeBuilders } from '@/config/routes';
import { inspirationsContent } from '@/content/inspirations';

type InspirationsHeroProps = {
    latest: {
        title: string;
        videoUrl: string;
        slug?: string;
        summary?: string | null;
        tags?: string[] | null;
    } | null;
};

export default function InspirationsHero({ latest }: InspirationsHeroProps) {
    const thumb = publicMedia.videoPoster.src;
    const latestHref = latest?.slug ? routeBuilders.inspiration(latest.slug) : null;

    return (
        <PublicHero
            eyebrow={inspirationsContent.hero.eyebrow}
            title={inspirationsContent.hero.title}
            description={inspirationsContent.hero.description}
            image={{ src: thumb, alt: '' }}
            className="[&_h1]:max-w-[15ch]"
            actions={
                <LinkButton href="#grid" size="lg" className="w-full sm:w-fit">
                    {inspirationsContent.hero.exploreCta}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </LinkButton>
            }
            aside={
                latest ? (
                    <>
                        <Badge variant="outline">{inspirationsContent.hero.latestLabel}</Badge>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">À regarder maintenant</p>
                        <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight text-foreground">{latest.title}</h2>
                        {latest.summary ? <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{latest.summary}</p> : null}
                        {latest.tags?.length ? (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                                {latest.tags.slice(0, 4).map((t) => (
                                    <Badge key={t} variant="outline">
                                        {t}
                                    </Badge>
                                ))}
                            </div>
                        ) : null}
                        {latestHref ? (
                            <Link
                                href={latestHref}
                                className="group mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-primary"
                            >
                                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                                {inspirationsContent.hero.latestCta}
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                            </Link>
                        ) : null}
                    </>
                ) : undefined
            }
        />
    );
}
