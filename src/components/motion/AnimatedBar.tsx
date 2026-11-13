'use client';

import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

import { cn } from '@/lib/cn';

type AnimatedBarProps = {
    /** Pourcentage de remplissage final (0 à 100). */
    percent: number;
    /** Classes du rail (fond). */
    className?: string;
    /** Classes de la barre de remplissage. */
    barClassName?: string;
    delay?: number;
};

/**
 * Barre de progression qui se remplit de 0 à `percent` à l'entrée dans le
 * viewport. Remplissage immédiat si l'utilisateur réduit les animations.
 */
export function AnimatedBar({ percent, className, barClassName, delay = 0.25 }: AnimatedBarProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const isInView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' });
    const reduceMotion = useReducedMotion();
    const width = `${Math.max(0, Math.min(percent, 100))}%`;

    return (
        <div ref={ref} className={cn('h-1.5 overflow-hidden rounded-full bg-surface-muted', className)} role="presentation">
            {reduceMotion ? (
                <div className={cn('h-full rounded-full bg-primary', barClassName)} style={{ width }} />
            ) : (
                <motion.div
                    className={cn('h-full rounded-full bg-primary', barClassName)}
                    initial={{ width: 0 }}
                    animate={isInView ? { width } : undefined}
                    transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
                />
            )}
        </div>
    );
}
