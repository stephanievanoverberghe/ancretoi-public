import {
  administrationRoutes,
  authRoutes,
  espaceRoutes,
  legalRoutes,
  publicRoutes,
  routeBuilders,
} from './routes';

export type NavigationIconKey =
  | 'archive'
  | 'home'
  | 'play'
  | 'book'
  | 'folder'
  | 'notes'
  | 'help'
  | 'boxes'
  | 'chart'
  | 'credit-card'
  | 'mail'
  | 'newspaper'
  | 'settings'
  | 'shield'
  | 'sparkles'
  | 'tag'
  | 'target'
  | 'user'
  | 'users'
  | 'instagram'
  | 'youtube'
  | 'contact';

export type NavigationItem = {
  href: string;
  label: string;
  description?: string;
  icon?: NavigationIconKey;
  badge?: string;
  exact?: boolean;
  external?: boolean;
  disabled?: boolean;
};

export type LearnerNavigationIconKey =
  | 'home'
  | 'book'
  | 'notes'
  | 'target'
  | 'chart'
  | 'folder'
  | 'user'
  | 'help';

export type LearnerNavigationItem = Omit<NavigationItem, 'icon'> & {
  icon: LearnerNavigationIconKey;
};

export type NavigationSection = {
  title: string;
  description?: string;
  links: NavigationItem[];
};

export const navigationHrefs = {
  newsletter: '/#newsletter',
} as const;

export const publicNavigationItems: NavigationItem[] = [
  {
    href: publicRoutes.programmes,
    label: 'Programmes',
    description: 'Parcours guidés',
  },
  {
    href: publicRoutes.methode,
    label: 'Méthode',
    description: 'Cadre pédagogique',
  },
  { href: publicRoutes.blog, label: 'Blog', description: 'Ressources' },
  {
    href: publicRoutes.inspirations,
    label: 'Inspirations',
    description: 'Pratiques courtes',
  },
  { href: publicRoutes.aide, label: 'Aide', description: 'Support' },
];

export const publicHeaderNavigationItems: NavigationItem[] = publicNavigationItems.filter(
  (item) => item.href !== publicRoutes.aide,
);

/** Entrées du menu déroulant "Programmes" du header public. */
export const programmesMenuItems: NavigationItem[] = [
  {
    href: publicRoutes.programmes,
    label: 'Tous les programmes',
    description: 'Catalogue et comparatif',
    icon: 'boxes',
  },
  {
    href: routeBuilders.programme('reset-7'),
    label: 'RESET-7',
    description: '7 jours pour te poser',
    icon: 'play',
  },
  {
    href: routeBuilders.programme('boussole-10'),
    label: 'BOUSSOLE-10',
    description: '10 jours pour clarifier ton cap',
    icon: 'target',
  },
  {
    href: publicRoutes.quizBoussole,
    label: 'Quiz Boussole',
    description: 'Trouve ton parcours en 2 minutes',
    icon: 'sparkles',
  },
];

export const accountNavigationItems: NavigationItem[] = [
  { href: espaceRoutes.root, label: 'Accueil apprenant', exact: true },
  { href: espaceRoutes.compte, label: 'Compte' },
  { href: publicRoutes.aide, label: 'Aide' },
];

// La navigation apprenant ne liste que des DESTINATIONS. « Reprendre » est
// une action (widget sidebar / bouton topbar), pas une entrée de nav.
export const learnerNavigationItems: readonly LearnerNavigationItem[] = [
  {
    href: espaceRoutes.root,
    label: 'Accueil',
    description: 'Vue d’ensemble',
    icon: 'home',
    exact: true,
  },
  {
    href: espaceRoutes.formations,
    label: 'Formations',
    description: 'Mes parcours',
    icon: 'book',
  },
  {
    href: espaceRoutes.journal,
    label: 'Journal',
    description: 'Notes et ressentis',
    icon: 'notes',
  },
  {
    href: espaceRoutes.bilan,
    label: 'Bilan',
    description: 'Synthèse du parcours',
    icon: 'target',
  },
  {
    href: espaceRoutes.plan30Jours,
    label: 'Guide 30 jours',
    description: 'Repères après RESET-7',
    icon: 'chart',
  },
  {
    href: espaceRoutes.ressources,
    label: 'Ressources',
    description: 'Supports utiles',
    icon: 'folder',
  },
  {
    href: espaceRoutes.compte,
    label: 'Compte',
    description: 'Profil et sécurité',
    icon: 'user',
  },
  { href: publicRoutes.aide, label: 'Aide', description: 'Besoin de repère', icon: 'help' },
];

/** Regroupement de la navigation apprenant en sections pour la sidebar (apprenant avec formation). */
export const learnerNavigationGroups: { title: string; hrefs: readonly string[] }[] = [
  { title: 'Apprendre', hrefs: [espaceRoutes.root, espaceRoutes.formations] },
  { title: 'Mon suivi', hrefs: [espaceRoutes.journal, espaceRoutes.bilan, espaceRoutes.plan30Jours] },
  { title: 'Ressources', hrefs: [espaceRoutes.ressources, publicRoutes.aide] },
];

