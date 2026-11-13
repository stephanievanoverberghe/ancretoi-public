import Link from 'next/link';
import {
    CalendarClock,
    CreditCard,
    FileText,
    Mail,
    PackageOpen,
    Shield,
    Undo2,
} from 'lucide-react';

import { legalIdentity } from '@/content/legal/legal-identity';

import {
    createLegalPageJsonLd,
    LegalDocumentLayout,
    LegalNote,
    LegalSection,
    type LegalTocItem,
} from './LegalDocumentLayout';

const toc = [
    { href: '#champ', label: '1. Champ d’application' },
    { href: '#delai', label: '2. Délai et point de départ' },
    { href: '#modalites', label: '3. Modalités d’exercice' },
    { href: '#effets', label: '4. Effets de la rétractation' },
    { href: '#exceptions', label: '5. Exceptions légales' },
    { href: '#retours', label: '6. Retours matériels' },
    { href: '#formulaire', label: '7. Modèle de formulaire' },
    { href: '#contact', label: '8. Contact' },
] as const satisfies readonly LegalTocItem[];

export function RetractationPage() {
    const jsonLd = createLegalPageJsonLd('Droit de rétractation');

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <LegalDocumentLayout
                title="Droit de rétractation"
                description="Les délais, modalités, effets et exceptions applicables à l’exercice du droit de rétractation."
                readingTime="7 min de lecture"
                toc={toc}
            >
                <LegalSection id="champ" title="1. Champ d’application" icon={<PackageOpen className="size-4" />}>
                    <p>
                        Le présent dispositif s’applique aux ventes à distance conclues avec des consommateurs. Pour les{' '}
                        <strong>contenus numériques fournis sans support matériel</strong> et pour les <strong>services</strong>, des règles spécifiques s’appliquent, précisées dans
                        la section consacrée aux exceptions.
                    </p>
                </LegalSection>

                <LegalSection id="delai" title="2. Délai et point de départ" icon={<CalendarClock className="size-4" />}>
                    <ul>
                        <li><strong>Produits matériels</strong> : 14 jours à compter de la réception.</li>
                        <li><strong>Services</strong> : 14 jours à compter de la conclusion du contrat.</li>
                        <li><strong>Contenus numériques sans support</strong> : 14 jours à compter de l’achat, sauf renoncement dans les conditions décrites ci-dessous.</li>
                    </ul>
                </LegalSection>

                <LegalSection id="modalites" title="3. Modalités d’exercice" icon={<Undo2 className="size-4" />}>
                    <p>
                        Pour exercer votre droit, envoyez une déclaration dénuée d’ambiguïté indiquant clairement votre souhait de vous rétracter, avec vos nom, prénom, adresse,
                        e-mail, numéro de commande, produit ou service concerné et date d’achat ou de réception.
                    </p>
                    <p>
                        Adressez votre demande à <a href={`mailto:${legalIdentity.email}`}>{legalIdentity.email}</a>.
                    </p>
                </LegalSection>

                <LegalSection id="effets" title="4. Effets de la rétractation" icon={<CreditCard className="size-4" />}>
                    <ul>
                        <li>
                            Remboursement de tous les paiements reçus, y compris les frais standards de livraison le cas échéant, dans les <strong>14 jours</strong> suivant la
                            notification.
                        </li>
                        <li>
                            Le remboursement utilise le <strong>même moyen de paiement</strong> que la transaction initiale, sauf accord exprès différent.
                        </li>
                        <li>
                            Le remboursement peut être différé jusqu’à récupération des biens ou jusqu’à la fourniture d’une preuve d’expédition, la date retenue étant celle du
                            premier de ces faits.
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection id="exceptions" title="5. Exceptions légales" icon={<Shield className="size-4" />}>
                    <ul>
                        <li><strong>Services pleinement exécutés</strong> avant la fin du délai, après votre accord préalable et renoncement express.</li>
                        <li><strong>Contenus numériques</strong> fournis sur un support immatériel dont l’exécution a commencé avec votre accord et renoncement express.</li>
                        <li>Biens personnalisés ou nettement personnalisés.</li>
                        <li>Biens scellés ne pouvant être renvoyés pour des raisons d’hygiène ou de santé, s’ils ont été descellés après la livraison.</li>
                    </ul>
                </LegalSection>

                <LegalSection id="retours" title="6. Retours d’articles matériels, si applicable" icon={<PackageOpen className="size-4" />}>
                    <ul>
                        <li>Renvoyez les biens sans retard excessif et au plus tard dans les <strong>14 jours</strong> suivant votre notification.</li>
                        <li>Vous supportez les <strong>frais directs de renvoi</strong>, sauf mention contraire.</li>
                        <li>
                            Votre responsabilité peut être engagée en cas de dépréciation résultant de manipulations autres que celles nécessaires pour établir la nature, les
                            caractéristiques et le bon fonctionnement du bien.
                        </li>
                    </ul>
                </LegalSection>

                <LegalSection id="formulaire" title="7. Modèle de formulaire de rétractation" icon={<FileText className="size-4" />}>
                    <LegalNote>Vous pouvez reprendre ce modèle dans un e-mail ou dans un courrier postal.</LegalNote>
                    <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface-muted/65 p-4 shadow-soft sm:p-6">
                        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-foreground sm:text-sm">{`À l’attention de ${legalIdentity.legalName} – ${legalIdentity.postalAddress}
E-mail : ${legalIdentity.email}

Je vous notifie par la présente ma rétractation du contrat portant sur la vente du bien / pour la prestation de service ci-dessous :
- Commande n° : __________________________
- Produit / Service : _____________________
- Commandé le : __________  / Reçu le : __________
- Nom : _________________________________
- Adresse : ______________________________
- E-mail : _______________________________

Date : __________     Signature (si envoi postal) : __________`}</pre>
                    </div>
                </LegalSection>

                <LegalSection id="contact" title="8. Contact" icon={<Mail className="size-4" />}>
                    <p>
                        E-mail : <a href={`mailto:${legalIdentity.email}`}>{legalIdentity.email}</a>
                    </p>
                    {legalIdentity.phone ? <p>Téléphone : {legalIdentity.phone}</p> : null}
                    <p>Adresse postale : {legalIdentity.postalAddress}</p>
                    <p>
                        Consultez également les <Link href="/conditions-generales">conditions générales</Link> et les{' '}
                        <Link href="/mentions-legales">mentions légales</Link>.
                    </p>
                </LegalSection>
            </LegalDocumentLayout>
        </>
    );
}
