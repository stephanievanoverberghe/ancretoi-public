import { publicRoutes } from '@/config/routes';

export const espaceContent = {
    dashboard: {
        eyebrow: 'Tableau de bord',
        welcome: {
            fresh: 'Ton parcours t’attend. La première journée est prête — commence quand tu veux.',
            inProgress: 'Tu avances à ton rythme, et c’est exactement ce qu’il faut. La suite est prête.',
            completed: 'Parcours terminé — bravo. Ton bilan t’attend pour choisir la suite.',
        },
        stats: {
            active: 'Formations actives',
            progress: 'Progression moyenne',
            daysDone: 'Journées complétées',
            lastActivity: 'Dernière activité',
        },
        courses: {
            title: 'Mes formations',
            description: 'Reprends là où tu t’es arrêtée, ou revisite un parcours terminé.',
        },
        streak: {
            title: 'Mon assiduité',
            description: 'Un point par jour d’activité sur les 30 derniers jours. La régularité douce compte plus que l’intensité.',
        },
    },
    courseCard: {
        continueLabel: 'Continuer',
        startLabel: 'Commencer',
        completedLabel: 'Revoir le bilan',
        detailsLabel: 'Détails',
        completedBadge: 'Terminé',
        activeBadge: 'En cours',
        pausedBadge: 'En pause',
        nextStepLabel: 'Prochaine étape',
        firstStepHint: 'La première journée est prête',
        completedHint: 'Parcours terminé — ton bilan est disponible',
        pausedHint: 'En pause — reprends quand tu veux',
        daysSuffix: 'jours',
    },
    formations: {
        eyebrow: 'Mes formations',
        title: 'Tes parcours, au même endroit.',
        description: 'Chaque formation garde ta progression : tu peux avancer, faire une pause et reprendre sans rien perdre.',
        catalogueCta: 'Découvrir d’autres parcours',
        catalogueHref: publicRoutes.programmes,
    },
    noAccess: {
        title: 'Ton espace est prêt — il ne manque qu’un parcours.',
        description:
            'Dès qu’une formation est active sur ton compte, tu retrouves ici ta progression, ton journal et ton bilan. Choisis le parcours qui correspond à ton moment.',
        primaryCta: 'Découvrir les programmes',
        quizCta: 'Faire le quiz (2 min)',
        helpHint: 'Tu penses avoir déjà un accès ?',
        helpCta: 'Contacte-nous',
    },
    empty: {
        courses: {
            title: 'Aucune formation en cours',
            description: 'Choisis un programme pour démarrer ton premier parcours guidé.',
        },
    },
} as const;
