const routeSegment = (value: string | number) =>
  encodeURIComponent(String(value));

export const publicRoutes = {
  home: "/",
  programmes: "/programmes",
  programme: "/programmes/[slug]",
  methode: "/methode",
  temoignages: "/temoignages",
  blog: "/blog",
  blogArticle: "/blog/[slug]",
  inspirations: "/inspirations",
  inspiration: "/inspirations/[slug]",
  aide: "/aide",
  aideArticle: "/aide/[slug]",
  contact: "/contact",
  quizBoussole: "/quiz/boussole",
} as const;

export const legalRoutes = {
  mentionsLegales: "/mentions-legales",
  conditionsGenerales: "/conditions-generales",
  confidentialite: "/confidentialite",
  cookies: "/cookies",
  cookiePreferences: "/cookies/preferences",
  credits: "/credits",
  retractation: "/retractation",
} as const;

export const authRoutes = {
  connexion: "/connexion",
  inscription: "/inscription",
  motDePasseOublie: "/mot-de-passe-oublie",
  reinitialiserMotDePasse: "/reinitialiser-mot-de-passe",
} as const;

export const espaceRoutes = {
  root: "/espace",
  continuer: "/espace/continuer",
  formations: "/espace/formations",
  formation: "/espace/formations/[programme]",
  formationJour: "/espace/formations/[programme]/jour/[jour]",
  journal: "/espace/journal",
  notes: "/espace/notes",
  ressources: "/espace/ressources",
  plan30Jours: "/espace/plan-30-jours",
  bilan: "/espace/bilan",
  compte: "/espace/compte",
} as const;

export const administrationRoutes = {
  root: "/administration",
  programmes: "/administration/programmes",
  programmeNouveau: "/administration/programmes/nouveau",
  programmeModifier: "/administration/programmes/[slug]/modifier",
  articles: "/administration/articles",
  articleNouveau: "/administration/articles/nouveau",
  articleModifier: "/administration/articles/[slug]/modifier",
  articleArchives: "/administration/articles/archives",
  categories: "/administration/categories",
  categorieNouveau: "/administration/categories/nouveau",
  categorieModifier: "/administration/categories/[slug]/modifier",
  inspirations: "/administration/inspirations",
  inspirationNouveau: "/administration/inspirations/nouveau",
  inspirationModifier: "/administration/inspirations/[slug]/modifier",
  inspirationArchives: "/administration/inspirations/archives",
  apprenants: "/administration/apprenants",
  apprenant: "/administration/apprenants/[id]",
  newsletter: "/administration/newsletter",
  achats: "/administration/achats",
  progression: "/administration/progression",
  exports: "/administration/exports",
  qualite: "/administration/qualite",
  parametres: "/administration/parametres",
} as const;

export const paiementRoutes = {
  root: "/paiement",
  succes: "/paiement/succes",
  annule: "/paiement/annule",
} as const;

export const newsletterRoutes = {
  confirmation: "/newsletter/confirmation",
  erreur: "/newsletter/erreur",
  desinscription: "/newsletter/desinscription",
} as const;

