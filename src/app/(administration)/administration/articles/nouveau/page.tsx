import { NouvelArticlePage } from '@/features/administration/articles/nouveau';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function NouvelArticleRoutePage() {
    return <NouvelArticlePage />;
}
