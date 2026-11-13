'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import { Alert, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui';
import { FullscreenModal } from '@/components/ui/overlays';
import { publicRoutes } from '@/config/routes';

export default function DangerZoneClient({ email }: { email: string }) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function deleteAccount() {
        if (value.trim() !== 'SUPPRIMER') return;
        setBusy(true);
        setError(null);
        try {
            const response = await fetch('/api/settings/delete-account', { method: 'POST' });
            const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
            if (!response.ok || !data?.ok) throw new Error(data?.error || 'Impossible de supprimer le compte.');
            window.location.href = publicRoutes.home;
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Erreur inconnue.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <Card className="border-danger/30 bg-danger/5">
            <CardHeader>
                <CardTitle className="text-danger">Zone à risque</CardTitle>
                <CardDescription>Suppression définitive du compte associé à {email}.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button type="button" variant="danger" onClick={() => setOpen(true)} leftIcon={<Trash2 className="h-4 w-4" />}>
                    Supprimer mon compte
                </Button>

                <FullscreenModal
                    open={open}
                    onClose={() => {
                        if (!busy) setOpen(false);
                    }}
                    title="Supprimer définitivement le compte ?"
                    footer={null}
                    zIndex={1200}
                >
                    <div className="grid gap-4">
                        <Alert variant="danger" title="Action irréversible">
                            Cette action supprimera l’accès au compte et les données d’apprentissage liées. Tape SUPPRIMER pour confirmer.
                        </Alert>
                        <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="SUPPRIMER" disabled={busy} />
                        {error ? <Alert variant="danger">{error}</Alert> : null}
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button type="button" variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
                                Annuler
                            </Button>
                            <Button type="button" variant="danger" loading={busy} disabled={value.trim() !== 'SUPPRIMER' || busy} onClick={deleteAccount}>
                                Confirmer la suppression
                            </Button>
                        </div>
                    </div>
                </FullscreenModal>
            </CardContent>
        </Card>
    );
}
