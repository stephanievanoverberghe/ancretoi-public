import React from 'react';
import type { UserDocLite } from './user-tabs.types';
import { Card, SectionTitle } from './UserTabsPrimitives';
import { toFr } from './user-tabs.utils';

type Props = {
    idBase: string;
    user: UserDocLite;
    extraSlot?: React.ReactNode;
    hidden: boolean;
};

export default function UserIdentityPanel({ idBase, user, extraSlot, hidden }: Props) {
    return (
        <div role="tabpanel" id={`${idBase}-panel-identite`} aria-labelledby={`${idBase}-tab-identite`} tabIndex={0} hidden={hidden}>
            <SectionTitle kicker="Profil" title="Identité & Sécurité" hint="Informations de base et statut du compte." />
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <h3 className="text-sm font-semibold mb-3">Identité</h3>
                    <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div>
                            <dt className="text-muted-foreground">Nom</dt>
                            <dd className="font-medium">{user.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Email</dt>
                            <dd className="font-medium">{user.email}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Thème</dt>
                            <dd className="font-medium">{user.theme ?? 'system'}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Créé</dt>
                            <dd className="font-medium">{toFr(user.createdAt)}</dd>
                        </div>
                    </dl>
                </Card>

                <Card>
                    <h3 className="text-sm font-semibold mb-3">Sécurité</h3>
                    <div className="text-sm">
                        Mot de passe modifié : <strong>{toFr(user.passwordChangedAt)}</strong>
                    </div>
                </Card>
            </div>
            {extraSlot && React.Children.toArray(extraSlot)}
        </div>
    );
}
