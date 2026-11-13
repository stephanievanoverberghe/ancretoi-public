import type { CSSProperties } from 'react';

type LearnerShellStyle = CSSProperties & {
  '--learner-safe-area-bottom': string;
  '--learner-mobile-nav-height': string;
  '--learner-mobile-nav-bottom': string;
  '--learner-mobile-content-bottom': string;
  '--learner-action-bar-bottom': string;
};

type LearnerPortalSafeAreaStyle = CSSProperties & {
  '--learner-safe-area-bottom': string;
};

const learnerSafeAreaBottom = 'env(safe-area-inset-bottom, 0px)';

/**
 * Contrat local du shell apprenant pour les éléments fixes sur mobile.
 * Toutes les surfaces du studio réutilisent ces variables plutôt que de
 * recalculer séparément la hauteur de navigation et la safe-area.
 */
export const learnerShellStyle: LearnerShellStyle = {
  '--learner-safe-area-bottom': learnerSafeAreaBottom,
  '--learner-mobile-nav-height': '4.5rem',
  '--learner-mobile-nav-bottom': 'calc(0.75rem + var(--learner-safe-area-bottom))',
  '--learner-mobile-content-bottom': 'calc(8rem + var(--learner-safe-area-bottom))',
  '--learner-action-bar-bottom': 'calc(6.75rem + var(--learner-safe-area-bottom))',
};

/** Les portails Radix vivent sous body et n'héritent pas des variables du shell. */
export const learnerPortalSafeAreaStyle: LearnerPortalSafeAreaStyle = {
  '--learner-safe-area-bottom': learnerSafeAreaBottom,
};
