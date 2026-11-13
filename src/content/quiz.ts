import { publicRoutes, routeBuilders } from '@/config/routes';

export type QuizProfile = 'reset' | 'boussole' | 'ancrage' | 'alchimie';

type QuizOption = {
    label: string;
    profile: QuizProfile;
};

type QuizQuestion = {
    question: string;
    options: readonly QuizOption[];
};

type QuizResult = {
    badge: string;
    title: string;
    description: string;
    reasons: readonly string[];
    primaryCta: { label: string; href: string };
    note?: string;
};

export const quizContent = {
    hero: {
        eyebrow: 'Quiz Boussole',
        title: 'Quel parcours correspond à ton moment ?',
        description:
            'Cinq questions rapides pour repérer ton besoin du moment et trouver un point de départ tenable. Sans compte, sans email, sans bonne réponse.',
        meta: ['5 questions', '2 minutes', 'Résultat immédiat'],
    },
    quiz: {
        progressLabel: 'Question',
        backLabel: 'Retour',
        restartLabel: 'Refaire le quiz',
        resultEyebrow: 'Ton point de départ',
        secondaryCta: { label: 'Comparer les programmes', href: publicRoutes.programmes },
        disclaimer:
            'Ce quiz est un repère, pas un diagnostic. Il t’aide simplement à choisir un premier pas réaliste — tu restes libre de préférer un autre format.',
        questions: [
            {
                question: 'Comment te sens-tu ces dernières semaines ?',
                options: [
                    { label: 'Dispersée, fatiguée, souvent sous tension', profile: 'reset' },
                    { label: 'Perdue sur ce que je veux vraiment', profile: 'boussole' },
                    { label: 'Plutôt stable, mais sans régularité', profile: 'ancrage' },
                    { label: 'Prête pour un changement de fond', profile: 'alchimie' },
                ],
            },
            {
                question: 'Qu’est-ce qui te pèse le plus en ce moment ?',
                options: [
                    { label: 'Le mental qui tourne et la charge qui s’accumule', profile: 'reset' },
                    { label: 'Les décisions floues, dire oui à tout', profile: 'boussole' },
                    { label: 'Les bonnes habitudes qui ne tiennent pas', profile: 'ancrage' },
                    { label: 'Des schémas qui reviennent depuis longtemps', profile: 'alchimie' },
                ],
            },
            {
                question: 'Honnêtement, combien de temps peux-tu donner chaque jour ?',
                options: [
                    { label: '10 minutes maximum, sans pression', profile: 'reset' },
                    { label: '15 à 20 minutes, si ça m’aide à décider', profile: 'boussole' },
                    { label: '15 à 20 minutes, et je veux que ça dure', profile: 'ancrage' },
                    { label: 'Je peux m’engager sur plusieurs mois', profile: 'alchimie' },
                ],
            },
            {
                question: 'Ton besoin le plus urgent aujourd’hui :',
                options: [
                    { label: 'Souffler et me poser', profile: 'reset' },
                    { label: 'Y voir clair et choisir une direction', profile: 'boussole' },
                    { label: 'Installer un rythme qui tient', profile: 'ancrage' },
                    { label: 'Transformer en profondeur', profile: 'alchimie' },
                ],
            },
            {
                question: 'Quel format te rassure le plus pour commencer ?',
                options: [
                    { label: 'Court : un premier pas simple et guidé', profile: 'reset' },
                    { label: 'Structuré : des repères pour clarifier', profile: 'boussole' },
                    { label: 'Progressif : construire sur un mois', profile: 'ancrage' },
                    { label: 'Profond : un accompagnement long', profile: 'alchimie' },
                ],
            },
        ] as readonly QuizQuestion[],
        results: {
            reset: {
                badge: 'RESET-7 · 7 jours',
                title: 'Commence par te poser avec RESET-7.',
                description:
                    'Ton moment demande d’abord du calme et un cadre court. RESET-7 t’aide à revenir au corps et à reprendre un rythme simple, en 10 à 20 minutes par jour.',
                reasons: ['Un format court qui ne rajoute pas de charge', 'Des pratiques pensées pour les journées sans énergie', 'Un premier cadre facile à reprendre si tu décroches'],
                primaryCta: { label: 'Découvrir RESET-7', href: routeBuilders.programme('reset-7') },
            },
            boussole: {
                badge: 'BOUSSOLE-10 · 10 jours',
                title: 'Clarifie ton cap avec BOUSSOLE-10.',
                description:
                    'Ton besoin du moment est la clarté : ce qui compte, ce que tu veux, ce que tu ne veux plus. BOUSSOLE-10 transforme ce flou en repères concrets et en décisions.',
                reasons: ['Un travail guidé sur les valeurs, besoins et limites', 'Des journées structurées pour décider sans te perdre', 'Un cap provisoire et actionnable à la fin du parcours'],
                primaryCta: { label: 'Découvrir BOUSSOLE-10', href: routeBuilders.programme('boussole-10') },
            },
            ancrage: {
                badge: 'RESET-7 pour commencer',
                title: 'Pose d’abord le socle avec RESET-7.',
                description:
                    'Tu cherches de la régularité dans la durée. ANCRAGE-30 est fait pour ça — il est en préparation. En attendant, RESET-7 installe le socle idéal : un rituel court que tu tiens vraiment.',
                reasons: ['Le format court aide justement la régularité à démarrer', 'Les repères de RESET-7 se prolongent naturellement sur 30 jours', 'Tu seras prête quand ANCRAGE-30 ouvrira'],
                primaryCta: { label: 'Découvrir RESET-7', href: routeBuilders.programme('reset-7') },
                note: 'ANCRAGE-30, le parcours d’un mois dédié à la régularité, est en préparation.',
            },
            alchimie: {
                badge: 'BOUSSOLE-10 pour commencer',
                title: 'Prépare la transformation avec BOUSSOLE-10.',
                description:
                    'Tu vises un changement de fond. ALCHIMIE-90 accompagnera ce chemin — il est en préparation. BOUSSOLE-10 prépare le terrain : clarifier ce qui compte avant de transformer.',
                reasons: ['La clarté est le premier pas d’une transformation durable', 'Dix jours guidés pour poser des fondations solides', 'Tu seras prête quand ALCHIMIE-90 ouvrira'],
                primaryCta: { label: 'Découvrir BOUSSOLE-10', href: routeBuilders.programme('boussole-10') },
                note: 'ALCHIMIE-90, le parcours long de transformation, est en préparation.',
            },
        } as Record<QuizProfile, QuizResult>,
    },
} as const;
