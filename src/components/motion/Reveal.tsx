'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

type RevealProps = {
    children: ReactNode;
    /** Élément sémantique rendu. `li` préserve la structure des listes animées. */
    as?: 'div' | 'li';
    /** Délai en secondes, utile pour décaler des éléments voisins. */
    delay?: number;
    /** Décalage vertical de départ en pixels. */
    y?: number;
    /** Décalage horizontal de départ en pixels (négatif = depuis la gauche). */
    x?: number;
    className?: string;
    once?: boolean;
};

/**
 * Apparition douce au scroll (fondu + translation). Rend un simple div
 * statique quand l'utilisateur préfère réduire les animations.
 */
export function Reveal({ children, as = 'div', delay = 0, y = 24, x = 0, className, once = true }: RevealProps) {
    const reduceMotion = useReducedMotion();
    const safeY = Math.sign(y) * Math.min(Math.abs(y), 10);
    const safeX = Math.sign(x) * Math.min(Math.abs(x), 10);

    if (reduceMotion) {
        return as === 'li' ? <li className={className}>{children}</li> : <div className={className}>{children}</div>;
    }

    if (as === 'li') {
        return (
            <motion.li
                className={className}
                data-public-reveal=""
                initial={{ opacity: 1, y: safeY, x: safeX }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once, amount: 0.2, margin: '0px 0px -60px 0px' }}
                transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            >
                {children}
            </motion.li>
        );
    }

    return (
        <motion.div
            className={className}
            data-public-reveal=""
            initial={{ opacity: 1, y: safeY, x: safeX }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once, amount: 0.2, margin: '0px 0px -60px 0px' }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}
