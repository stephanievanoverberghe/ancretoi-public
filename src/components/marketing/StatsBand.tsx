import { AnimatedNumber, Reveal } from '@/components/motion';
import { cn } from '@/lib/cn';

export type StatItem = {
    prefix?: string;
    value: number;
    suffix?: string;
    label: string;
};

export type StatsBandProps = {
    stats: readonly StatItem[];
    className?: string;
};

/**
 * Bande de chiffres animés (compteurs au scroll) pour les pages publiques.
 */
export function StatsBand({ stats, className }: StatsBandProps) {
    return (
        <dl className={cn('grid grid-cols-1 gap-3 sm:grid-cols-3', className)}>
            {stats.map((stat, index) => (
                <Reveal key={stat.label} delay={index * 0.08}>
                    <div className="rounded-xl border border-border bg-surface/84 p-4 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-elevated">
                        <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                        <dd className="mt-1 font-serif text-2xl text-foreground">
                            <AnimatedNumber prefix={stat.prefix} value={stat.value} suffix={stat.suffix} />
                        </dd>
                    </div>
                </Reveal>
            ))}
        </dl>
    );
}
