import Link from 'next/link';

import { StatusPanel } from '@/components/marketing';
import { LinkButton } from '@/components/ui';
import { publicRoutes } from '@/config/routes';

export type NewsletterErrorSearchParams = { code?: string };

const messages: Record<string, { title: string; body: string }> = {
    invalid_token: {
        title: 'Lien invalide ou déjà utilisé',
        body: 'Ce lien de confirmation n’est plus valide. Demande un nouveau lien et réessaie.',
    },
    expired: {
        title: 'Lien expiré',
        body: 'Le lien de confirmation a expiré. Demande un nouveau lien pour terminer l’inscription.',
    },
    invalid_unsub: {
        title: 'Lien de désinscription invalide',
        body: 'Impossible de te désinscrire avec ce lien. Demande un nouveau lien depuis un email récent.',
    },
};

export async function NewsletterErrorPage({ searchParams }: { searchParams?: Promise<NewsletterErrorSearchParams> }) {
    const sp = (await searchParams) ?? {};
    const code = sp.code ?? 'invalid_token';
    const msg = messages[code] ?? {
        title: 'Oups, une erreur est survenue',
        body: 'Impossible de confirmer ton adresse pour le moment.',
    };

    return (
        <StatusPanel
            tone="warning"
            eyebrow="Newsletter"
            title={msg.title}
            message={msg.body}
            actions={
                <>
                    <LinkButton href={`${publicRoutes.home}#newsletter`} className="w-full sm:w-fit">
                        Demander un nouveau lien
                    </LinkButton>
                    <LinkButton href={publicRoutes.home} variant="tertiary" className="w-full sm:w-fit">
                        Retour à l’accueil
                    </LinkButton>
                </>
            }
            footnote={
                <>
                    Besoin d’aide ?{' '}
                    <Link className="font-medium text-primary underline underline-offset-2 hover:no-underline" href={publicRoutes.aide}>
                        Contacte-nous
                    </Link>
                    .
                </>
            }
        />
    );
}
