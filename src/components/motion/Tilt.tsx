'use client';

import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import type { PointerEvent, ReactNode } from 'react';

type TiltProps = {
    children: ReactNode;
    /** Inclinaison maximale en degrés. */
    maxTilt?: number;
    className?: string;
};

/**
 * Légère inclinaison 3D qui suit le pointeur (effet carte premium).
 * Inactif quand l'utilisateur préfère réduire les animations ou sur écran
 * tactile (aucun événement pointer hover).
 */
export function Tilt({ children, maxTilt = 6, className }: TiltProps) {
    const reduceMotion = useReducedMotion();
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springX = useSpring(rotateX, { stiffness: 160, damping: 18 });
    const springY = useSpring(rotateY, { stiffness: 160, damping: 18 });

    if (reduceMotion) {
        return <div className={className}>{children}</div>;
    }

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        rotateY.set(px * maxTilt * 2);
        rotateX.set(-py * maxTilt * 2);
    };

    const reset = () => {
        rotateX.set(0);
        rotateY.set(0);
    };

    return (
        <motion.div
            className={className}
            style={{ rotateX: springX, rotateY: springY, transformPerspective: 900 }}
            onPointerMove={handlePointerMove}
            onPointerLeave={reset}
        >
            {children}
        </motion.div>
    );
}
