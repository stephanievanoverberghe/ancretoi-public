'use client';

import { AnimatedBar } from '@/components/motion';
import { cn } from '@/lib/cn';

type CourseProgressProps = {
    percent: number;
    /** Nombre de journées faites (affiché si `total` est fourni). */
    done?: number;
    total?: number;
    /** Masque la ligne de légende sous la barre. */
    hideLabel?: boolean;
    className?: string;
};

/**
 * Barre de progression de parcours commune à l'espace apprenant : remplissage
 * animé au scroll + légende « X/Y journées · Z% ».
 */
export function CourseProgress({ percent, done, total, hideLabel = false, className }: CourseProgressProps) {
    const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
    const hasCount = typeof done === 'number' && typeof total === 'number';

    return (
        <div className={className}>
            <AnimatedBar
                percent={safePercent}
                className="h-2"
                barClassName="bg-gradient-to-r from-primary to-secondary"
            />
            {hideLabel ? null : (
                <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{hasCount ? `${done}/${total} journées` : ''}</span>
                    <span className={cn('font-medium tabular-nums text-foreground')}>{safePercent}%</span>
                </div>
            )}
        </div>
    );
}
