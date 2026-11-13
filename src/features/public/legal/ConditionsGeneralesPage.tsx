import Link from 'next/link';
import {
    CalendarClock,
    CreditCard,
    Download,
    FileText,
    LifeBuoy,
    Mail,
    Receipt,
    Scale,
    Shield,
    Store,
    Wallet,
} from 'lucide-react';

import { legalIdentity } from '@/content/legal/legal-identity';

import {
    createLegalPageJsonLd,
    LegalDocumentLayout,
    LegalSection,
    type LegalTocItem,
} from './LegalDocumentLayout';

const toc = [
    { href: '#objet', label: '1. Objet' },
    { href: '#utilisation', label: '2. Utilisation du site' },
    { href: '#produits', label: '3. Produits et services' },
    { href: '#prix', label: '4. Prix' },
    { href: '#commande', label: '5. Commande' },
    { href: '#paiement', label: '6. Paiement' },
    { href: '#livraison', label: '7. Accès numérique' },
    { href: '#retractation', label: '8. Droit de rétractation' },
    { href: '#execution', label: '9. Exécution et disponibilité' },
    { href: '#garanties', label: '10. Garanties et SAV' },
    { href: '#responsabilite', label: '11. Responsabilité' },
    { href: '#propriete', label: '12. Propriété intellectuelle' },
    { href: '#donnees', label: '13. Données personnelles' },
    { href: '#mediation', label: '14. Médiation' },
    { href: '#droit', label: '15. Droit applicable' },
    { href: '#contact', label: '16. Contact' },
] as const satisfies readonly LegalTocItem[];

