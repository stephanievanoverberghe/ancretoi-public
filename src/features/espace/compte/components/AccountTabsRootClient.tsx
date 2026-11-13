'use client';

import { Database, ShieldCheck, SlidersHorizontal, UserRound } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui';

type AccountTab = 'profil' | 'securite' | 'preferences' | 'donnees';

function normalizeAccountTab(value: string | null): AccountTab {
    if (value === 'securite' || value === 'preferences' || value === 'donnees') return value;
    return 'profil';
}

export function AccountTabsRootClient({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<AccountTab>(() =>
        normalizeAccountTab(searchParams.get('onglet')),
    );

    useEffect(() => {
        setActiveTab(normalizeAccountTab(searchParams.get('onglet')));
    }, [searchParams]);

    function changeTab(value: string) {
        const nextTab = normalizeAccountTab(value);
        setActiveTab(nextTab);
        const nextParams = new URLSearchParams(searchParams.toString());
        if (nextTab === 'profil') nextParams.delete('onglet');
        else nextParams.set('onglet', nextTab);

        const query = nextParams.toString();
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
        window.history.replaceState(window.history.state, '', nextUrl);
    }

    return (
        <Tabs value={activeTab} onValueChange={changeTab} className="w-full min-w-0">
            <TabsList aria-label="Réglages du compte">
                <TabsTrigger value="profil">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                    Profil
                </TabsTrigger>
                <TabsTrigger value="preferences">
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                    Préférences
                </TabsTrigger>
                <TabsTrigger value="securite">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    Sécurité
                </TabsTrigger>
                <TabsTrigger value="donnees">
                    <Database className="h-4 w-4" aria-hidden="true" />
                    Données
                </TabsTrigger>
            </TabsList>

            {children}
        </Tabs>
    );
}
