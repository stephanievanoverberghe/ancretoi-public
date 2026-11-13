import Link from 'next/link';
import { Settings, ShieldCheck } from 'lucide-react';

import { legalIdentity } from '@/content/legal/legal-identity';

import {
    createLegalPageJsonLd,
    LegalDocumentLayout,
    LegalNote,
    LegalSection,
    type LegalTocItem,
} from '../LegalDocumentLayout';
import PreferencesForm from './components/PreferencesForm';

const toc = [
    { href: '#choix', label: 'Vos choix' },
    { href: '#comprendre', label: 'Comprendre le consentement' },
] as const satisfies readonly LegalTocItem[];

export function CookiesPreferencesPage() {
    const analyticsAvailable = Boolean(process.env.NEXT_PUBLIC_GA_ID?.trim());
    const jsonLd = createLegalPageJsonLd('Préférences cookies');

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <LegalDocumentLayout
                eyebrow="Centre de préférences"
                title="Préférences cookies"
                description={`Choisissez les fonctions optionnelles que vous autorisez sur ${legalIdentity.siteName}. Les cookies indispensables restent toujours actifs.`}
                readingTime="2 min de lecture"
                toc={toc}
            >
                <LegalSection id="choix" title="Vos choix" icon={<Settings className="size-4" />}>
                    <p>
                        Vos préférences sont enregistrées pendant 12 mois. Vous pouvez revenir sur cette page et les modifier à tout moment.
                    </p>
                    <div className="mt-6 rounded-[1.5rem] border border-border/80 bg-surface/80 p-4 shadow-soft sm:p-6">
                        <PreferencesForm
                            cookieName="at_consent"
                            cookieDays={365}
                            analyticsAvailable={analyticsAvailable}
                            initial={{ preferences: false, analytics: false, marketing: false }}
                        />
                    </div>
                    {!analyticsAvailable ? (
                        <LegalNote>
                            Aucun service optionnel n’est configuré actuellement. Seuls les stockages strictement nécessaires restent actifs.
                        </LegalNote>
                    ) : null}
                </LegalSection>

                <LegalSection id="comprendre" title="Comprendre le consentement" icon={<ShieldCheck className="size-4" />}>
                    <p>
                        Les fonctions nécessaires assurent notamment la sécurité, l’authentification et la mémorisation de vos choix. Elles ne peuvent pas être désactivées ici.
                    </p>
                    <p>
                        Pour connaître les stockages concernés, consultez les{' '}
                        <Link href="/cookies">informations sur les cookies</Link>. Le traitement des données est détaillé dans la{' '}
                        <Link href="/confidentialite">politique de confidentialité</Link>.
                    </p>
                </LegalSection>
            </LegalDocumentLayout>
        </>
    );
}
