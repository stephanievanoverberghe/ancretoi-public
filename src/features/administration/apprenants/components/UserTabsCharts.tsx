'use client';

import { useId } from 'react';
import { cls } from './user-tabs.utils';

export function Donut({
    value,
    size = 96,
    stroke = 10,
    label,
    sub,
    gradient = true,
}: {
    value: number;
    size?: number;
    stroke?: number;
    label?: string;
    sub?: string;
    gradient?: boolean;
}) {
    const v = Math.max(0, Math.min(100, value || 0));
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const dash = (v / 100) * c;
    const rest = c - dash;
    const id = `donut-${useId().replace(/:/g, '')}`;

    return (
        <div className="flex items-center gap-3">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
                {gradient && (
                    <defs>
                        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="var(--gold-500)" />
                            <stop offset="100%" stopColor="var(--primary)" />
                        </linearGradient>
                    </defs>
                )}
                <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--border)" strokeWidth={stroke} fill="none" />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    stroke={gradient ? `url(#${id})` : 'var(--primary)'}
                    strokeWidth={stroke}
                    fill="none"
                    strokeDasharray={`${dash} ${rest}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-foreground text-[14px] font-semibold">
                    {Math.round(v)}%
                </text>
            </svg>
            {(label || sub) && (
                <div className="min-w-0">
                    {label && <div className="text-sm font-medium">{label}</div>}
                    {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
                </div>
            )}
        </div>
    );
}

export function Bar({ label, value, max, tone = 'from-primary to-primary/60' }: { label: string; value: number; max: number; tone?: string }) {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

    return (
        <div>
            <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">{label}</span>
                <span className="tabular-nums text-foreground">{value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div className={cls('h-full bg-gradient-to-r', tone)} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
