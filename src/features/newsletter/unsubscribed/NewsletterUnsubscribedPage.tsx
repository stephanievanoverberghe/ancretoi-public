import { StatusPanel } from '@/components/marketing';
import { LinkButton } from '@/components/ui';
import { publicRoutes } from '@/config/routes';

export function NewsletterUnsubscribedPage() {
    return (
        <StatusPanel
            tone="info"
            eyebrow="Newsletter"
            title="Désinscription confirmée"
            message="Tu ne recevras plus nos emails. Tu peux te réinscrire quand tu veux."
            actions={
                <>
                    <LinkButton href={`${publicRoutes.home}#newsletter`} className="w-full sm:w-fit">
                        Se réinscrire
                    </LinkButton>
                    <LinkButton href={publicRoutes.home} variant="tertiary" className="w-full sm:w-fit">
                        Retour à l’accueil
                    </LinkButton>
                </>
            }
        />
    );
}
