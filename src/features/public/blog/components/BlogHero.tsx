import { ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

import { PublicHero } from '@/components/marketing';
import { Badge, LinkButton } from '@/components/ui';
import { publicMedia } from '@/config/public-media';
import { routeBuilders } from '@/config/routes';
import { blogContent } from '@/content/blog';

type BlogHeroProps = {
    featured: {
        slug: string;
        title?: string | null;
        summary?: string | null;
        coverPath?: string | null;
        coverAlt?: string | null;
    } | null;
};

function normalizePublicPath(p?: string | null) {
    if (!p) return null;
    return p.startsWith('/') ? p : `/${p}`;
}

export default function BlogHero({ featured }: BlogHeroProps) {
    const cover = normalizePublicPath(featured?.coverPath) ?? publicMedia.editorialFallback.src;

    return (
        <PublicHero
            eyebrow={blogContent.hero.eyebrow}
            title={blogContent.hero.title}
            description={blogContent.hero.description}
            image={{ src: cover, alt: featured?.coverPath ? featured.coverAlt || '' : '' }}
            className="[&_h1]:max-w-[14ch]"
            actions={
                <LinkButton href="#grid" size="lg" className="w-full sm:w-fit">
                    {blogContent.hero.exploreCta}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </LinkButton>
            }
            aside={
                featured ? (
                    <>
                        <Badge variant="outline">{blogContent.hero.featuredLabel}</Badge>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Lecture choisie</p>
                        <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight text-foreground">
                            {featured.title || blogContent.card.untitled}
                        </h2>
                        {featured.summary ? <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{featured.summary}</p> : null}
                        <Link
                            href={routeBuilders.article(featured.slug)}
                            className="group mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-primary"
                        >
                            <BookOpen className="h-4 w-4" aria-hidden="true" />
                            {blogContent.hero.featuredCta}
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                        </Link>
                    </>
                ) : undefined
            }
        />
    );
}
