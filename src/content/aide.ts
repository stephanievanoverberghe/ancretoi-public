import { espaceRoutes, publicRoutes } from '@/config/routes';

export const aideContent = {
    hero: {
        eyebrow: 'Centre d’aide',
        title: 'On t’aide à avancer sereinement.',
        description: 'Questions fréquentes, résolutions rapides et contact direct : tout est là pour débloquer ta situation sans stress.',
        meta: ['Réponses immédiates', 'Contact simple', 'Sans jargon'],
    },
    contactCards: [
        {
            icon: 'mail',
            title: 'Nous écrire',
            description: 'Pose ta question ou signale un souci avec un maximum de détails (page concernée, capture si possible).',
            ctaLabel: 'Ouvrir le contact',
            href: publicRoutes.contact,
        },
        {
            icon: 'compass',
            title: 'Choisir un parcours',
            description: 'Tu hésites entre les programmes ? Le quiz Boussole repère ton besoin du moment en deux minutes.',
            ctaLabel: 'Faire le quiz',
            href: publicRoutes.quizBoussole,
        },
        {
            icon: 'lifebuoy',
            title: 'Résolution rapide',
            description: 'Souci d’affichage, de connexion ou d’accès : les vérifications de base règlent la plupart des cas.',
            ctaLabel: 'Voir les vérifications',
            href: '#depannage',
        },
    ],
    faq: {
        eyebrow: 'Questions fréquentes',
        title: 'Les réponses aux situations courantes',
    },
    troubleshooting: {
        eyebrow: 'Dépannage',
        title: 'Résolution rapide, dans l’ordre',
        steps: [
            'Recharge la page, ou essaye une autre connexion (4G / Wi-Fi).',
            'Ouvre le site en navigation privée, ou vide le cache du navigateur.',
            'Vérifie que tu es connectée avec le bon e-mail (celui de ton achat).',
            'Sur mobile, ferme complètement l’onglet ou l’application, puis relance.',
        ],
        stillStuck: 'Toujours bloquée ? Écris-nous avec l’URL de la page et une capture d’écran : on te répond au plus vite.',
        contactCta: 'Nous contacter',
    },
    quickLinks: {
        title: 'Accès rapides',
        items: [
            { label: 'Reprendre mon parcours', href: espaceRoutes.continuer },
            { label: 'Mes notes', href: espaceRoutes.notes },
            { label: 'Mes ressources', href: espaceRoutes.ressources },
        ],
    },
} as const;
