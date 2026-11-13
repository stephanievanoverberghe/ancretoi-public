import { AdministrationInspirationsPage } from '@/features/administration/inspirations';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function AdministrationInspirationsRoutePage() {
    return <AdministrationInspirationsPage />;
}
