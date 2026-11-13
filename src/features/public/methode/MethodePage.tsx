import {
    MethodeBenefitsSection,
    MethodeFaqSection,
    MethodeFinalCtaSection,
    MethodeHeroSection,
    MethodePillarsSection,
    MethodeProcessSection,
} from './sections';

const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: 'La méthode Ancre-toi',
    description: 'Une approche simple et incarnée : Ancrage, Boussole, Alchimie. Respiration, clarté, transformation.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/methode`,
    about: ['Ancrage', 'Boussole', 'Alchimie'],
};

export function MethodePage() {
    return (
        <div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />

            <MethodeHeroSection />
            <MethodePillarsSection />
            <MethodeProcessSection />
            <MethodeBenefitsSection />
            <MethodeFaqSection />
            <MethodeFinalCtaSection />
        </div>
    );
}
