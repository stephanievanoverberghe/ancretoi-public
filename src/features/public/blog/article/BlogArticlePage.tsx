import 'server-only';

import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { Container } from '@/components/ui';
import { publicMedia } from '@/config/public-media';
import { publicRoutes } from '@/config/routes';
import { blogContent } from '@/content/blog';
import { getPublishedBlogPostBySlug, getPublishedBlogPostPrevNext } from '@/server/blog/public-posts.service';

import { NavCard, ReadingProgress, ShareBar } from './ReadingProgress';

const LEGACY_VISIBLE_ROUTE_PREFIXES = ['/programs', '/help', '/legal', '/privacy', '/terms', '/cgv'];
const FALLBACK_COVER = publicMedia.editorialFallback.src;

const articleBodyClassName = [
    'max-w-[72ch] text-[1.03rem] leading-[1.82] text-foreground/90',
    '[&_p]:mt-6 [&_p:first-child]:mt-0',
    '[&_h1]:mt-12 [&_h1]:font-serif [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:leading-tight [&_h1]:text-foreground',
    '[&_h2]:mt-12 [&_h2]:scroll-mt-28 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-foreground',
    '[&_h3]:mt-8 [&_h3]:scroll-mt-28 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:leading-snug [&_h3]:text-foreground',
    '[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:no-underline',
    '[&_strong]:font-semibold [&_strong]:text-foreground',
    '[&_blockquote]:my-9 [&_blockquote]:rounded-r-3xl [&_blockquote]:border-l-4 [&_blockquote]:border-secondary/60 [&_blockquote]:bg-surface-muted [&_blockquote]:px-6 [&_blockquote]:py-5 [&_blockquote]:font-serif [&_blockquote]:text-xl [&_blockquote]:leading-relaxed [&_blockquote]:text-foreground',
    '[&_code]:rounded-md [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm',
    '[&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1.5',
    '[&_p:first-of-type:first-letter]:float-left [&_p:first-of-type:first-letter]:mr-2 [&_p:first-of-type:first-letter]:font-serif [&_p:first-of-type:first-letter]:text-5xl [&_p:first-of-type:first-letter]:leading-[0.9] [&_p:first-of-type:first-letter]:text-foreground',
].join(' ');

function normalizePublicPath(p?: string | null) {
    if (!p) return '';
    return p.startsWith('/') ? p : `/${p}`;
}

