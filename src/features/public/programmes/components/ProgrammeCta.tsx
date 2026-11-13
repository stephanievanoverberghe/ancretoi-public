// src/features/public/programmes/components/ProgrammeCta.tsx

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Props = {
    programSlug: string;
    userKey?: string; // pour namespacer le localStorage (ex: userId)
    className?: string;
};

export default function ProgrammeCta({ programSlug, userKey, className }: Props) {
    const [href, setHref] = useState(`/espace/formations/${programSlug}/jour/1`);
    const [label, setLabel] = useState('Commencer');

    useEffect(() => {
        try {
            const k = userKey ? `${userKey}:${programSlug}:lastDay` : `${programSlug}:lastDay`;
            const last = Number(localStorage.getItem(k));
            if (Number.isInteger(last) && last >= 1) {
                setHref(`/espace/formations/${programSlug}/jour/${last}`);
                setLabel(last > 1 ? `Reprendre J${last}` : 'Commencer');
            }
        } catch {
            // noop
        }
    }, [programSlug, userKey]);

    return (
        <Link href={href} className={className ?? 'rounded-md border px-3 py-2 text-sm hover:bg-gray-50'}>
            {label}
        </Link>
    );
}
