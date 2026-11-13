import { AdministrationApprenantsPage, type AdministrationApprenantsSearchParams } from '@/features/administration/apprenants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function AdministrationApprenantsRoutePage({ searchParams }: { searchParams?: Promise<AdministrationApprenantsSearchParams> }) {
    return <AdministrationApprenantsPage searchParams={searchParams} />;
}
