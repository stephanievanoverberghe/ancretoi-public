import { authRoutes, publicRoutes } from '@/config/routes';

export const authContent = {
    shell: {
        eyebrow: 'Espace apprenant',
        title: 'Un accès simple pour reprendre ta formation au bon endroit.',
        description:
            'Connexion, inscription et récupération de mot de passe gardent le même objectif : protéger ton compte sans compliquer ton retour au parcours.',
        highlights: ['Accès formation après achat', 'Journal et progression conservés', 'Compte protégé côté serveur'],
        links: {
            programmes: {
                label: 'Voir les programmes',
                href: publicRoutes.programmes,
            },
            aide: {
                label: 'Besoin d’aide ?',
                href: publicRoutes.aide,
            },
        },
    },
    connexion: {
        eyebrow: 'Connexion',
        title: 'Bon retour.',
        description: 'Connecte-toi pour accéder à ton compte, reprendre un parcours actif ou gérer tes informations.',
        submit: 'Se connecter',
        pending: 'Connexion...',
        switchLabel: 'Pas encore de compte ?',
        switchLink: 'Créer un compte',
        switchHref: authRoutes.inscription,
        forgotPassword: 'Mot de passe oublié ?',
        forgotPasswordHref: authRoutes.motDePasseOublie,
    },
    inscription: {
        eyebrow: 'Inscription',
        title: 'Crée ton espace.',
        description: 'Ton compte permet de retrouver tes accès, ton journal et ta progression après achat ou attribution d’un parcours.',
        submit: 'Créer mon compte',
        pending: 'Création...',
        switchLabel: 'Déjà un compte ?',
        switchLink: 'Se connecter',
        switchHref: authRoutes.connexion,
    },
    forgotPassword: {
        eyebrow: 'Mot de passe oublié',
        title: 'Recevoir un lien de réinitialisation.',
        description: 'Si un compte existe avec cette adresse, un lien valable 15 minutes sera envoyé.',
        submit: 'Envoyer le lien',
        pending: 'Envoi...',
        successTitle: 'Demande prise en compte',
        successDescription: 'Si le compte existe, le lien a été envoyé. Pense à vérifier tes spams.',
        switchLabel: 'Tu connais ton mot de passe ?',
        switchLink: 'Retour à la connexion',
        switchHref: authRoutes.connexion,
    },
    resetPassword: {
        eyebrow: 'Nouveau mot de passe',
        title: 'Choisis un mot de passe solide.',
        description: 'Ton nouveau mot de passe protège l’accès à ton espace apprenant et aux parcours achetés.',
        submit: 'Mettre à jour',
        pending: 'Mise à jour...',
        invalidTitle: 'Lien invalide ou expiré',
        invalidDescription: 'Refais une demande pour recevoir un nouveau lien sécurisé.',
        doneTitle: 'Mot de passe mis à jour',
        doneDescription: 'Tu peux maintenant te reconnecter avec ton nouveau mot de passe.',
    },
} as const;
