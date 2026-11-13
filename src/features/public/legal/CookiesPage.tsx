import Link from 'next/link';
import {
    BarChart3,
    Cookie as CookieIcon,
    Database,
    ExternalLink,
    FileText,
    Mail,
    Network,
    Settings,
    Shield,
} from 'lucide-react';

import { legalIdentity } from '@/content/legal/legal-identity';
import { legalServiceRegistry, legalStorageRegistry } from '@/content/legal/legal-registry';

import {
    createLegalPageJsonLd,
    LegalDocumentLayout,
    LegalNote,
    LegalSection,
    type LegalTocItem,
} from './LegalDocumentLayout';

const toc = [
    { href: '#intro', label: '1. Qu’est-ce qu’un cookie ?' },
    { href: '#types', label: '2. Stockages utilisés' },
    { href: '#consentement', label: '3. Votre consentement' },
    { href: '#gerer', label: '4. Gérer vos préférences' },
    { href: '#liste', label: '5. Registre des stockages' },
    { href: '#services', label: '6. Services associés' },
    { href: '#navigateur', label: '7. Réglages du navigateur' },
    { href: '#contact', label: '8. Contact et droits' },
    { href: '#maj', label: '9. Mises à jour' },
] as const satisfies readonly LegalTocItem[];

export function CookiesPage() {
    const analyticsConfigured = Boolean(process.env.NEXT_PUBLIC_GA_ID?.trim());
    const visibleStorage = legalStorageRegistry.filter(
        (entry) => analyticsConfigured || entry.category !== 'Mesure d’audience optionnelle',
    );
    const visibleServices = legalServiceRegistry.filter(
        (service) => analyticsConfigured || service.name !== 'Google Analytics',
    );
    const jsonLd = createLegalPageJsonLd('Politique Cookies');

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <LegalDocumentLayout
                title="Politique Cookies"
                description="Ce document décrit les stockages réellement utilisés par Ancre-toi, leur rôle et la manière de modifier vos choix."
                readingTime="7 min de lecture"
                toc={toc}
                notice={
                    <p>
                        Cette liste reflète la configuration actuelle du site. Aucun outil marketing n’est déclaré ou activé dans cette démonstration.
                    </p>
                }
            >
                <LegalSection id="intro" title="1. Qu’est-ce qu’un cookie ?" icon={<CookieIcon className="size-4" />}>
                    <p>
                        Un cookie est un petit fichier texte enregistré sur votre appareil lorsque vous consultez un site. Il peut maintenir une session, protéger un formulaire,
                        mémoriser un choix ou, avec votre accord, mesurer l’usage du site.
                    </p>
                </LegalSection>

                <LegalSection id="types" title="2. Stockages utilisés" icon={<Database className="size-4" />}>
                    <ul>
                        <li>
                            <strong>Strictement nécessaires</strong> : ils assurent le consentement, l’authentification et la sécurité. Ils ne nécessitent pas votre accord.
                        </li>
                        {analyticsConfigured ? (
                            <li>
                                <strong>Mesure d’audience optionnelle</strong> : Google Analytics peut mesurer la fréquentation uniquement après votre consentement.
                            </li>
                        ) : null}
                    </ul>
                    {!analyticsConfigured ? (
                        <LegalNote>Aucun service de mesure d’audience optionnel n’est configuré actuellement.</LegalNote>
                    ) : null}
                </LegalSection>

                <LegalSection id="consentement" title="3. Votre consentement" icon={<Shield className="size-4" />}>
                    <p>
                        Lors de votre première visite, une bannière vous permet d’accepter, de refuser ou de personnaliser les fonctions optionnelles. Le refus n’empêche pas
                        l’utilisation des fonctions essentielles du site.
                    </p>
                    <p>Votre choix est conservé pendant 12 mois et reste modifiable à tout moment.</p>
                </LegalSection>

                <LegalSection id="gerer" title="4. Gérer vos préférences" icon={<Settings className="size-4" />}>
                    <p>
                        Utilisez le <Link href="/cookies/preferences">centre de préférences cookies</Link> pour consulter ou modifier votre choix.
                    </p>
                    <p>
                        Les traitements de données associés sont détaillés dans la <Link href="/confidentialite">politique de confidentialité</Link>.
                    </p>
                </LegalSection>

                <LegalSection id="liste" title="5. Registre des stockages" icon={<BarChart3 className="size-4" />}>
                    <p>Le registre ci-dessous est produit depuis les fonctions réellement prévues par l’application.</p>
                    <div className="mt-6 overflow-x-auto rounded-2xl border border-border/80 bg-surface/80 shadow-soft">
                        <table className="w-full min-w-[42rem] border-collapse text-left text-sm leading-6">
                            <caption className="sr-only">Cookies et stockages utilisés par Ancre-toi</caption>
                            <thead className="bg-surface-muted text-xs uppercase tracking-[0.08em] text-muted-foreground">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-semibold">Nom</th>
                                    <th scope="col" className="px-4 py-3 font-semibold">Catégorie</th>
                                    <th scope="col" className="px-4 py-3 font-semibold">Finalité</th>
                                    <th scope="col" className="px-4 py-3 font-semibold">Durée</th>
                                    <th scope="col" className="px-4 py-3 font-semibold">Condition</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleStorage.map((entry) => (
                                    <tr key={entry.name} className="border-t border-border/70 align-top">
                                        <th scope="row" className="px-4 py-4 font-mono text-xs font-semibold text-foreground">{entry.name}</th>
                                        <td className="px-4 py-4">{entry.category}</td>
                                        <td className="px-4 py-4">{entry.purpose}</td>
                                        <td className="px-4 py-4">{entry.lifetime}</td>
                                        <td className="px-4 py-4">{entry.condition}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </LegalSection>

                <LegalSection id="services" title="6. Services associés" icon={<Network className="size-4" />}>
                    <p>
                        Les services suivants interviennent selon la fonction utilisée. Leur présence dans cette liste ne signifie pas qu’ils déposent tous un cookie dans votre
                        navigateur.
                    </p>
                    <dl className="mt-6 divide-y divide-[var(--public-rule)] border-y border-[var(--public-rule)]">
                        {visibleServices.map((service) => (
                            <div key={service.name} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-5">
                                <dt className="font-semibold text-foreground">{service.name}</dt>
                                <dd>
                                    {service.purpose}
                                    {'condition' in service && service.condition ? (
                                        <span className="mt-1 block text-sm">{service.condition}</span>
                                    ) : null}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </LegalSection>

                <LegalSection id="navigateur" title="7. Réglages du navigateur" icon={<Settings className="size-4" />}>
                    <p>Vous pouvez également bloquer ou supprimer les cookies depuis votre navigateur :</p>
                    <ul>
                        <li>
                            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer">
                                Chrome <ExternalLink className="ml-1 inline size-3.5" aria-hidden="true" />
                            </a>
                        </li>
                        <li>
                            <a href="https://support.mozilla.org/kb/cookies-informations-sites" target="_blank" rel="noreferrer">
                                Firefox <ExternalLink className="ml-1 inline size-3.5" aria-hidden="true" />
                            </a>
                        </li>
                        <li>
                            <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noreferrer">
                                Safari <ExternalLink className="ml-1 inline size-3.5" aria-hidden="true" />
                            </a>
                        </li>
                        <li>
                            <a href="https://support.microsoft.com/microsoft-edge" target="_blank" rel="noreferrer">
                                Edge <ExternalLink className="ml-1 inline size-3.5" aria-hidden="true" />
                            </a>
                        </li>
                    </ul>
                    <LegalNote>
                        Le blocage des stockages strictement nécessaires peut empêcher la connexion, la sécurisation des formulaires ou la mémorisation de votre consentement.
                    </LegalNote>
                </LegalSection>

                <LegalSection id="contact" title="8. Contact et droits" icon={<Mail className="size-4" />}>
                    <p>
                        Pour toute question ou pour exercer vos droits, écrivez à{' '}
                        <a href={`mailto:${legalIdentity.email}`}>{legalIdentity.email}</a>.
                    </p>
                    {legalIdentity.phone ? <p>Téléphone : {legalIdentity.phone}</p> : null}
                    <p>
                        Vous pouvez également consulter les <Link href="/mentions-legales">mentions légales</Link>.
                    </p>
                </LegalSection>

                <LegalSection id="maj" title="9. Mises à jour" icon={<FileText className="size-4" />}>
                    <p>
                        Cette politique peut évoluer pour refléter les changements légaux, techniques ou opérationnels. La date affichée en haut de page indique sa dernière mise
                        à jour.
                    </p>
                </LegalSection>
            </LegalDocumentLayout>
        </>
    );
}
