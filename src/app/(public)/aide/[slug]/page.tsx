import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { routeBuilders } from '@/config/routes';
import { aideArticles, getAideArticle } from '@/content/aide-articles';
import { AideArticlePage } from '@/features/public/aide/article';

type AideArticleRouteProps = {
    params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
    return aideArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
    params,
}: AideArticleRouteProps): Promise<Metadata> {
    const { slug } = await params;
    const article = getAideArticle(slug);
    if (!article) return {};

    return {
        title: article.title,
        description: article.description,
        alternates: { canonical: routeBuilders.aideArticle(article.slug) },
    };
}

export default async function AideArticleRoutePage({
    params,
}: AideArticleRouteProps) {
    const { slug } = await params;
    const article = getAideArticle(slug);
    if (!article) notFound();

    return <AideArticlePage article={article} />;
}
