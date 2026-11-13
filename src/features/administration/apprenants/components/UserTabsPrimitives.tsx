import type React from 'react';
import { cls } from './user-tabs.utils';

export function SectionTitle({ kicker, title, hint }: { kicker: string; title: string; hint?: string }) {
    return (
        <div className="mb-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">{kicker}</div>
            <div className="text-lg font-semibold text-foreground md:text-xl">{title}</div>
            {hint ? <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div> : null}
        </div>
    );
}

export function Card({ children, bleed = false }: { children: React.ReactNode; bleed?: boolean }) {
    return <section className={cls('rounded-2xl border border-border bg-surface shadow-soft', bleed ? '' : 'p-4 md:p-5')}>{children}</section>;
}
