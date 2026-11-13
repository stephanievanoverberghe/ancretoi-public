'use client';

import { useCallback, useMemo, useState } from 'react';
import { Shield, User as UserIcon } from 'lucide-react';
import { FullscreenModal } from '@/components/ui/overlays';

type Props = {
    currentRole: 'user' | 'admin';
    formId: string; // id du <form> qui pointe sur setRole
};

export default function AdminRoleSwitch({ currentRole, formId }: Props) {
    const [open, setOpen] = useState(false);
    const [pendingRole, setPendingRole] = useState<'user' | 'admin'>(currentRole);

    const isUser = currentRole === 'user';
    const isAdmin = currentRole === 'admin';

    const submitWithRole = useCallback(
        (role: 'user' | 'admin') => {
            const form = document.getElementById(formId) as HTMLFormElement | null;
            if (!form) return;

            // met à jour l’input hidden role
            const roleInput = form.querySelector<HTMLInputElement>('input[name="role"]');
            if (roleInput) roleInput.value = role;

            form.requestSubmit(); // Next server action: setRole
        },
        [formId]
    );

    const onClickUser = useCallback(() => {
        if (isUser) return; // déjà actif
        submitWithRole('user'); // pas de modale pour downgrade
    }, [isUser, submitWithRole]);

    const onClickAdmin = useCallback(() => {
        if (isAdmin) return; // déjà actif
        setPendingRole('admin');
        setOpen(true); // affiche la modale d’avertissement
    }, [isAdmin]);

    const segmentedCls = useMemo(() => 'grid w-full grid-cols-2 rounded-xl border border-border bg-surface-muted p-1 sm:inline-flex sm:w-auto', []);

    const baseBtn =
        'inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] motion-safe:transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30';

    return (
        <>
            {/* SWITCH segmenté */}
            <div className={segmentedCls} role="group" aria-label="Basculer le rôle">
                {/* Utilisateur */}
                <button
                    type="button"
                    onClick={onClickUser}
                    aria-pressed={isUser}
                    aria-current={isUser ? 'true' : undefined}
                    className={`${baseBtn} ${
                        isUser ? 'bg-primary text-primary-foreground shadow-soft' : 'cursor-pointer text-muted-foreground hover:bg-surface hover:text-foreground'
                    }`}
                    title="Basculer en Utilisateur"
                >
                    <UserIcon className="h-4 w-4" aria-hidden />
                    Utilisateur
                </button>

                {/* Admin (protégé par modale) */}
                <button
                    type="button"
                    onClick={onClickAdmin}
                    aria-pressed={isAdmin}
                    aria-current={isAdmin ? 'true' : undefined}
                    className={`${baseBtn} ${
                        isAdmin ? 'bg-primary text-primary-foreground shadow-soft' : 'cursor-pointer text-muted-foreground hover:bg-surface hover:text-foreground'
                    }`}
                    title="Basculer en Admin"
                >
                    <Shield className="h-4 w-4" aria-hidden />
                    Admin
                </button>
            </div>

            {/* MODALE d’avertissement (plein écran) */}
            <FullscreenModal open={open} onClose={() => setOpen(false)} title="Donner les droits administrateur" closeOnBackdrop={true} closeOnEsc={true}>
                <div className="space-y-3">
                    <p className="text-sm text-foreground">
                        Vous êtes sur le point d’accorder les <strong>droits administrateur</strong> à cet utilisateur.
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
                        <li>Accès complet à l’interface d’administration.</li>
                        <li>Peut modifier/supprimer des contenus et des comptes.</li>
                        <li>Les actions sont potentiellement destructrices.</li>
                    </ul>
                    <p className="text-sm text-foreground">
                        Confirmez-vous l’élévation de rôle vers <strong>Admin</strong> ?
                    </p>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2">
                    <button type="button" className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30" onClick={() => setOpen(false)}>
                        Annuler
                    </button>
                    <button
                        type="button"
                        className="rounded-xl bg-warning px-3 py-2 text-sm font-semibold text-warning-foreground hover:bg-warning/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                        onClick={() => {
                            setOpen(false);
                            submitWithRole(pendingRole); // => 'admin'
                        }}
                    >
                        Confirmer
                    </button>
                </div>
            </FullscreenModal>
        </>
    );
}
