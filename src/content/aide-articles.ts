export type AideArticle = {
    slug: string;
    title: string;
    description: string;
    steps: readonly string[];
    note?: string;
};

export const aideArticles: readonly AideArticle[] = [
    {
        slug: 'debloquer-le-jour-suivant',
        title: 'Débloquer le jour suivant',
        description:
            'Le parcours avance dans l’ordre afin de garder un rythme simple et rassurant.',
        steps: [
            'Ouvre la journée en cours depuis ta formation.',
            'Regarde ou écoute le contenu principal à ton rythme.',
            'Réponds au journal proposé, puis confirme la pratique demandée.',
            'Valide la journée : la prochaine étape apparaît ensuite dans ton espace.',
        ],
        note: 'Si la journée reste verrouillée après validation, recharge la page puis contacte-nous sans recommencer tout le parcours.',
    },
    {
        slug: 'mettre-un-parcours-en-pause',
        title: 'Mettre un parcours en pause',
        description:
            'Faire une pause ne doit pas effacer ton journal ni ta progression.',
        steps: [
            'Retourne à l’accueil de ton espace.',
            'Utilise l’action de pause proposée sur le parcours concerné.',
            'Tes journées terminées et tes notes restent conservées.',
            'Tu peux reprendre depuis la prochaine étape lorsque tu te sens prête.',
        ],
        note: 'Une suppression définitive de données est une action séparée, volontaire et confirmée.',
    },
    {
        slug: 'retrouver-et-exporter-mes-notes',
        title: 'Retrouver et exporter mes notes',
        description:
            'Ton journal rassemble les réponses guidées ; les notes libres restent accessibles séparément.',
        steps: [
            'Ouvre Journal pour retrouver les réponses liées aux journées.',
            'Utilise Notes pour conserver des réflexions libres.',
            'Filtre par programme ou période si nécessaire.',
            'Lance un export uniquement depuis l’action dédiée et attends la confirmation du téléchargement.',
        ],
    },
    {
        slug: 'resoudre-un-probleme-affichage',
        title: 'Résoudre un problème d’affichage',
        description:
            'Quelques vérifications simples corrigent la majorité des problèmes temporaires.',
        steps: [
            'Recharge la page et vérifie ta connexion.',
            'Ferme complètement l’onglet ou l’application sur mobile, puis relance.',
            'Teste une fenêtre de navigation privée.',
            'Si le problème continue, envoie-nous l’URL, ton appareil et une capture d’écran.',
        ],
    },
    {
        slug: 'retrouver-un-achat',
        title: 'Retrouver un achat ou un accès',
        description:
            'L’accès doit être rattaché au même e-mail que celui utilisé pour le paiement.',
        steps: [
            'Déconnecte-toi puis reconnecte-toi avec l’e-mail de l’achat.',
            'Ouvre Mes formations et vérifie si le programme apparaît.',
            'Attends quelques minutes si le paiement vient juste d’être confirmé.',
            'Si l’accès manque encore, contacte-nous avec la date d’achat et le programme concerné.',
        ],
        note: 'Ne transmets jamais ton numéro complet de carte bancaire.',
    },
] as const;

export function getAideArticle(slug: string) {
    return aideArticles.find((article) => article.slug === slug) ?? null;
}
