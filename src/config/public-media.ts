export type PublicMediaRatio = '3 / 2' | '16 / 9' | '4 / 3' | '1 / 1';

type PublicMediaBase = {
  src: `/images/${string}`;
  ratio: PublicMediaRatio;
  objectPosition: string;
  credit: string;
  priorityHint: 'hero' | 'defer';
};

export type PublicMediaAsset = PublicMediaBase &
  (
    | { decorative: true; alt: '' }
    | { decorative: false; alt: string }
  );

const originalCredit = 'Ancre-toi — visuel original';

export const publicMedia = {
  ritualJournal: {
    src: '/images/public/rituel-journal.webp',
    alt: 'Des mains écrivent dans un carnet près d’une améthyste',
    decorative: false,
    ratio: '3 / 2',
    objectPosition: '50% 52%',
    credit: originalCredit,
    priorityHint: 'hero',
  },
  authPortal: {
    src: '/images/public/portail-auth.webp',
    alt: '',
    decorative: true,
    ratio: '3 / 2',
    objectPosition: '56% 50%',
    credit: originalCredit,
    priorityHint: 'hero',
  },
  helpContact: {
    src: '/images/public/aide-contact.webp',
    alt: 'Des mains posées près d’un téléphone et d’une carte vierge',
    decorative: false,
    ratio: '16 / 9',
    objectPosition: '50% 50%',
    credit: originalCredit,
    priorityHint: 'hero',
  },
  compassQuiz: {
    src: '/images/public/quiz-boussole.webp',
    alt: 'Une boussole entourée de papier texturé, de fil corail et d’une améthyste',
    decorative: false,
    ratio: '3 / 2',
    objectPosition: '52% 58%',
    credit: originalCredit,
    priorityHint: 'hero',
  },
  editorialFallback: {
    src: '/images/public/fallback-editorial.webp',
    alt: '',
    decorative: true,
    ratio: '4 / 3',
    objectPosition: '50% 50%',
    credit: originalCredit,
    priorityHint: 'defer',
  },
  videoPoster: {
    src: '/images/sample-poster.webp',
    alt: '',
    decorative: true,
    ratio: '16 / 9',
    objectPosition: '50% 50%',
    credit: originalCredit,
    priorityHint: 'defer',
  },
  transitionStudio: {
    src: '/images/public/transition-studio.webp',
    alt: '',
    decorative: true,
    ratio: '16 / 9',
    objectPosition: '50% 50%',
    credit: originalCredit,
    priorityHint: 'hero',
  },
} as const satisfies Record<string, PublicMediaAsset>;
