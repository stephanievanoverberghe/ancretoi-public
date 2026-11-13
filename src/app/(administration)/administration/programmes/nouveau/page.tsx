import { NouveauProgrammePage } from '@/features/administration/programmes/nouveau';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function NouveauProgrammeRoutePage() {
    return <NouveauProgrammePage />;
}
