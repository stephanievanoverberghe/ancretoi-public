import { espaceRoutes, publicRoutes } from '@/config/routes';

export const siteIdentity = {
  name: 'Ancre-toi',
  logoSrc: '/images/logo.png',
} as const;

export const publicHeaderContent = {
  mainNavLabel: 'Navigation principale',
  programmesMenuLabel: 'Menu des programmes',
  mobileNavLabel: 'Navigation mobile',
  mobileOpenLabel: 'Ouvrir le menu',
  mobileCloseLabel: 'Fermer le menu',
  accountMenuLabel: 'Ouvrir le menu du compte',
  accountLinksLabel: 'Liens du compte',
  accountAdminLabel: 'Administration',
  primaryCta: {
    href: publicRoutes.programmes,
    label: 'Commencer',
  },
  learnerCta: {
    href: espaceRoutes.continuer,
    label: 'Reprendre',
  },
  auth: {
    login: 'Se connecter',
    register: "S'inscrire",
    logout: 'Se déconnecter',
    logoutPending: 'Déconnexion...',
    logoutLoadingLabel: 'Déconnexion en cours',
  },
} as const;

export const publicFooterContent = {
  tagline: 'Revenir à toi, un jour à la fois.',
  description:
    'Des parcours guidés, un journal intégré et des repères doux pour avancer sans te rajouter une charge.',
  newsletter: {
    title: 'L’inspiration du mois, dans ta boîte mail',
    description: 'Un email par mois, doux et concret. Rien d’autre.',
  },
  socialLabel: 'Réseaux et contact',
  legalLabel: 'Liens légaux',
  copyrightSuffix: 'Tous droits réservés.',
} as const;

export const learnerShellContent = {
  eyebrow: 'Studio rituel',
  title: 'Ton espace de pratique',
  description:
    'Retrouve ton parcours, ton journal et tes repères dans un espace calme, une étape à la fois.',
  navigationLabel: 'Navigation apprenant',
  mobileMoreLabel: 'Plus',
  mobileMoreTitle: 'Ton espace',
  mobileMoreDescription: 'Retrouve ici ton suivi, tes ressources et les réglages de ton compte.',
  primaryActionLabel: 'Reprendre mon parcours',
  startProgramLabel: 'Voir les programmes',
  secondaryActionLabel: 'Voir mes parcours',
  publicSiteLabel: 'Site public',
  adminAccessLabel: 'Administration',
  accountLabel: 'Ouvrir mon compte',
  accountTitle: 'Mon compte',
  accountDescription: 'Profil, aide et accès rapides.',
  closeLabel: 'Fermer',
  notificationsLabel: 'Ouvrir les notifications',
  notificationsEmptyTitle: 'Aucune notification',
  notificationsEmptyDescription:
    'Les rappels de parcours et les messages importants apparaîtront ici quand ils seront disponibles.',
  progressHint: 'RESET-7 reste organisé en 7 journées, une étape à la fois.',
  emptyAccessHint:
    'Choisissez un programme pour débloquer un parcours, votre journal et une prochaine étape claire.',
} as const;

export const adminShellContent = {
  title: 'Administration',
  eyebrow: 'CMS pédagogique',
  subtitle: 'Pilotez les parcours, les contenus, les apprenants et les opérations de la plateforme.',
  badge: 'Accès admin',
  breadcrumbRoot: 'Administration',
  mobileOpenLabel: 'Ouvrir la navigation admin',
  mobileCloseLabel: 'Fermer la navigation admin',
  navigationLabel: 'Navigation administration',
  mobileNavigationLabel: 'Navigation administration mobile',
  publicSiteLabel: 'Voir le site',
  learnerSpaceLabel: 'Espace apprenant',
  accountLabel: 'Ouvrir mon compte',
  notificationsLabel: 'Ouvrir les notifications admin',
  notificationsEmptyTitle: 'Aucune alerte admin',
  notificationsEmptyDescription:
    'Les alertes de contenu, de paiement ou de qualité seront regroupées ici quand elles seront branchées.',
} as const;
