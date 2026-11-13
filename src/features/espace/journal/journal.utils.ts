const programmeLabels: Record<string, string> = {
    'reset-7': 'RESET-7',
    'boussole-10': 'BOUSSOLE-10',
    'ancrage-30': 'ANCRAGE-30',
    'alchimie-90': 'ALCHIMIE-90',
};

const journalFieldLabels: Record<string, string> = {
    intention: 'Mon intention',
    ressenti: 'Mon ressenti',
    emotion: 'Mon émotion',
    gratitude: 'Ma gratitude',
    apprentissage: 'Ce que je retiens',
    observation: 'Mon observation',
    action: 'Mon prochain petit pas',
    mantra: 'Mon mantra',
    bilan: 'Mon bilan',
};

export function formatProgrammeLabel(slug: string) {
    const normalized = slug.trim().toLowerCase();
    if (programmeLabels[normalized]) return programmeLabels[normalized];

    return normalized
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export function formatJournalFieldLabel(key: string) {
    const normalized = key.trim().toLowerCase();
    if (journalFieldLabels[normalized]) return journalFieldLabels[normalized];

    const label = normalized.replace(/[_-]+/g, ' ').trim();
    return label ? label.charAt(0).toUpperCase() + label.slice(1) : 'Réponse guidée';
}

export function formatJournalDate(value: Date) {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(value);
}
