import Link from 'next/link';
import {
    Cookie,
    Database,
    FileText,
    Globe,
    Lock,
    Mail,
    Network,
    Shield,
    Timer,
    UserCheck,
} from 'lucide-react';

import { legalIdentity } from '@/content/legal/legal-identity';
import { legalServiceRegistry } from '@/content/legal/legal-registry';

import {
    createLegalPageJsonLd,
    LegalDocumentLayout,
    LegalNote,
    LegalSection,
    type LegalTocItem,
} from './LegalDocumentLayout';

const toc = [
    { href: '#intro', label: '1. À propos de cette politique' },
    { href: '#donnees', label: '2. Données collectées' },
    { href: '#finalites', label: '3. Finalités et bases légales' },
    { href: '#conservation', label: '4. Durées de conservation' },
    { href: '#destinataires', label: '5. Destinataires et services' },
    { href: '#transferts', label: '6. Transferts hors UE' },
    { href: '#securite', label: '7. Sécurité' },
    { href: '#droits', label: '8. Vos droits' },
    { href: '#cookies', label: '9. Cookies' },
    { href: '#contact', label: '10. Contact' },
    { href: '#maj', label: '11. Mises à jour' },
] as const satisfies readonly LegalTocItem[];

export function ConfidentialitePage() {
    const analyticsConfigured = Boolean(process.env.NEXT_PUBLIC_GA_ID?.trim());
    const visibleServices = legalServiceRegistry.filter(
        (service) => analyticsConfigured || service.name !== 'Google Analytics',
    );
    const jsonLd = createLegalPageJsonLd('Politique de confidentialité');

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <LegalDocumentLayout
                title="Politique de confidentialité"
                description="Comment Ancre-toi collecte, utilise, conserve et protège les données personnelles liées à ses services."
                readingTime="10 min de lecture"
                toc={toc}
            >
                <LegalSection id="intro" title="1. À propos de cette politique" icon={<FileText className="size-4" />}>
                    <p>
                        Cette politique explique comment <strong>{legalIdentity.siteName}</strong> ({legalIdentity.legalName}) collecte, utilise, conserve et protège vos données
                        personnelles lorsque vous utilisez le site et ses services.
                    </p>
                    <p>
                        Nous agissons en tant que responsable de traitement pour la plupart des opérations décrites ci-dessous. Lorsque nous opérons via des prestataires, ceux-ci
                        peuvent intervenir comme sous-traitants au sens du RGPD.
                    </p>
                </LegalSection>

                <LegalSection id="donnees" title="2. Données que nous collectons" icon={<Database className="size-4" />}>
                    <ul>
                        <li><strong>Identité et contact</strong> : nom, prénom, e-mail, numéro de téléphone.</li>
                        <li><strong>Compte et usage</strong> : identifiants, préférences, historique de navigation interne, contenus consultés.</li>
                        <li><strong>Technique</strong> : adresses IP, logs, type d’appareil, navigateur et cookies ou traceurs.</li>
                        <li><strong>Transactionnel</strong> : si applicable, informations de facturation traitées via un prestataire de paiement.</li>
                    </ul>
                </LegalSection>

                <LegalSection id="finalites" title="3. Finalités et bases légales" icon={<Shield className="size-4" />}>
                    <ul>
                        <li><strong>Fourniture du service</strong> — exécution du contrat : création de compte, accès aux contenus et support.</li>
                        <li><strong>Amélioration et sécurité</strong> — intérêt légitime : statistiques d’usage agrégées, prévention de la fraude et journalisation.</li>
                        <li><strong>Communication</strong> — intérêt légitime ou consentement : e-mails de service, newsletter consentie et réponses à vos demandes.</li>
                        <li><strong>Obligations légales</strong> : facturation, conservation légale et exercice des droits.</li>
                    </ul>
                </LegalSection>

                <LegalSection id="conservation" title="4. Durées de conservation" icon={<Timer className="size-4" />}>
                    <ul>
                        <li><strong>Compte</strong> : pendant la relation contractuelle puis archivage limité.</li>
                        <li><strong>Prospection</strong> : 3 ans après le dernier contact émanant de votre part.</li>
                        <li><strong>Facturation</strong> : 10 ans au titre des obligations légales françaises.</li>
                        <li><strong>Logs techniques</strong> : durées proportionnées aux besoins de sécurité et rotation régulière.</li>
                    </ul>
                </LegalSection>

                <LegalSection id="destinataires" title="5. Destinataires et services" icon={<Network className="size-4" />}>
                    <p>
                        Vos données peuvent être traitées par les personnes habilitées et par des prestataires dans la mesure strictement nécessaire à leur mission. Des engagements
                        contractuels encadrent ces traitements.
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

                <LegalSection id="transferts" title="6. Transferts hors Union européenne" icon={<Globe className="size-4" />}>
                    <p>
                        Lorsque des transferts en dehors de l’Espace économique européen sont nécessaires, ils sont encadrés par des garanties appropriées, telles que les clauses
                        contractuelles types de la Commission européenne et, lorsque nécessaire, des mesures additionnelles.
                    </p>
                </LegalSection>

                <LegalSection id="securite" title="7. Sécurité" icon={<Lock className="size-4" />}>
                    <p>
                        Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données : contrôles d’accès, chiffrement au repos ou en
                        transit lorsque pertinent, sauvegardes, tests, journalisation et principe du moindre privilège.
                    </p>
                </LegalSection>

                <LegalSection id="droits" title="8. Vos droits" icon={<UserCheck className="size-4" />}>
                    <p>
                        Vous disposez des droits d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité. Vous pouvez également définir des directives
                        post-mortem.
                    </p>
                    <p>
                        Pour exercer vos droits, écrivez à <a href={`mailto:${legalIdentity.email}`}>{legalIdentity.email}</a>. En cas de difficulté, vous pouvez saisir la{' '}
                        <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">CNIL</a>.
                    </p>
                </LegalSection>

                <LegalSection id="cookies" title="9. Cookies" icon={<Cookie className="size-4" />}>
                    <p>
                        Les stockages nécessaires et, lorsqu’elle est configurée, la mesure d’audience optionnelle sont détaillés dans notre{' '}
                        <Link href="/cookies">politique Cookies</Link>. Vous pouvez modifier vos choix depuis le centre de préférences.
                    </p>
                    {!analyticsConfigured ? <LegalNote>Aucun service de mesure d’audience optionnel n’est configuré actuellement.</LegalNote> : null}
                </LegalSection>

                <LegalSection id="contact" title="10. Contact" icon={<Mail className="size-4" />}>
                    <p>
                        E-mail : <a href={`mailto:${legalIdentity.email}`}>{legalIdentity.email}</a>
                    </p>
                    {legalIdentity.phone ? <p>Téléphone : {legalIdentity.phone}</p> : null}
                    <p>Adresse postale : {legalIdentity.postalAddress}</p>
                </LegalSection>

                <LegalSection id="maj" title="11. Mises à jour de cette politique" icon={<FileText className="size-4" />}>
                    <p>
                        Nous pouvons modifier cette politique pour refléter les évolutions légales, techniques ou opérationnelles. La date de dernière mise à jour est indiquée en
                        haut de page.
                    </p>
                </LegalSection>
            </LegalDocumentLayout>
        </>
    );
}
