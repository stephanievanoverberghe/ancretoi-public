'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

type FloatingProps = {
    children: ReactNode;
    /** Amplitude verticale du flottement en pixels. */
    amplitude?: number;
    /** Durée d'un cycle en secondes. */
    duration?: number;
    /** Délai de démarrage pour désynchroniser plusieurs éléments. */
    delay?: number;
    className?: string;
};

/**
 * Oscillation verticale douce et continue pour les éléments décoratifs
 * (badges, cartes flottantes). Rendu statique si l'utilisateur préfère
 * réduire les animations.
 */
export function Floating({ children, amplitude = 8, duration = 4.5, delay = 0, className }: FloatingProps) {
    const reduceMotion = useReducedMotion();

    if (reduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            animate={{ y: [0, -amplitude, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    );
}
