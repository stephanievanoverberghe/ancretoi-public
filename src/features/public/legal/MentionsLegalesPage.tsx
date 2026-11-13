import Link from 'next/link';
import {
    Building2,
    Cookie,
    Copyright as CopyrightIcon,
    ExternalLink,
    LifeBuoy,
    Link2,
    Mail,
    Scale,
    Shield,
} from 'lucide-react';

import { legalIdentity } from '@/content/legal/legal-identity';

import {
    createLegalPageJsonLd,
    LegalDocumentLayout,
    LegalSection,
    type LegalTocItem,
} from './LegalDocumentLayout';

const toc = [
    { href: '#editeur', label: '1. Éditeur du site' },
    { href: '#hebergeur', label: '2. Hébergeur' },
    { href: '#responsabilites', label: '3. Responsabilités' },
    { href: '#propriete', label: '4. Propriété intellectuelle' },
    { href: '#donnees', label: '5. Données personnelles' },
    { href: '#cookies', label: '6. Cookies' },
    { href: '#liens', label: '7. Liens externes' },
    { href: '#droit', label: '8. Droit applicable' },
    { href: '#mediation', label: '9. Médiation' },
    { href: '#contact', label: '10. Contact' },
] as const satisfies readonly LegalTocItem[];

export function MentionsLegalesPage() {
    const jsonLd = createLegalPageJsonLd('Mentions légales');

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <LegalDocumentLayout
                title="Mentions légales"
                description="Les informations essentielles sur l’édition, l’hébergement et les responsabilités liées au site Ancre-toi."
                readingTime="8 min de lecture"
                toc={toc}
                notice={
                    <p>
                        {legalIdentity.siteName} est un site de démonstration attribué à {legalIdentity.legalName}. Il n’est pas présenté comme une entité commerciale distincte
                        immatriculée.
                    </p>
                }
            >
                <LegalSection id="editeur" title="1. Éditeur du site" icon={<Building2 className="size-4" />}>
                    <p>
                        <strong>{legalIdentity.siteName}</strong> est un site de démonstration conçu et édité par{' '}
                        <a href={legalIdentity.website} target="_blank" rel="noreferrer">
                            {legalIdentity.websiteLabel}
                            <ExternalLink className="ml-1 inline size-3.5 align-[-1px]" aria-hidden="true" />
                        </a>
                        .
                    </p>
                    <ul>
                        <li>Adresse : {legalIdentity.postalAddress}</li>
                        <li>Direction de la publication : {legalIdentity.ownerName}</li>
                        <li>
                            E-mail : <a href={`mailto:${legalIdentity.email}`}>{legalIdentity.email}</a>
                        </li>
                        {legalIdentity.phone ? <li>Téléphone : {legalIdentity.phone}</li> : null}
                    </ul>
                </LegalSection>

                <LegalSection id="hebergeur" title="2. Hébergeur" icon={<Building2 className="size-4" />}>
                    <p>
                        Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis —{' '}
                        <a href="https://vercel.com" target="_blank" rel="noreferrer">
                            vercel.com <ExternalLink className="ml-1 inline size-3.5 align-[-1px]" aria-hidden="true" />
                        </a>
                    </p>
                </LegalSection>

                <LegalSection id="responsabilites" title="3. Responsabilités" icon={<Scale className="size-4" />}>
                    <p>
                        {legalIdentity.siteName} s’efforce d’assurer l’exactitude et la mise à jour des informations diffusées. Toutefois, {legalIdentity.siteName} ne peut garantir
                        l’absence d’erreurs ou d’omissions et décline toute responsabilité en cas d’utilisation inappropriée du site ou d’interruptions de service.
                    </p>
                    <p>
                        L’utilisateur reconnaît utiliser le site sous sa seule responsabilité. {legalIdentity.siteName} ne saurait être tenu responsable des dommages directs ou
                        indirects résultant de l’accès au site, de son utilisation ou de l’impossibilité d’y accéder.
                    </p>
                </LegalSection>

                <LegalSection id="propriete" title="4. Propriété intellectuelle" icon={<CopyrightIcon className="size-4" />}>
                    <p>
                        L’ensemble des contenus — textes, images, graphismes, logos, vidéos, icônes, sons et logiciels — présents sur ce site sont protégés par le droit d’auteur et
                        les droits de propriété intellectuelle. Toute reproduction, représentation, modification, publication, transmission ou dénaturation, totale ou partielle,
                        est interdite sans l’autorisation préalable et écrite de {legalIdentity.siteName}.
                    </p>
                    <p>Les marques et logos éventuellement cités restent la propriété de leurs détenteurs respectifs.</p>
                </LegalSection>

                <LegalSection id="donnees" title="5. Données personnelles (RGPD)" icon={<Shield className="size-4" />}>
                    <p>
                        {legalIdentity.siteName} collecte et traite des données personnelles conformément au Règlement (UE) 2016/679 et à la loi Informatique et Libertés. Les
                        finalités, bases légales, durées de conservation et destinataires sont proportionnés à chaque usage : compte, relation client, facturation, support,
                        communication consentie, statistiques et sécurité.
                    </p>
                    <p>
                        Vous disposez des droits d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité. Vous pouvez également définir des directives
                        post-mortem. Pour exercer ces droits, écrivez à <a href={`mailto:${legalIdentity.email}`}>{legalIdentity.email}</a>.
                    </p>
                    <p>
                        En cas de difficulté, vous pouvez saisir la{' '}
                        <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">CNIL</a>. Consultez aussi notre{' '}
                        <Link href="/confidentialite">politique de confidentialité</Link>.
                    </p>
                </LegalSection>

                <LegalSection id="cookies" title="6. Cookies et traceurs" icon={<Cookie className="size-4" />}>
                    <p>
                        Le site utilise les stockages nécessaires à la sécurité, à l’authentification et à la mémorisation du consentement. Une mesure d’audience optionnelle peut
                        être activée uniquement lorsqu’elle est configurée et acceptée.
                    </p>
                    <p>
                        La liste factuelle et le centre de préférences sont accessibles dans la <Link href="/cookies">politique Cookies</Link>.
                    </p>
                </LegalSection>

                <LegalSection id="liens" title="7. Liens hypertextes" icon={<Link2 className="size-4" />}>
                    <p>
                        Le site peut contenir des liens vers des sites tiers. {legalIdentity.siteName} ne peut être tenu responsable du contenu ou du fonctionnement de ces sites et
                        décline toute responsabilité concernant les dommages pouvant résulter de leur consultation.
                    </p>
                </LegalSection>

                <LegalSection id="droit" title="8. Droit applicable et juridiction" icon={<Scale className="size-4" />}>
                    <p>
                        Les présentes mentions sont soumises au droit français. En cas de litige et à défaut d’accord amiable, les tribunaux français seront seuls compétents, sous
                        réserve des règles de compétence d’ordre public.
                    </p>
                </LegalSection>

                <LegalSection id="mediation" title="9. Médiation de la consommation" icon={<LifeBuoy className="size-4" />}>
                    <p>
                        Conformément à l’article L. 612-1 du Code de la consommation, le consommateur peut recourir gratuitement à un médiateur de la consommation en vue de la
                        résolution amiable d’un litige.
                    </p>
                </LegalSection>

                <LegalSection id="contact" title="10. Contact" icon={<Mail className="size-4" />}>
                    <p>
                        E-mail : <a href={`mailto:${legalIdentity.email}`}>{legalIdentity.email}</a>
                    </p>
                    {legalIdentity.phone ? <p>Téléphone : {legalIdentity.phone}</p> : null}
                    <p>Adresse postale : {legalIdentity.postalAddress}</p>
                </LegalSection>
            </LegalDocumentLayout>
        </>
    );
}