function isLegacyInternalCanonical(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return false;

    try {
        const parsed = new URL(trimmed, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
        return LEGACY_VISIBLE_ROUTE_PREFIXES.some((prefix) => parsed.pathname === prefix || parsed.pathname.startsWith(`${prefix}/`));
    } catch {
        return false;
    }
}

function formatDateHuman(d?: string | Date | null) {
    if (!d) return '';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function computeReadingTime(text: string) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

function slugify(s: string) {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

function mdToHtml(md: string) {
    let html = md;

    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/`([^`]+?)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
    html = html
        .replace(/^###\s+(.+)$/gm, (_, t) => `<h3 id="${slugify(t)}">${t}</h3>`)
        .replace(/^##\s+(.+)$/gm, (_, t) => `<h2 id="${slugify(t)}">${t}</h2>`)
        .replace(/^#\s+(.+)$/gm, (_, t) => `<h1>${t}</h1>`);
    // Le > a déjà été échappé en &gt; par la passe d'échappement HTML.
    html = html.replace(/^(?:&gt;\s?)(.+)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<ol start="$1"><li>$2</li></ol>');
    html = html.replace(/^[-•]\s+(.+)$/gm, '<ul><li>$1</li></ul>');
    html = html.replace(/<\/ol>\s*<ol[^>]*>/g, '').replace(/<\/ul>\s*<ul[^>]*>/g, '');
    html = html
        .split(/\n{2,}/)
        .map((block) => {
            if (/^\s*<(h1|h2|h3|ul|ol|li|blockquote)/.test(block)) return block;
            return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
        })
        .join('\n');

    return html;
}

function buildToc(md: string) {
    const out: { id: string; text: string; level: 2 | 3 }[] = [];
    const lines = md.split('\n');
    for (const line of lines) {
        const m2 = /^##\s+(.+)$/.exec(line);
        if (m2) out.push({ id: slugify(m2[1]), text: m2[1], level: 2 });
        const m3 = /^###\s+(.+)$/.exec(line);
        if (m3) out.push({ id: slugify(m3[1]), text: m3[1], level: 3 });
    }
    return out;
}

async function getPostBySlug(slug: string) {
    const doc = await getPublishedBlogPostBySlug(slug);

    if (!doc) notFound();
    return doc;
}

export async function generateBlogArticleMetadata(slug: string): Promise<Metadata> {
    const post = await getPostBySlug(slug);

    const title = (post.seoTitle && post.seoTitle.trim()) || `${post.title} — Ancre-toi`;
    const description = (post.seoDescription && post.seoDescription.trim()) || post.summary || '';
    const image = normalizePublicPath(post.coverPath) || '';
    const fallbackUrl = `/blog/${post.slug}`;
    const storedCanonical = post.canonicalUrl?.trim();
    const url = storedCanonical && !isLegacyInternalCanonical(storedCanonical) ? storedCanonical : fallbackUrl;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            type: 'article',
            url,
            title: post.title,
            description,
            images: image ? [{ url: image, alt: post.coverAlt || post.title }] : undefined,
        },
    };
}

export async function BlogArticlePage({ slug }: { slug: string }) {
    const post = await getPostBySlug(slug);

    const cover = normalizePublicPath(post.coverPath);
    const dateLabel = formatDateHuman(post.publishedAt || undefined);

    const bodyMd = (post.content || '').trim();
    const bodyHtml = mdToHtml(bodyMd);
    const toc = buildToc(bodyMd);

    const rt = post.readingTimeMin && post.readingTimeMin > 0 ? post.readingTimeMin : computeReadingTime(`${post.title} ${post.summary ?? ''} ${bodyMd}`);

    const { prev, next } = post.publishedAt ? await getPublishedBlogPostPrevNext(new Date(post.publishedAt)) : { prev: null, next: null };

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
        description: post.summary ?? '',
        image: cover ? [cover] : undefined,
    };

    return (
        <div className="relative bg-background">
            <ReadingProgress />

            <header className="relative mx-[calc(50%-50vw)] w-screen overflow-hidden border-b border-border">
                <div className="relative min-h-[32rem] sm:min-h-[38rem]">
                    <Image
                        src={cover || FALLBACK_COVER}
                        alt={cover ? post.coverAlt || post.title : ''}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/76 to-background/10" aria-hidden="true" />
                    <div className="absolute inset-x-0 bottom-0">
                        <Container size="xl" className="pb-8 sm:pb-12">
                            <div className="max-w-4xl">
                                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    {post.category ? <span className="text-secondary">{post.category}</span> : null}
                                    {post.category ? <span aria-hidden="true">·</span> : null}
                                    <span>
                                        {dateLabel ? `${dateLabel} • ` : ''}
                                        {rt} {blogContent.article.readingTimeSuffix}
                                    </span>
                                </div>
                                <h1 className="mt-3 max-w-[18ch] text-balance font-serif text-4xl font-semibold leading-[1.02] text-foreground sm:text-5xl lg:text-6xl">{post.title}</h1>
                                {post.summary ? <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-muted-foreground sm:text-lg">{post.summary}</p> : null}
                                {post.tags?.length ? (
                                    <ul className="mt-5 flex flex-wrap gap-2" aria-label="Thèmes de l’article">
                                        {post.tags.slice(0, 5).map((tag) => (
                                            <li key={tag} className="rounded-full border border-border bg-background/75 px-3 py-1 text-xs text-foreground backdrop-blur-sm">{tag}</li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        </Container>
                    </div>
                </div>
            </header>

            <Container size="xl" className="grid justify-center gap-10 py-10 sm:py-16 lg:grid-cols-[minmax(0,72ch)_minmax(220px,280px)] lg:gap-16">
                <article className="min-w-0">
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <Link
                            href={publicRoutes.blog}
                            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            {blogContent.article.backLabel}
                        </Link>
                        <ShareBar title={post.title} />
                    </div>

                    {toc.length ? (
                        <details className="mb-8 rounded-2xl border border-border bg-surface p-4 lg:hidden">
                            <summary className="cursor-pointer text-sm font-semibold text-foreground">{blogContent.article.tocTitle}</summary>
                            <nav aria-label={blogContent.article.tocTitle} className="mt-4 grid gap-2 border-t border-border pt-4">
                                {toc.map((item) => (
                                    <a key={item.id} href={`#${item.id}`} className={item.level === 3 ? 'pl-3 text-sm text-muted-foreground' : 'text-sm text-foreground'}>
                                        {item.text}
                                    </a>
                                ))}
                            </nav>
                        </details>
                    ) : null}

                    {bodyMd ? (
                        <div className={articleBodyClassName} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                    ) : (
                        <div className="rounded-[2rem] border border-dashed border-border bg-surface-muted px-6 py-10 text-center">
                            <h2 className="font-serif text-2xl text-foreground">Ce texte est encore en préparation.</h2>
                            <p className="mx-auto mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
                                Sa couverture est publiée, mais son contenu n’est pas encore disponible à la lecture.
                            </p>
                        </div>
                    )}
                </article>

                <aside className="hidden lg:block">
                    {toc.length ? (
                        <nav aria-label={blogContent.article.tocTitle} className="sticky top-28 rounded-3xl border border-border bg-surface p-5 shadow-soft">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{blogContent.article.tocTitle}</div>
                            <div className="mt-3 space-y-1.5">
                                {toc.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className={`block text-sm leading-snug text-foreground transition hover:text-primary ${item.level === 3 ? 'pl-3 text-muted-foreground' : ''}`}
                                    >
                                        {item.text}
                                    </a>
                                ))}
                            </div>
                        </nav>
                    ) : null}
                </aside>
            </Container>

            {prev || next ? (
                <Container size="xl" className="grid gap-3 pb-12 sm:grid-cols-2">
                    <NavCard kind="prev" slug={prev?.slug} title={prev?.title} />
                    <NavCard kind="next" slug={next?.slug} title={next?.title} />
                </Container>
            ) : null}

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </div>
    );
}
