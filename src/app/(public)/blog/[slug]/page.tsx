import type { Metadata } from 'next';

import { BlogArticlePage, generateBlogArticleMetadata } from '@/features/public/blog/article/BlogArticlePage';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { slug } = await params;
    return generateBlogArticleMetadata(slug);
}

export const revalidate = 600;

export default async function BlogArticleRoutePage({ params }: { params: Promise<Params> }) {
    const { slug } = await params;
    return <BlogArticlePage slug={slug} />;
}
