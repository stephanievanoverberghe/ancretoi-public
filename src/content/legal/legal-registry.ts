export type LegalStorageCategory = 'Nécessaire' | 'Mesure d’audience optionnelle';

export type LegalStorageEntry = {
  name: string;
  category: LegalStorageCategory;
  purpose: string;
  lifetime: string;
  condition: string;
};

export const legalStorageRegistry = [
  {
    name: 'at_consent',
    category: 'Nécessaire',
    purpose: 'Mémorise les choix de consentement effectués sur le site.',
    lifetime: '12 mois',
    condition: 'Créé après un choix dans la bannière ou la page de préférences.',
  },
  {
    name: '__Host-ancretoi_session',
    category: 'Nécessaire',
    purpose: 'Maintient la session authentifiée et protège l’accès au compte.',
    lifetime: '7 jours',
    condition: 'Créé après une connexion réussie ; son nom diffère hors production.',
  },
  {
    name: 'csrf_token',
    category: 'Nécessaire',
    purpose: 'Protège les formulaires sensibles contre les requêtes frauduleuses.',
    lifetime: '30 minutes',
    condition: 'Créé lors de la préparation d’un formulaire protégé.',
  },
  {
    name: 'ancretoi_google_oauth_*',
    category: 'Nécessaire',
    purpose: 'Sécurise temporairement le retour d’une connexion Google.',
    lifetime: '10 minutes',
    condition: 'Créé uniquement lorsqu’une connexion Google est lancée.',
  },
  {
    name: '_ga et _ga_*',
    category: 'Mesure d’audience optionnelle',
    purpose: 'Mesure l’utilisation du site avec Google Analytics.',
    lifetime: 'Selon la configuration active de Google Analytics',
    condition: 'Créé uniquement si le service est configuré et si la mesure d’audience est acceptée.',
  },
] as const satisfies readonly LegalStorageEntry[];

export type LegalServiceEntry = {
  name: string;
  purpose: string;
  condition?: string;
};

export const legalServiceRegistry = [
  { name: 'Vercel', purpose: 'Hébergement et diffusion du site.' },
  { name: 'Neon / PostgreSQL', purpose: 'Hébergement des données applicatives.' },
  { name: 'Stripe', purpose: 'Traitement sécurisé des paiements.', condition: 'Uniquement lors d’un parcours d’achat.' },
  { name: 'Resend', purpose: 'Envoi des e-mails de service et de la newsletter consentie.' },
  { name: 'Google OAuth', purpose: 'Connexion facultative avec un compte Google.', condition: 'Uniquement à la demande de la personne.' },
  { name: 'Google Analytics', purpose: 'Mesure d’audience.', condition: 'Uniquement si configuré et accepté.' },
  { name: 'YouTube / Vimeo', purpose: 'Lecture de certains contenus vidéo.', condition: 'Le lecteur externe est activé après une action explicite.' },
] as const satisfies readonly LegalServiceEntry[];

export const legalDocumentUpdatedAt = '30/07/2026';
