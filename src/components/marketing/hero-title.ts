/**
 * Échelles typographiques partagées des titres de hero publics.
 * Source unique de vérité : les h1 des pages publiques doivent consommer
 * l'une de ces deux classes plutôt que de redéclarer leurs tailles.
 *
 * - `heroTitleClassName` : heros de vente (accueil, méthode, programmes,
 *   détail programme) — culmine à ~52px en desktop.
 * - `heroTitleCompactClassName` : heros support (blog, inspirations, quiz,
 *   aide, contact) — plafonné à 48px, un cran en dessous.
 *
 * L'accueil garde une variante locale (colonne étroite + mots rotatifs)
 * mais vise le même pic de ~52px.
 */
export const heroTitleClassName = 'font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-[3.25rem]';

export const heroTitleCompactClassName = 'font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl';
