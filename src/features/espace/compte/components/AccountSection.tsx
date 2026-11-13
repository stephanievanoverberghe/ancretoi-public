import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

type AccountSectionProps = {
    icon: ReactNode;
    title: string;
    description: string;
    children: ReactNode;
};

/**
 * Section visuelle standard de la page compte.
 * Elle garde une hiérarchie constante entre profil, sécurité, préférences et données.
 */
export function AccountSection({ icon, title, description, children }: AccountSectionProps) {
    return (
        <Card className="min-w-0 overflow-hidden rounded-3xl">
            <CardHeader className="p-6 pb-3 sm:p-7 sm:pb-3">
                <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-border bg-surface-muted text-primary">{icon}</span>
                    <div className="min-w-0">
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid gap-5 p-6 pt-3 sm:p-7 sm:pt-3">{children}</CardContent>
        </Card>
    );
}