export function ConditionsGeneralesPage() {
    const jsonLd = createLegalPageJsonLd('Conditions générales');

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <LegalDocumentLayout
                title="Conditions générales"
                description="Les règles d’utilisation du site, les conditions applicables aux contenus numériques et les informations utiles avant un achat."
                readingTime="13 min de lecture"
                toc={toc}
                notice={
                    <p>
                        Cette page regroupe les règles d’utilisation et les conditions de vente de la démonstration. Les parcours et transactions présentés sur le site sont
                        simulés.
                    </p>
                }
            >
                <LegalSection id="objet" title="1. Objet" icon={<FileText className="size-4" />}>
                    <p>
                        <strong>{legalIdentity.siteName}</strong> est un site de démonstration conçu et édité par{' '}
                        <a href={legalIdentity.website} target="_blank" rel="noreferrer">{legalIdentity.websiteLabel}</a>. Les présentes conditions décrivent le fonctionnement
                        simulé des parcours et transactions.
                    </p>
                    <p>Toute utilisation du site ou commande implique l’acceptation pleine et entière des conditions en vigueur au jour de l’usage ou de l’achat.</p>
                </LegalSection>

                <LegalSection id="utilisation" title="2. Utilisation du site" icon={<Shield className="size-4" />}>
                    <ul>
                        <li>L’accès au site peut être interrompu ponctuellement en cas de maintenance, incident technique ou force majeure.</li>
                        <li>Certaines fonctionnalités nécessitent un compte. L’utilisateur s’engage à fournir des informations exactes et à protéger ses identifiants.</li>
                        <li>L’utilisateur s’engage à respecter les lois en vigueur, l’intégrité du site et les droits des tiers.</li>
                        <li>{legalIdentity.siteName} peut suspendre ou supprimer un compte en cas de non-respect manifeste des présentes conditions.</li>
                    </ul>
                </LegalSection>

                <LegalSection id="produits" title="3. Produits et services" icon={<Store className="size-4" />}>
                    <p>
                        Les caractéristiques essentielles des produits et services, notamment numériques, sont présentées sur les pages dédiées. Les visuels ont une valeur
                        indicative.
                    </p>
                    <p>Les offres s’entendent dans la limite des disponibilités.</p>
                </LegalSection>

                <LegalSection id="prix" title="4. Prix" icon={<Receipt className="size-4" />}>
                    <ul>
                        <li>Les prix sont indiqués en euros <strong>TTC</strong>, toutes taxes comprises.</li>
                        <li>Les éventuels frais additionnels sont précisés lors de la commande.</li>
                        <li>Nous nous réservons le droit de modifier les prix à tout moment, sans effet rétroactif sur les commandes déjà passées.</li>
                    </ul>
                </LegalSection>

                <LegalSection id="commande" title="5. Commande" icon={<FileText className="size-4" />}>
                    <ul>
                        <li>Le processus de commande en ligne récapitule le panier, les prix et permet la validation finale.</li>
                        <li>Le contrat est conclu après confirmation du paiement et envoi d’un e-mail de confirmation.</li>
                        <li>Nous nous réservons le droit de refuser une commande en cas d’anomalie ou de soupçon de fraude.</li>
                    </ul>
                </LegalSection>

                <LegalSection id="paiement" title="6. Paiement" icon={<CreditCard className="size-4" />}>
                    <ul>
                        <li>Les paiements sont opérés via Stripe. Aucune donnée de carte n’est stockée par {legalIdentity.legalName}.</li>
                        <li>Les moyens acceptés sont précisés lors du parcours de paiement.</li>
                        <li>En cas de rejet du paiement, la commande est automatiquement annulée.</li>
                    </ul>
                </LegalSection>

                <LegalSection id="livraison" title="7. Livraison et accès numérique" icon={<Download className="size-4" />}>
                    <ul>
                        <li>Pour les <strong>contenus numériques</strong>, l’accès est fourni sans support matériel, généralement immédiatement après paiement.</li>
                        <li>Pour tout <strong>envoi matériel</strong>, le cas échéant, les modalités et délais sont indiqués avant la validation.</li>
                    </ul>
                </LegalSection>

                <LegalSection id="retractation" title="8. Droit de rétractation" icon={<CalendarClock className="size-4" />}>
                    <p>
                        Conformément au Code de la consommation, vous disposez d’un <strong>délai de 14 jours</strong> à compter de l’achat pour exercer votre droit de rétractation
                        sans motif.
                    </p>
                    <p>
                        <strong>Exception :</strong> pour les contenus numériques fournis sur un support immatériel dont l’exécution commence avant la fin du délai de 14 jours,
                        avec votre accord exprès et renoncement à votre droit de rétractation, ce droit ne s’applique pas.
                    </p>
                    <p>
                        Pour exercer ce droit, écrivez à <a href={`mailto:${legalIdentity.email}`}>{legalIdentity.email}</a> ou consultez la{' '}
                        <Link href="/retractation">page dédiée à la rétractation</Link>.
                    </p>
                </LegalSection>

                <LegalSection id="execution" title="9. Exécution et disponibilité" icon={<Wallet className="size-4" />}>
                    <p>
                        Nous mettons en œuvre les moyens nécessaires pour assurer l’accès aux services achetés. En cas d’indisponibilité exceptionnelle, un remboursement ou une
                        solution équivalente peut être proposée.
                    </p>
                </LegalSection>

                <LegalSection id="garanties" title="10. Garanties et service après-vente" icon={<Shield className="size-4" />}>
                    <p>Les produits et services bénéficient des garanties légales applicables. Pour toute demande, contactez notre support.</p>
                </LegalSection>

                <LegalSection id="responsabilite" title="11. Responsabilité" icon={<Scale className="size-4" />}>
                    <p>
                        {legalIdentity.siteName} ne saurait être tenu responsable des dommages indirects résultant de l’usage des produits ou services, ni des indisponibilités
                        temporaires du site.
                    </p>
                </LegalSection>

                <LegalSection id="propriete" title="12. Propriété intellectuelle" icon={<FileText className="size-4" />}>
                    <p>
                        Les contenus vendus — textes, visuels, vidéos, sons et logiciels — sont protégés par le droit d’auteur. Toute reproduction ou diffusion non autorisée est
                        interdite.
                    </p>
                </LegalSection>

                <LegalSection id="donnees" title="13. Données personnelles" icon={<Shield className="size-4" />}>
                    <p>
                        Le traitement de vos données est décrit dans notre <Link href="/confidentialite">politique de confidentialité</Link>.
                    </p>
                </LegalSection>

                <LegalSection id="mediation" title="14. Médiation" icon={<LifeBuoy className="size-4" />}>
                    <p>
                        En cas de litige, vous pouvez recourir gratuitement à un médiateur de la consommation conformément à l’article L. 612-1 du Code de la consommation. Les
                        modalités pratiques seront communiquées sur demande.
                    </p>
                </LegalSection>

                <LegalSection id="droit" title="15. Droit applicable et juridiction" icon={<Scale className="size-4" />}>
                    <p>Les présentes conditions sont régies par le droit français. À défaut d’accord amiable, les tribunaux français seront seuls compétents.</p>
                </LegalSection>

                <LegalSection id="contact" title="16. Contact" icon={<Mail className="size-4" />}>
                    <ul>
                        <li>E-mail : <a href={`mailto:${legalIdentity.email}`}>{legalIdentity.email}</a></li>
                        {legalIdentity.phone ? <li>Téléphone : {legalIdentity.phone}</li> : null}
                        <li>Adresse : {legalIdentity.postalAddress}</li>
                        <li>
                            Attribution : <a href={legalIdentity.website} target="_blank" rel="noreferrer">{legalIdentity.websiteLabel}</a>
                        </li>
                    </ul>
                </LegalSection>
            </LegalDocumentLayout>
        </>
    );
}
