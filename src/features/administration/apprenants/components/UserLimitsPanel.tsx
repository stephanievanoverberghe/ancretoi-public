import React from 'react';
import { SectionTitle } from './UserTabsPrimitives';

type Props = {
    slot: React.ReactNode;
    hidden: boolean;
};

export default function UserLimitsPanel({ slot, hidden }: Props) {
    return (
        <div role="tabpanel" id="panel-limites" aria-labelledby="tab-limites" hidden={hidden}>
            <SectionTitle kicker="Accès & quotas" title="Limites & sécurité" hint="Quotas d’usage et flags de fonctionnalités." />
            {slot && React.Children.toArray(slot)}
        </div>
    );
}
