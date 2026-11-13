import { ApprenantDetailPage } from '@/features/administration/apprenants/detail';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function ApprenantDetailRoutePage({ params }: { params: Promise<{ id: string }> }) {
    return <ApprenantDetailPage params={params} />;
}
