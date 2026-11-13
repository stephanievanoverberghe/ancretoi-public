'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';

type RotatingWordsProps = {
    words: readonly string[];
    /** Durée d'affichage de chaque expression en millisecondes. */
    intervalMs?: number;
    className?: string;
};

/**
 * Fait tourner une liste d'expressions avec un roulement vertical doux.
 * Toutes les expressions sont rendues superposées et invisibles pour caler
 * la cellule sur la largeur réelle maximale (au pixel près) et une seule
 * ligne de haut : aucun reflow du texte voisin quel que soit le mot affiché.
 * Statique si l'utilisateur préfère réduire les animations.
 */
export function RotatingWords({ words, intervalMs = 2600, className }: RotatingWordsProps) {
    const reduceMotion = useReducedMotion();
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (reduceMotion || words.length < 2) return;

        const id = window.setInterval(() => setIndex((value) => (value + 1) % words.length), intervalMs);
        return () => window.clearInterval(id);
    }, [reduceMotion, words.length, intervalMs]);

    if (reduceMotion || words.length < 2) {
        return <span className={className}>{words[0]}</span>;
    }

    return (
        <span className={cn('relative inline-grid overflow-hidden align-bottom', className)}>
            {words.map((word) => (
                <span key={word} aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-nowrap">
                    {word}
                </span>
            ))}
            <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                    key={words[index]}
                    initial={{ y: '0.9em', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-0.9em', opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="col-start-1 row-start-1 whitespace-nowrap"
                >
                    {words[index]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}
