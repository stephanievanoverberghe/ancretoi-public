import type { Metadata } from 'next';

import { InspirationDetailPage, generateInspirationDetailMetadata } from '@/features/public/inspirations/detail';

type Params = { slug: string };

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { slug } = await params;
    return generateInspirationDetailMetadata(slug);
}

export default async function InspirationDetailRoutePage({ params }: { params: Promise<Params> }) {
    const { slug } = await params;
    return <InspirationDetailPage slug={slug} />;
}
