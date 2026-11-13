import 'server-only';

import { getProgramChargeLabel, getProgramsForComparison, getProgramsForComparisonAllStatuses } from './programmes.service';

export type { CompareRow } from '@/types/programmes.types';

export async function getCompareRows(includeUnpublished = true) {
    if (includeUnpublished) {
        return getProgramsForComparisonAllStatuses();
    }

    return getProgramsForComparison();
}

export const getChargeLabel = getProgramChargeLabel;
