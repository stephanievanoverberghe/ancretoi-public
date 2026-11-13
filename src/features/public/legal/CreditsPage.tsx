import { ExternalLink, Mail, Palette } from 'lucide-react';

import { publicRoutes } from '@/config/routes';
import { legalIdentity } from '@/content/legal/legal-identity';

import {
    createLegalPageJsonLd,
    LegalDocumentLayout,
    LegalNote,
    LegalSection,
    type LegalTocItem,
} from './LegalDocumentLayout';

const toc = [
    { href: '#conception', label: 'Conception et réalisation' },
    { href: '#attribution', label: 'Signaler une attribution' },
] as const satisfies readonly LegalTocItem[];

export function CreditsPage() {
    const jsonLd = createLegalPageJsonLd('Crédits');

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <LegalDocumentLayout
                eyebrow="Transparence éditoriale"
                title="Crédits"
                description="Les informations d’attribution des contenus, visuels et ressources publiés sur Ancre-toi."
                readingTime="2 min de lecture"
                toc={toc}
            >
                <LegalSection id="conception" title="Conception et réalisation" icon={<Palette className="size-4" />}>
                    <p>
                        {legalIdentity.siteName} est un site de démonstration conçu et édité par{' '}
                        <a href={legalIdentity.website} target="_blank" rel="noreferrer">
                            {legalIdentity.legalName}
                            <ExternalLink className="ml-1 inline size-3.5 align-[-1px]" aria-hidden="true" />
                        </a>
                        .
                    </p>
                    <LegalNote>
                        L’attribution éditoriale de cette démonstration renvoie vers{' '}
                        <a href={legalIdentity.website} target="_blank" rel="noreferrer">
                            {legalIdentity.websiteLabel}
                        </a>
                        .
                    </LegalNote>
                </LegalSection>

                <LegalSection id="attribution" title="Signaler une attribution" icon={<Mail className="size-4" />}>
                    <p>
                        Une attribution manque ou doit être corrigée ? Écrivez-nous : nous vérifierons la ressource et mettrons cette page à jour.
                    </p>
                    <p>
                        <a href={publicRoutes.contact}>Nous contacter</a> ou écrire directement à{' '}
                        <a href={`mailto:${legalIdentity.email}`}>{legalIdentity.email}</a>.
                    </p>
                </LegalSection>
            </LegalDocumentLayout>
        </>
    );
}
