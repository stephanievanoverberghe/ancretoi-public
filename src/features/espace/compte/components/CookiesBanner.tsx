'use client';

import { LinkButton } from '@/components/ui';

export default function CookieBannerTrigger() {
    return (
        <LinkButton
            href="/cookies/preferences"
            variant="tertiary"
            size="sm"
            className="min-h-10 w-full justify-start sm:w-fit"
        >
            Préférences avancées
        </LinkButton>
    );
}