/** Destinations principales de la barre mobile. Le quatrième onglet ouvre le panneau « Plus ». */
export const learnerMobilePrimaryHrefs = [espaceRoutes.root, espaceRoutes.formations, espaceRoutes.journal] as const;

/** Destinations secondaires regroupées dans le panneau mobile « Plus ». */
export const learnerMoreHrefs = [espaceRoutes.bilan, espaceRoutes.plan30Jours, espaceRoutes.ressources, espaceRoutes.compte, publicRoutes.aide] as const;

export type AdministrationNavigationIconKey = 'home' | 'boxes' | 'newspaper' | 'tag' | 'book' | 'users' | 'mail';

export type AdministrationNavigationItem = Omit<NavigationItem, 'icon'> & {
  icon: AdministrationNavigationIconKey;
};

export type AdministrationNavigationSection = {
  title: string;
  description?: string;
  links: AdministrationNavigationItem[];
};

export const administrationNavigationSections: AdministrationNavigationSection[] = [
  {
    title: 'Pilotage',
    description: 'Vue d’ensemble',
    links: [
      {
        href: administrationRoutes.root,
        label: 'Tableau de bord',
        description: 'Synthèse admin',
        icon: 'home',
        exact: true,
      },
    ],
  },
  {
    title: 'Contenu pédagogique',
    description: 'CMS formations',
    links: [
      {
        href: administrationRoutes.programmes,
        label: 'Programmes',
        description: 'Parcours et unités',
        icon: 'boxes',
      },
      {
        href: administrationRoutes.articles,
        label: 'Articles',
        description: 'Blog pédagogique',
        icon: 'newspaper',
      },
      {
        href: administrationRoutes.categories,
        label: 'Catégories',
        description: 'Taxonomie contenu',
        icon: 'tag',
      },
      {
        href: administrationRoutes.inspirations,
        label: 'Inspirations',
        description: 'Pratiques courtes',
        icon: 'book',
      },
    ],
  },
  {
    title: 'Audience',
    description: 'Apprenants et relation',
    links: [
      {
        href: administrationRoutes.apprenants,
        label: 'Apprenants',
        description: 'Comptes et accès',
        icon: 'users',
      },
      {
        href: administrationRoutes.newsletter,
        label: 'Newsletter',
        description: 'Liste et campagnes',
        icon: 'mail',
      },
    ],
  },
];

export const administrationNavigationItems = administrationNavigationSections.flatMap(
  (section) => section.links,
);

export const publicFooterNavigationSections: NavigationSection[] = [
  {
    title: 'Programmes',
    links: [
      { href: publicRoutes.programmes, label: 'Catalogue' },
      { href: routeBuilders.programme('reset-7'), label: 'RESET-7' },
      { href: routeBuilders.programme('boussole-10'), label: 'BOUSSOLE-10' },
      { href: publicRoutes.quizBoussole, label: 'Quiz Boussole' },
      { href: publicRoutes.methode, label: 'La méthode' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { href: publicRoutes.blog, label: 'Blog' },
      { href: publicRoutes.inspirations, label: 'Inspirations' },
      { href: publicRoutes.temoignages, label: 'Témoignages' },
      { href: publicRoutes.aide, label: 'Aide' },
      { href: publicRoutes.contact, label: 'Contact' },
    ],
  },
  {
    title: 'Compte',
    links: [
      { href: espaceRoutes.root, label: 'Mon espace' },
      { href: authRoutes.connexion, label: 'Connexion' },
      { href: authRoutes.inscription, label: 'Inscription' },
    ],
  },
];

export const legalNavigationItems: NavigationItem[] = [
  { href: legalRoutes.mentionsLegales, label: 'Mentions légales' },
  { href: legalRoutes.confidentialite, label: 'Confidentialité' },
  { href: legalRoutes.cookiePreferences, label: 'Cookies' },
  { href: legalRoutes.conditionsGenerales, label: 'Conditions générales' },
  { href: legalRoutes.retractation, label: 'Rétractation' },
  { href: legalRoutes.credits, label: 'Crédits' },
];

function optionalSocialUrl(rawUrl: string | undefined) {
  if (!rawUrl?.trim()) return null;

  try {
    const url = new URL(rawUrl);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

const instagramUrl = optionalSocialUrl(
  process.env.NEXT_PUBLIC_INSTAGRAM_URL,
);
const youtubeUrl = optionalSocialUrl(process.env.NEXT_PUBLIC_YOUTUBE_URL);

export const socialNavigationItems: NavigationItem[] = [
  ...(instagramUrl
    ? [
        {
          href: instagramUrl,
          label: 'Instagram',
          icon: 'instagram' as const,
          external: true,
        },
      ]
    : []),
  ...(youtubeUrl
    ? [
        {
          href: youtubeUrl,
          label: 'YouTube',
          icon: 'youtube' as const,
          external: true,
        },
      ]
    : []),
  { href: publicRoutes.contact, label: 'Contact', icon: 'contact' },
];
