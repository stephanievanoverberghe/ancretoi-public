import { publicRoutes, routeBuilders } from '@/config/routes';

export const programmesContent = {
    hero: {
        eyebrow: 'Catalogue des formations',
        title: 'Choisis un parcours clair, puis avance à ton rythme.',
        description:
            'Les programmes Ancre-toi sont pensés comme des formations guidées : une progression simple, un espace apprenant protégé, un journal et des repères pour reprendre sans te perdre.',
        image: {
            src: '/images/programs/hero-programs.webp',
        },
        primaryCta: {
            label: 'Voir RESET-7',
            href: routeBuilders.programme('reset-7'),
        },
        secondaryCta: {
            label: 'Comprendre la méthode',
            href: publicRoutes.methode,
        },
        statPanelTitle: 'Repères de choix',
        decisionPanel: {
            eyebrow: 'Choisir sans pression',
            title: 'Trouve le parcours qui respecte ton énergie du moment.',
            description: 'Chaque programme indique son rythme, son objectif et le type d’accompagnement prévu avant l’achat.',
            items: ['Durée lisible', 'Niveau clair', 'Accès sécurisé'],
        },
    },
    catalogue: {
        eyebrow: 'Programmes',
        title: 'Un catalogue pensé pour choisir sans pression.',
        description:
            'Les programmes sont injectés depuis la base Neon. Les parcours publiés ouvrent leur page détail ; les parcours en préparation restent visibles sans créer de faux accès.',
        emptyTitle: 'Aucun programme disponible pour le moment',
        emptyDescription:
            'La structure du catalogue est prête, mais aucun parcours n’est disponible dans la base actuellement. Reviens plus tard ou contacte l’aide si tu cherches un accès précis.',
        compareCta: 'Voir le comparatif',
        helpCta: 'Aller à l’aide',
    },
    card: {
        publishedLabel: 'Disponible',
        draftLabel: 'En préparation',
        publishedCta: 'Voir le programme',
        draftCta: 'En préparation',
        bestForLabel: 'Idéal si',
        defaultImage: '/images/programs/hero-programs.webp',
        fallbackSummary: 'Un parcours guidé Ancre-toi, structuré pour avancer avec un cadre clair.',
        fallbackIdeal: 'Tu veux choisir un format adapté à ton rythme actuel.',
    },
    comparison: {
        eyebrow: 'Comparer',
        title: 'Quel parcours correspond à ton moment ?',
        description:
            'La durée ne dit pas tout. Compare surtout ton niveau d’énergie, le besoin du moment et le rythme que tu peux tenir maintenant.',
        columns: ['Programme', 'Objectif', 'Durée', 'Niveau', 'Idéal si'],
        labels: {
            objective: 'Objectif',
            duration: 'Durée',
            level: 'Niveau',
            price: 'Prix',
            idealFor: 'Idéal si',
            status: 'Statut',
        },
        priceFallback: 'Prix à confirmer',
        publishedCta: 'Voir le détail',
        draftCta: 'En préparation',
        quizLead: 'Tu hésites encore ? Le quiz Boussole repère ton besoin du moment en cinq questions.',
        quizCta: {
            label: 'Faire le quiz (2 min)',
            href: publicRoutes.quizBoussole,
        },
    },
    detailCurriculum: {
        eyebrow: 'Le programme',
        title: 'Ton parcours, jour par jour.',
        description:
            'Chaque journée est courte et guidée : tu sais toujours où tu en es et ce qui t’attend. Voici le fil complet, sans surprise.',
        weekLabel: 'Semaine',
        dayLabel: 'Jour',
        fallbackDayTitle: 'Journée guidée',
        note: 'Les intitulés donnent le cap. Le contenu complet de chaque journée — vidéo, pratique, journal — s’ouvre dans ton espace après achat.',
    },
    detailReassurance: {
        payment: 'Paiement sécurisé par Stripe',
        access: 'Accès à vie à ton parcours',
        withdrawal: 'Conditions de rétractation',
    },
    experience: {
        eyebrow: 'Expérience apprenant',
        title: 'Après achat, ton parcours trouve sa place.',
        description:
            'Les programmes ne vivent pas dans un document isolé : ils s’ouvrent dans un espace clair, avec les étapes, le journal et les ressources au même endroit.',
        preview: {
            note: 'Les accès de formation apparaissent dans l’espace apprenant après achat ou attribution du programme.',
            sliderAriaLabel: 'Aperçus de l’espace apprenant',
            slides: [
                {
                    label: 'Tableau de bord',
                    title: 'Une vue claire pour reprendre.',
                    description: 'Le prochain pas, les accès et les repères principaux restent visibles dès l’arrivée.',
                    imageSrc: '/images/espace/rituel-quotidien.webp',
                    imageAlt: 'Composition tactile avec améthyste et ruban corail évoquant le rituel quotidien',
                },
                {
                    label: 'Journée guidée',
                    title: 'Chaque étape garde son contexte.',
                    description: 'Vidéo, consigne et validation restent regroupées pour éviter de te disperser.',
                    imageSrc: '/images/espace/reset-7-studio.webp',
                    imageAlt: 'Composition chaleureuse dédiée au parcours RESET-7',
                },
                {
                    label: 'Journal',
                    title: 'Tes notes restent reliées au parcours.',
                    description: 'Le journal accompagne la pratique sans devenir un outil séparé du programme.',
                    imageSrc: '/images/lead-still-life.webp',
                    imageAlt: 'Enveloppe ivoire scellée entourée de lavande, symbole d’une trace personnelle',
                },
                {
                    label: 'Bilan',
                    title: 'Un point d’arrivée lisible.',
                    description: 'Les ressources et bilans donnent une continuité après la dernière étape.',
                    imageSrc: '/images/espace/bilan-accomplissement.webp',
                    imageAlt: 'Composition dorée et améthyste évoquant l’accomplissement du parcours',
                },
            ],
        },
    },
    faq: {
        eyebrow: 'Questions fréquentes',
        title: 'Avant de choisir ton programme',
        items: [
            {
                question: 'Est-ce que je peux commencer si je débute ?',
                answer: 'Oui. Les programmes indiquent leur niveau pour t’aider à choisir un point d’entrée tenable.',
            },
            {
                question: 'Est-ce que les parcours en préparation sont achetables ?',
                answer: 'Non. Ils peuvent apparaître dans le catalogue pour donner la vision produit, mais seuls les parcours publiés ouvrent une page détail.',
            },
            {
                question: 'Que se passe-t-il après un achat ?',
                answer: 'Ton accès est relié à ton compte. L’espace apprenant affiche alors les onglets de formation, journal, ressources et bilan.',
            },
            {
                question: 'Je ne sais pas quel parcours choisir.',
                answer: 'Pars du besoin le plus simple à formuler maintenant. Le comparatif sert justement à choisir sans surcharger.',
            },
        ],
    },
    finalCta: {
        eyebrow: 'Prêt à choisir',
        title: 'Commence par le parcours le plus tenable pour toi.',
        description:
            'Tu n’as pas besoin de tout résoudre. Choisis le format qui respecte ton énergie actuelle, puis avance étape par étape.',
        primaryLabel: 'Voir RESET-7',
        primaryHref: routeBuilders.programme('reset-7'),
        secondaryLabel: 'Découvrir la méthode',
        secondaryHref: publicRoutes.methode,
        asideTitle: 'Un bon choix commence par un cadre simple.',
        asideItems: ['Comparer les formats', 'Vérifier le niveau', 'Accéder à ton espace après achat'],
    },
} as const;
