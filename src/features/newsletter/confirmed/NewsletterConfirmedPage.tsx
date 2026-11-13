import { StatusPanel } from '@/components/marketing';
import { LinkButton } from '@/components/ui';
import { espaceRoutes, publicRoutes } from '@/config/routes';
import { getSession } from '@/server/auth/session';

export async function NewsletterConfirmedPage() {
    const sess = await getSession();
    const isAuthed = !!sess?.email;

    return (
        <StatusPanel
            tone="success"
            eyebrow="Newsletter"
            title="Inscription confirmée"
            message="Merci ! Tu recevras bientôt tes inspirations et mini-rituels. Tu peux commencer à explorer dès maintenant."
            actions={
                <>
                    <LinkButton href={publicRoutes.programmes} className="w-full sm:w-fit">
                        Découvrir les programmes
                    </LinkButton>
                    <LinkButton href={isAuthed ? espaceRoutes.root : publicRoutes.blog} variant="tertiary" className="w-full sm:w-fit">
                        {isAuthed ? 'Mon espace' : 'Lire le blog'}
                    </LinkButton>
                </>
            }
            footnote="Tu peux te désinscrire à tout moment via le lien présent en bas de chaque email."
        />
    );
}
