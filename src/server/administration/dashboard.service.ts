import 'server-only';

import type { AdministrationDashboardData } from '@/types/administration-dashboard.types';

import { loadAdministrationDashboardSource } from './dashboard.loaders';
import { mapAdministrationDashboardData } from './dashboard.mapper';

export async function getAdministrationDashboardData(): Promise<AdministrationDashboardData> {
    const source = await loadAdministrationDashboardSource();
    return mapAdministrationDashboardData(source);
}
