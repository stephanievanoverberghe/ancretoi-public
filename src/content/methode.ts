import { publicRoutes, routeBuilders } from '@/config/routes';

export const methodeContent = {
    hero: {
        eyebrow: 'La méthode Ancre-toi',
        title: 'Ancrage, Boussole, Alchimie : trois piliers pour revenir à toi.',
        description:
            'La méthode n’est pas un protocole figé : c’est une façon d’habiter ton axe, de t’écouter avec honnêteté et d’agir en cohérence. Trois piliers, un même souffle.',
        image: {
            src: '/images/method/hero-methode.webp',
        },
        primaryCta: {
            label: 'Voir les programmes',
            href: publicRoutes.programmes,
        },
        secondaryCta: {
            label: 'Voir le processus',
            href: '#processus',
        },
        pillarsPanel: {
            eyebrow: 'Les trois piliers',
            title: 'Un chemin simple, dans cet ordre ou au tien.',
            description: 'Chaque pilier répond à une question concrète : comment je me pose, qu’est-ce qui compte, comment je transforme.',
            items: [
                { label: 'Ancrage', description: 'Revenir au corps', href: '#ancrage' },
                { label: 'Boussole', description: 'Clarifier ce qui compte', href: '#boussole' },
                { label: 'Alchimie', description: 'Transformer avec douceur', href: '#alchimie' },
            ],
        },
    },
    pillars: {
        eyebrow: 'Les piliers',
        title: 'Trois appuis concrets, reliés au quotidien.',
        description:
            'Chaque pilier se pratique avec des rituels courts et tenables. Les programmes reprennent ces appuis étape par étape, sans te demander de tout faire d’un coup.',
        items: [
            {
                id: 'ancrage',
                title: 'Ancrage',
                description:
                    'Revenir au corps, poser des racines dans le quotidien. Ralentir, respirer, remettre l’axe en place pour des décisions plus claires.',
                points: ['Rituel respiration 4-6 et présence', 'Hygiène douce : sommeil, lumière, mouvement', 'Journal court : corps, cœur, tête'],
                image: {
                    src: '/images/method/pillar-ancrage.webp',
                    alt: 'Silhouette de racines stylisées en papier, sauge et lilas, lumière douce',
                },
            },
            {
                id: 'boussole',
                title: 'Boussole',
                description:
                    'Clarifier ce qui compte vraiment : valeurs, besoins, limites saines. Avancer en cohérence plutôt qu’en pilotage automatique.',
                points: ['Carte personnelle : des valeurs aux décisions', 'Limites dites sans culpabilité', 'Check-in quotidien aligné'],
                image: {
                    src: '/images/method/pillar-boussole.webp',
                    alt: 'Rose des vents minimaliste en papier, améthyste et or discret',
                },
            },
            {
                id: 'alchimie',
                title: 'Alchimie',
                description:
                    'Transformer avec douceur. Intégrer ce qui bloque, faire circuler, transmuter pour un axe vivant et durable.',
                points: ['Exercices d’intégration émotionnelle', 'Vision concrète à 3–12 mois', 'Premiers pas visibles et tenables'],
                image: {
                    src: '/images/method/pillar-alchimie.webp',
                    alt: 'Spirale en papier évoquant la transformation, améthyste vers or',
                },
            },
        ],
    },
    process: {
        eyebrow: 'Le processus',
        title: 'Un fil logique, à ton rythme.',
        description:
            'Le chemin suit un ordre naturel — se poser, clarifier, transformer — mais tu peux piocher selon tes besoins. Les programmes t’accompagnent étape par étape.',
        asideBadge: 'Dans les programmes',
        asideTitle: 'Tu n’as pas à l’appliquer seule.',
        asideDescription:
            'Chaque programme traduit la méthode en journées guidées : une pratique, une consigne et une trace dans ton journal, sans surcharge.',
        asideCta: {
            label: 'Explorer les parcours',
            href: publicRoutes.programmes,
        },
        steps: [
            {
                number: '01',
                title: 'Ancrage',
                description:
                    'On calme l’intérieur et on pose des racines dans le quotidien : respiration 4-6, check doux du corps, micro-rituels tenables.',
            },
            {
                number: '02',
                title: 'Boussole',
                description: 'On clarifie ce qui compte et on le traduit en décisions concrètes : valeurs, limites, actions réalistes.',
            },
            {
                number: '03',
                title: 'Alchimie',
                description: 'On intègre ce qui bloque, on transforme avec douceur et on installe une vision tangible sur 3 à 12 mois.',
            },
        ],
    },
    benefits: {
        eyebrow: 'Ce que ça change',
        title: 'Ce que tu peux ressentir en pratiquant.',
        description:
            'Pas de promesse spectaculaire : des effets simples et cumulatifs, qui s’installent avec la régularité douce plutôt qu’avec la performance.',
        items: [
            { title: 'Plus d’oxygène intérieur', description: 'Le mental ralentit, le corps respire, les choix s’éclaircissent.' },
            { title: 'Un axe concret', description: 'Des rituels simples, enracinés dans la vraie vie.' },
            { title: 'De la cohérence', description: 'Dire oui ou non sans culpabilité, avancer en paix.' },
            { title: 'De la stabilité', description: 'Un cadre doux pour accueillir les vagues émotionnelles.' },
            { title: 'De l’élan', description: 'Retrouver l’envie d’agir et de créer.' },
            { title: 'De la tendresse', description: 'Se parler avec justesse, sans dureté inutile.' },
        ],
        note: 'La méthode soutient une pratique personnelle. Elle ne remplace pas un accompagnement médical, psychologique ou thérapeutique si tu en as besoin.',
    },
    faq: {
        eyebrow: 'Questions fréquentes',
        title: 'Avant de te lancer',
        items: [
            {
                question: 'Combien de temps faut-il pour sentir un changement ?',
                answer: 'Dès la première semaine si tu respectes des micro-rituels simples. L’objectif n’est pas la performance, mais la régularité douce.',
            },
            {
                question: 'Est-ce compatible avec un emploi du temps chargé ?',
                answer: 'Oui. La méthode est pensée pour le réel : des formats courts, ajustables, et des exercices modulables en 5 à 15 minutes.',
            },
            {
                question: 'Dois-je tout faire dans l’ordre ?',
                answer: 'Le fil logique existe — Ancrage, puis Boussole, puis Alchimie — mais tu peux piocher selon tes besoins. Les programmes t’accompagnent étape par étape.',
            },
            {
                question: 'Comment la méthode se traduit-elle dans les programmes ?',
                answer: 'Chaque programme reprend les piliers en journées guidées : RESET-7 pose l’ancrage, BOUSSOLE-10 travaille la clarté, et les parcours longs approfondissent la transformation.',
            },
        ],
    },
    finalCta: {
        eyebrow: 'Envie d’essayer',
        title: 'Expérimente la méthode pas à pas, dans un programme guidé.',
        description:
            'Tu n’as pas besoin de tout comprendre avant de commencer. Choisis le format le plus tenable pour toi et laisse le cadre faire le reste.',
        primaryLabel: 'Voir RESET-7',
        primaryHref: routeBuilders.programme('reset-7'),
        secondaryLabel: 'Comparer les programmes',
        secondaryHref: publicRoutes.programmes,
        asideTitle: 'La méthode, en pratique dès le premier jour.',
        asideItems: ['Des rituels courts et tenables', 'Un journal pour garder une trace', 'Un rythme respecté, sans culpabilité'],
    },
} as const;
