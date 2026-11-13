'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

type DriftProps = {
    children: ReactNode;
    /** Dérive horizontale maximale en pixels. */
    x?: number;
    /** Dérive verticale maximale en pixels. */
    y?: number;
    /** Durée d'un cycle complet en secondes. */
    duration?: number;
    delay?: number;
    className?: string;
};

/**
 * Dérive lente et continue (position + légère respiration d'échelle) pour
 * les halos et éléments d'ambiance. Statique si l'utilisateur préfère
 * réduire les animations.
 */
export function Drift({ children, x = 40, y = 30, duration = 16, delay = 0, className }: DriftProps) {
    const reduceMotion = useReducedMotion();

    if (reduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            animate={{ x: [0, x, 0], y: [0, -y, 0], scale: [1, 1.08, 1] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    );
}
