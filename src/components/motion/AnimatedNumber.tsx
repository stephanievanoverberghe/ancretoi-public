'use client';

import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type AnimatedNumberProps = {
    value: number;
    prefix?: string;
    suffix?: string;
    /** Durée du comptage en secondes. */
    duration?: number;
    className?: string;
};

/**
 * Compteur qui monte de 0 à `value` quand il entre dans le viewport.
 * Affiche directement la valeur finale si l'utilisateur réduit les animations.
 */
export function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1.2, className }: AnimatedNumberProps) {
    const ref = useRef<HTMLSpanElement | null>(null);
    const isInView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' });
    const reduceMotion = useReducedMotion();
    const [display, setDisplay] = useState(reduceMotion ? value : 0);

    useEffect(() => {
        if (reduceMotion) {
            setDisplay(value);
            return;
        }
        if (!isInView) return;

        const controls = animate(0, value, {
            duration,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (latest) => setDisplay(Math.round(latest)),
        });

        return () => controls.stop();
    }, [isInView, value, duration, reduceMotion]);

    return (
        <span ref={ref} className={className}>
            {prefix}
            {display}
            {suffix}
        </span>
    );
}
