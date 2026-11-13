import { StatusPanel } from '@/components/marketing';
import { LinkButton } from '@/components/ui';
import { publicRoutes } from '@/config/routes';

export function PaiementAnnulePage() {
    return (
        <StatusPanel
            tone="info"
            eyebrow="Aucun débit"
            title="Paiement annulé"
            message="Le paiement a été annulé : rien n’a été débité et aucun accès payant ne sera ouvert. Tu peux réessayer quand tu veux."
            actions={
                <>
                    <LinkButton href={publicRoutes.programmes} className="w-full sm:w-fit">
                        Revoir les programmes
                    </LinkButton>
                    <LinkButton href={publicRoutes.aide} variant="tertiary" className="w-full sm:w-fit">
                        Besoin d’aide
                    </LinkButton>
                </>
            }
        />
    );
}
