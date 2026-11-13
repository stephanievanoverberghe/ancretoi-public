'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

import { Alert, Button } from '@/components/ui';

export default function DataExportClient() {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function run() {
        setBusy(true);
        setError(null);
        try {
            const response = await fetch('/api/settings/export', { method: 'POST' });
            if (!response.ok) throw new Error('Export des paramètres impossible.');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'ancre-toi-parametres.json';
            link.click();
            URL.revokeObjectURL(url);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Erreur inconnue.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="grid gap-3">
            <p className="text-sm leading-relaxed text-muted-foreground">Télécharge un fichier JSON avec les réglages actuellement disponibles pour ton compte.</p>
            <Button type="button" variant="secondary" onClick={run} loading={busy} loadingLabel="Préparation de l’export" leftIcon={<Download className="h-4 w-4" />}>
                Exporter mes paramètres
            </Button>
            {error ? <Alert variant="danger">{error}</Alert> : null}
        </div>
    );
}
