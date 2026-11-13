// src/features/espace/bilan/SummaryBarsClient.tsx
'use client';

export default function SummaryBarsClient({ items }: { items: { slug: string; title: string; percent: number }[] }) {
    if (!items?.length) return <p className="text-sm text-muted-foreground">Aucun parcours enregistré pour le moment.</p>;

    return (
        <ul className="space-y-4">
            {items.map((item) => {
                const percent = Math.max(0, Math.min(100, Math.round(item.percent)));

                return (
                    <li key={item.slug} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                            <div
                                className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-muted"
                                role="progressbar"
                                aria-label={`Progression de ${item.title}`}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={percent}
                            >
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-700 motion-reduce:transition-none"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-foreground">{percent}%</span>
                    </li>
                );
            })}
        </ul>
    );
}
