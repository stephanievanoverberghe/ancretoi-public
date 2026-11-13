'use client';

import { useEffect, useRef } from 'react';
import { User as UserIcon, SlidersHorizontal, CheckCircle2, BarChart3 } from 'lucide-react';
import type { TabKey } from './user-tabs.types';
import { cls } from './user-tabs.utils';

type Props = {
    idBase: string;
    tab: TabKey;
    enrollCount: number;
    onTabChange: (tab: TabKey) => void;
};

const tabs: { id: TabKey; label: string; Icon: React.ComponentType<{ className?: string }>; badge?: (count: number) => number | undefined }[] = [
    { id: 'identite', label: 'Identité', Icon: UserIcon },
    { id: 'preferences', label: 'Préférences', Icon: SlidersHorizontal },
    { id: 'inscriptions', label: 'Inscriptions', Icon: CheckCircle2, badge: (count) => count },
    { id: 'stats', label: 'Statistiques', Icon: BarChart3 },
];

export default function UserTabsNavigation({ idBase, tab, enrollCount, onTabChange }: Props) {
    const barRef = useRef<HTMLDivElement | null>(null);
    const btnRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({
        identite: null,
        preferences: null,
        inscriptions: null,
        stats: null,
    });

    const moveBar = () => {
        const el = btnRefs.current[tab];
        const bar = barRef.current;
        if (!el || !bar) return;
        const parent = el.parentElement as HTMLElement;
        const parentBox = parent.getBoundingClientRect();
        const box = el.getBoundingClientRect();
        const x = box.left - parentBox.left;
        bar.style.width = `${box.width}px`;
        bar.style.transform = `translateX(${x}px)`;
    };

    useEffect(() => {
        moveBar();
        const ro = new ResizeObserver(() => moveBar());
        const node = btnRefs.current[tab];
        if (node) ro.observe(node);
        return () => ro.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, enrollCount]);

    const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentTab: TabKey) => {
        const currentIndex = tabs.findIndex(({ id }) => id === currentTab);
        let nextIndex = currentIndex;

        if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = tabs.length - 1;
        else return;

        event.preventDefault();
        const nextTab = tabs[nextIndex].id;
        onTabChange(nextTab);
        btnRefs.current[nextTab]?.focus();
    };

    return (
        <div className="sticky top-16 z-20 border-b border-border bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
            <div className="px-2 md:px-4 py-2">
                <div role="tablist" aria-label="Sections du profil" className="relative grid grid-cols-4 gap-1 rounded-xl border border-border bg-surface-muted p-1">
                    <div
                        ref={barRef}
                        className="pointer-events-none absolute left-1 top-1 h-[calc(100%-0.5rem)] rounded-lg bg-surface shadow-soft ring-1 ring-border motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none"
                        style={{ width: 0, transform: 'translateX(0)' }}
                    />
                    {tabs.map(({ id, label, Icon, badge }) => {
                        const active = tab === id;
                        const badgeValue = badge?.(enrollCount);
                        return (
                            <button
                                key={id}
                                ref={(r) => {
                                    btnRefs.current[id] = r;
                                }}
                                role="tab"
                                aria-selected={active}
                                aria-controls={`${idBase}-panel-${id}`}
                                id={`${idBase}-tab-${id}`}
                                tabIndex={active ? 0 : -1}
                                onClick={() => onTabChange(id)}
                                onKeyDown={(event) => onKeyDown(event, id)}
                                className={cls('relative z-10 flex min-h-10 items-center justify-center gap-1 rounded-lg px-2 py-2 text-sm motion-safe:transition-colors motion-reduce:transition-none md:gap-2 md:px-3', active ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}
                                title={label}
                            >
                                <Icon className={cls('h-4 w-4', active && 'motion-safe:scale-110 motion-safe:transition-transform motion-reduce:transform-none motion-reduce:transition-none')} />
                                <span className="hidden md:inline truncate">{label}</span>
                                <span className="sr-only md:not-sr-only md:hidden">{label}</span>
                                {typeof badgeValue === 'number' && (
                                    <span
                                        className={cls(
                                            'ml-1 hidden md:inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] tabular-nums ring-1',
                                            active ? 'bg-primary/10 text-primary ring-primary/20' : 'bg-surface text-muted-foreground ring-border'
                                        )}
                                    >
                                        {badgeValue}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
