import React from 'react';
import type { UserDocLite } from './user-tabs.types';
import { Card, SectionTitle } from './UserTabsPrimitives';

type Props = {
    idBase: string;
    user: UserDocLite;
    extraSlot?: React.ReactNode;
    hidden: boolean;
};

export default function UserPreferencesPanel({ idBase, user, extraSlot, hidden }: Props) {
    return (
        <div role="tabpanel" id={`${idBase}-panel-preferences`} aria-labelledby={`${idBase}-tab-preferences`} tabIndex={0} hidden={hidden}>
            <SectionTitle kicker="Communication" title="Préférences utilisateur" hint="Notifications, marketing et mises à jour." />
            <Card>
                <ul className="text-sm space-y-1">
                    <li>
                        Marketing : <strong>{user.marketing ? 'oui' : 'non'}</strong>
                    </li>
                    <li>
                        Mises à jour produit : <strong>{user.productUpdates ? 'oui' : 'non'}</strong>
                    </li>
                </ul>
            </Card>
            {extraSlot && React.Children.toArray(extraSlot)}
        </div>
    );
}
