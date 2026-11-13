'use client';

import { useId, useState } from 'react';
import type { TabKey, UserTabsProps } from './user-tabs.types';
import UserEnrollmentsPanel from './UserEnrollmentsPanel';
import UserIdentityPanel from './UserIdentityPanel';
import UserPreferencesPanel from './UserPreferencesPanel';
import UserStatsPanel from './UserStatsPanel';
import UserTabsNavigation from './UserTabsNavigation';

export default function UserTabs({ user, enrolls, stats, IdentityExtraSlot, PreferencesExtraSlot }: UserTabsProps) {
    const [tab, setTab] = useState<TabKey>('identite');
    const idBase = useId();

    return (
        <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
            <UserTabsNavigation idBase={idBase} tab={tab} enrollCount={enrolls.length} onTabChange={setTab} />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <UserIdentityPanel idBase={idBase} user={user} extraSlot={IdentityExtraSlot} hidden={tab !== 'identite'} />
                <UserPreferencesPanel idBase={idBase} user={user} extraSlot={PreferencesExtraSlot} hidden={tab !== 'preferences'} />
                <UserEnrollmentsPanel idBase={idBase} enrolls={enrolls} stats={stats} hidden={tab !== 'inscriptions'} />
                <UserStatsPanel idBase={idBase} enrolls={enrolls} stats={stats} hidden={tab !== 'stats'} />
            </div>
        </section>
    );
}