function buildAuthModalRoute(mode: "login" | "register" | "forgot", nextPath?: string) {
  const pathname =
    mode === "register"
      ? authRoutes.inscription
      : mode === "forgot"
        ? authRoutes.motDePasseOublie
        : authRoutes.connexion;
  const params = new URLSearchParams();
  if (nextPath) params.set("next", nextPath);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export const routeBuilders = {
  programme: (slug: string) =>
    `${publicRoutes.programmes}/${routeSegment(slug)}`,
  article: (slug: string) => `${publicRoutes.blog}/${routeSegment(slug)}`,
  inspiration: (slug: string) =>
    `${publicRoutes.inspirations}/${routeSegment(slug)}`,
  aideArticle: (slug: string) => `${publicRoutes.aide}/${routeSegment(slug)}`,
  formation: (programme: string) =>
    `${espaceRoutes.formations}/${routeSegment(programme)}`,
  formationJour: (programme: string, jour: string | number) =>
    `${espaceRoutes.formations}/${routeSegment(programme)}/jour/${routeSegment(
      jour,
    )}`,
  administrationProgrammeEdit: (slug: string) =>
    `${administrationRoutes.programmes}/${routeSegment(slug)}/modifier`,
  administrationArticleEdit: (slug: string) =>
    `${administrationRoutes.articles}/${routeSegment(slug)}/modifier`,
  administrationCategorieEdit: (slug: string) =>
    `${administrationRoutes.categories}/${routeSegment(slug)}/modifier`,
  administrationInspirationEdit: (slug: string) =>
    `${administrationRoutes.inspirations}/${routeSegment(slug)}/modifier`,
  administrationApprenant: (id: string) =>
    `${administrationRoutes.apprenants}/${routeSegment(id)}`,
  connexionWithNext: (nextPath: string) => buildAuthModalRoute("login", nextPath),
  authModal: buildAuthModalRoute,
} as const;

export const reset7DayNumbers = [1, 2, 3, 4, 5, 6, 7] as const;

export type Reset7DayNumber = (typeof reset7DayNumbers)[number];

export const reset7Routes = {
  programmeSlug: "reset-7",
  formation: routeBuilders.formation("reset-7"),
  jours: reset7DayNumbers.map((jour) =>
    routeBuilders.formationJour("reset-7", jour),
  ),
  bilan: espaceRoutes.bilan,
  plan30Jours: espaceRoutes.plan30Jours,
} as const;

export const adminRoutePrefix = administrationRoutes.root;
export const espaceRoutePrefix = espaceRoutes.root;

export const publicRoutePrefixes = [
  publicRoutes.programmes,
  publicRoutes.methode,
  publicRoutes.temoignages,
  publicRoutes.blog,
  publicRoutes.inspirations,
  publicRoutes.aide,
  publicRoutes.contact,
  publicRoutes.quizBoussole,
  legalRoutes.mentionsLegales,
  legalRoutes.conditionsGenerales,
  legalRoutes.confidentialite,
  legalRoutes.cookies,
  legalRoutes.cookiePreferences,
  legalRoutes.credits,
  legalRoutes.retractation,
] as const;

export const authRoutePrefixes = [
  authRoutes.connexion,
  authRoutes.inscription,
  authRoutes.motDePasseOublie,
  authRoutes.reinitialiserMotDePasse,
] as const;

export const protectedRoutePrefixes = [
  espaceRoutePrefix,
  adminRoutePrefix,
] as const;

export const visibleRoutePatterns = [
  publicRoutes.home,
  publicRoutes.programmes,
  publicRoutes.programme,
  publicRoutes.methode,
  publicRoutes.temoignages,
  publicRoutes.blog,
  publicRoutes.blogArticle,
  publicRoutes.inspirations,
  publicRoutes.inspiration,
  publicRoutes.aide,
  publicRoutes.aideArticle,
  publicRoutes.contact,
  publicRoutes.quizBoussole,
  legalRoutes.mentionsLegales,
  legalRoutes.conditionsGenerales,
  legalRoutes.confidentialite,
  legalRoutes.cookies,
  legalRoutes.cookiePreferences,
  legalRoutes.credits,
  legalRoutes.retractation,
  authRoutes.connexion,
  authRoutes.inscription,
  authRoutes.motDePasseOublie,
  authRoutes.reinitialiserMotDePasse,
  espaceRoutes.root,
  espaceRoutes.continuer,
  espaceRoutes.formations,
  espaceRoutes.formation,
  espaceRoutes.formationJour,
  espaceRoutes.journal,
  espaceRoutes.notes,
  espaceRoutes.ressources,
  espaceRoutes.plan30Jours,
  espaceRoutes.bilan,
  espaceRoutes.compte,
  administrationRoutes.root,
  administrationRoutes.programmes,
  administrationRoutes.programmeNouveau,
  administrationRoutes.programmeModifier,
  administrationRoutes.articles,
  administrationRoutes.articleNouveau,
  administrationRoutes.articleModifier,
  administrationRoutes.articleArchives,
  administrationRoutes.categories,
  administrationRoutes.categorieNouveau,
  administrationRoutes.categorieModifier,
  administrationRoutes.inspirations,
  administrationRoutes.inspirationNouveau,
  administrationRoutes.inspirationModifier,
  administrationRoutes.inspirationArchives,
  administrationRoutes.apprenants,
  administrationRoutes.apprenant,
  administrationRoutes.newsletter,
  paiementRoutes.root,
  paiementRoutes.succes,
  paiementRoutes.annule,
  newsletterRoutes.confirmation,
  newsletterRoutes.erreur,
  newsletterRoutes.desinscription,
] as const;

export type VisibleRoutePattern = (typeof visibleRoutePatterns)[number];

export const routes = {
  public: publicRoutes,
  legal: legalRoutes,
  auth: authRoutes,
  espace: espaceRoutes,
  administration: administrationRoutes,
  paiement: paiementRoutes,
  newsletter: newsletterRoutes,
  builders: routeBuilders,
} as const;
