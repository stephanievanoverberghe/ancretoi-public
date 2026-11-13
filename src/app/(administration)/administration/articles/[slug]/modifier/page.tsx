import { ModifierArticlePage } from '@/features/administration/articles/modifier';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function ModifierArticleRoutePage({ params }: { params: Promise<{ slug: string }> }) {
    return <ModifierArticlePage params={params} />;
}
