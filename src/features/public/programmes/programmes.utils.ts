import type { Price } from '@/types/programmes.types';

export function formatPrice(price?: Price | null) {
    if (!price || price.amount_cents === null) return null;

    const label = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: price.currency,
    }).format(price.amount_cents / 100);

    return label + (price.tax_included ? ' TTC' : ' HT');
}
