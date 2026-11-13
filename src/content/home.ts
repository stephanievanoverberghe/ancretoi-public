import { authRoutes, espaceRoutes, publicRoutes, routeBuilders } from '@/config/routes';

export const homeContent = {
    hero: {
        eyebrow: 'Plateforme de formation guidée',
        titleLead: 'Des parcours courts',
        titleBridge: 'pour',
        titleHighlights: ['revenir à toi.', 'te poser, enfin.', 'clarifier ton cap.', 'tenir ton rythme.'],
        description:
            'Un jour à la fois : des programmes progressifs, un journal de pratique et un espace apprenant clair — sans te rajouter une charge, à ton rythme.',
        meta: ['Accès à vie', 'Sans abonnement', '10 à 20 min par jour'],
        primaryCta: {
            label: 'Voir les programmes',
            href: publicRoutes.programmes,
        },
        activeProgramCta: {
            label: 'Reprendre mon parcours',
            href: espaceRoutes.continuer,
        },
        completedProgramCta: {
            label: 'Revoir mon bilan',
            href: espaceRoutes.bilan,
        },
        secondaryCta: {
            label: 'Découvrir la méthode',
            href: publicRoutes.methode,
        },
        accountCta: {
            label: 'Créer mon espace',
            href: authRoutes.inscription,
        },
        espaceCta: {
            label: 'Mon espace',
            href: espaceRoutes.root,
        },
        formationsCta: {
            label: 'Mes formations',
            href: espaceRoutes.formations,
        },
        stats: [
            { prefix: '7 à ', value: 90, suffix: '', label: 'jours selon le parcours' },
            { prefix: '', value: 1, suffix: '', label: 'étape claire à la fois' },
            { prefix: '', value: 100, suffix: '%', label: 'rythme respecté' },
        ],
        showcase: {
            badge: 'Jour 3 déverrouillé',
            programLabel: 'RESET-7',
            programMeta: '7 jours · 10-20 min/j',
        },
    },
    benefits: {
        eyebrow: 'Pourquoi Ancre-toi',
        title: 'Une plateforme pensée pour pratiquer, pas pour accumuler.',
        description:
            'Chaque parcours garde une structure simple : comprendre, pratiquer, écrire, puis revenir au prochain pas utile.',
        items: [
            {
                icon: 'target',
                title: 'Une progression lisible',
                description: 'Tu sais où tu en es, ce qui t’attend et quelle étape reprendre.',
            },
            {
                icon: 'journal',
                title: 'Un journal intégré',
                description: 'Les notes et ressentis restent liés à ton parcours, sans outil dispersé.',
            },
            {
                icon: 'shield',
                title: 'Un cadre rassurant',
                description: 'Les contenus gardent un rythme doux, avec des repères clairs et non culpabilisants.',
            },
        ],
    },
    programmes: {
        eyebrow: 'Programmes',
        title: 'Choisis le bon niveau d’accompagnement.',
        description:
            'L’accueil présente les parcours sans remplacer le catalogue : la page Programmes détaille les contenus, prix et accès.',
        cta: {
            label: 'Voir le catalogue complet',
            href: publicRoutes.programmes,
        },
        items: [
            {
                slug: 'reset-7',
                title: 'RESET-7',
                duration: '7 jours',
                status: 'Publié',
                href: routeBuilders.programme('reset-7'),
                cover: '/images/programs/reset7.webp',
                description: 'Un parcours court pour remettre de l’ordre, respirer et reprendre appui.',
                points: ['1 journée à la fois', 'Journal quotidien', 'Bilan final'],
            },
            {
                slug: 'boussole-10',
                title: 'BOUSSOLE-10',
                duration: '10 jours',
                status: 'Publié',
                href: routeBuilders.programme('boussole-10'),
                cover: '/images/programs/boussole10.webp',
                description: 'Des repères pour clarifier ce qui compte et choisir une direction plus juste.',
                points: ['Clarté', 'Décision', 'Repères personnels'],
            },
            {
                slug: 'ancrage-30',
                title: 'ANCRAGE-30',
                duration: '30 jours',
                status: 'En préparation',
                href: publicRoutes.programmes,
                cover: '/images/programs/ancrage30.webp',
                description: 'Une structure longue pour installer des pratiques régulières sans surcharge.',
                points: ['Rythme progressif', 'Ressources', 'Suivi'],
            },
            {
                slug: 'alchimie-90',
                title: 'ALCHIMIE-90',
                duration: '90 jours',
                status: 'En préparation',
                href: publicRoutes.programmes,
                cover: '/images/programs/alchimie90.webp',
                description: 'Un accompagnement plus profond pour transformer les habitudes dans la durée.',
                points: ['Parcours avancé', 'Intégration', 'Vision longue'],
            },
        ],
    },
    howItWorks: {
        eyebrow: 'Comment ça marche',
        title: 'Un parcours de formation simple, du choix au bilan.',
        description:
            'L’expérience est conçue pour enlever la friction : tu choisis, tu avances, tu notes, puis tu reprends là où tu t’es arrêté.',
        steps: [
            {
                number: '01',
                title: 'Choisir un parcours',
                description: 'Tu pars du catalogue et tu sélectionnes le format qui correspond à ton besoin du moment.',
            },
            {
                number: '02',
                title: 'Avancer jour après jour',
                description: 'Chaque journée rassemble vidéo, pratique, mantra ou validation selon le programme.',
            },
            {
                number: '03',
                title: 'Garder une trace',
                description: 'Le journal et la progression restent accessibles depuis ton espace apprenant.',
            },
            {
                number: '04',
                title: 'Faire le point',
                description: 'Les bilans et ressources t’aident à intégrer ce qui a changé et à choisir la suite.',
            },
        ],
    },
    learningExperience: {
        eyebrow: 'Expérience apprenant',
        title: 'Tout est regroupé dans un espace de formation sécurisé.',
        description:
            'Après achat ou attribution d’un parcours, l’espace apprenant affiche uniquement les accès utiles : reprendre, formations, journal, ressources, bilan et compte.',
        highlights: [
            { icon: 'video', title: 'Vidéos et supports', description: 'Les contenus restent reliés à chaque journée.' },
            { icon: 'journal', title: 'Journal de pratique', description: 'Tu écris au bon endroit, au bon moment.' },
            { icon: 'lock', title: 'Accès protégés', description: 'Les pages payantes sont gardées côté serveur.' },
            { icon: 'sparkles', title: 'Prochain pas clair', description: 'La plateforme remet toujours l’étape utile devant toi.' },
        ],
    },
    founder: {
        eyebrow: 'Qui t’accompagne',
        title: 'Derrière Ancre-toi, une personne — pas une usine à contenus.',
        quote: 'J’ai créé Ancre-toi pour celles qui veulent revenir à elles sans se rajouter une charge. Chaque programme est écrit comme je l’aurais voulu pour moi : des pas simples, un rythme respecté, et zéro culpabilité quand la vie passe avant.',
        name: 'Stéphanie',
        role: 'Fondatrice d’Ancre-toi',
        image: {
            src: '/images/founder.webp',
            alt: 'Des mains composent un carnet et des papiers colorés dans un atelier',
        },
        points: ['Des programmes écrits et guidés par une seule voix', 'Une méthode incarnée : Ancrage, Boussole, Alchimie', 'Un cadre doux, pensé pour la vraie vie'],
    },
    trust: {
        eyebrow: 'Cadre de confiance',
        title: 'Une formation en ligne sobre, progressive et respectueuse.',
        description:
            'Ancre-toi privilégie la clarté, l’accessibilité et la sécurité émotionnelle plutôt que les tunnels complexes.',
        items: [
            'Accès personnel après connexion',
            'Paiement et accès formation séparés proprement',
            'Des parcours structurés pour avancer étape après étape',
            'Aide, compte et déconnexion restent accessibles à tout moment',
        ],
    },
    faq: {
        eyebrow: 'Questions fréquentes',
        title: 'Ce qu’on nous demande le plus souvent',
        items: [
            {
                question: 'Comment se passe un programme, concrètement ?',
                answer: 'Chaque journée rassemble une vidéo ou une consigne, une pratique courte et ton journal. Compte 10 à 20 minutes par jour, à l’heure qui t’arrange.',
            },
            {
                question: 'Combien de temps ai-je accès à un programme ?',
                answer: 'À vie. Une fois le parcours acheté, il reste relié à ton compte : tu peux le suivre à ton rythme et le refaire quand tu veux.',
            },
            {
                question: 'Et si je décroche quelques jours ?',
                answer: 'Rien n’est perdu. L’espace apprenant te remet exactement là où tu t’es arrêtée, sans culpabilité et sans avoir à chercher.',
            },
            {
                question: 'Comment choisir le bon parcours ?',
                answer: 'Le quiz Boussole repère ton besoin du moment en cinq questions, et le comparatif du catalogue t’aide à confirmer ton choix.',
            },
        ],
    },
    finalCta: {
        eyebrow: 'Prêt à commencer',
        title: 'Choisis un programme, puis avance sans pression.',
        description:
            'Le catalogue t’aide à comparer les formats. Si tu as déjà un parcours actif, ton espace apprenant te ramène directement à la prochaine étape.',
        primaryLabel: 'Voir les programmes',
        activeProgramLabel: 'Reprendre mon parcours',
        secondaryLabel: 'Comprendre la méthode',
    },
} as const;
