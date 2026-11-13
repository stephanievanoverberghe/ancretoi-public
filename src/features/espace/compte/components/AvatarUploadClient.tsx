'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ImageUp, Save } from 'lucide-react';

import { Alert, Button, Input } from '@/components/ui';

export default function AvatarUploadClient({ initialAvatarUrl, initialName }: { initialAvatarUrl: string | null; initialName: string }) {
    const router = useRouter();
    const [preview, setPreview] = useState<string | null>(initialAvatarUrl);
    const [name, setName] = useState(initialName);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const lastObjectUrlRef = useRef<string | null>(null);

    useEffect(() => {
        return () => {
            if (lastObjectUrlRef.current) URL.revokeObjectURL(lastObjectUrlRef.current);
        };
    }, []);

    function pickFile() {
        inputRef.current?.click();
    }

    function updateFile(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            setError('Fichier trop lourd. Choisis une image de 1 Mo maximum.');
            event.target.value = '';
            return;
        }

        const nextUrl = URL.createObjectURL(file);
        if (lastObjectUrlRef.current) URL.revokeObjectURL(lastObjectUrlRef.current);
        lastObjectUrlRef.current = nextUrl;
        setPreview(nextUrl);
        setMessage(null);
        setError(null);
    }

    async function save(event: React.FormEvent) {
        event.preventDefault();

        const form = new FormData();
        const file = inputRef.current?.files?.[0] ?? null;
        if (file) form.append('avatar', file);
        form.append('name', name);

        setBusy(true);
        setMessage(null);
        setError(null);

        try {
            const response = await fetch('/api/settings/avatar', { method: 'POST', body: form });
            const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; avatarUrl?: string | null } | null;
            if (!response.ok || !data?.ok) throw new Error(data?.error || 'Mise à jour impossible.');

            if (typeof data.avatarUrl !== 'undefined') {
                if (lastObjectUrlRef.current) {
                    URL.revokeObjectURL(lastObjectUrlRef.current);
                    lastObjectUrlRef.current = null;
                }
                setPreview(data.avatarUrl ?? null);
            }

            setMessage('Profil mis à jour.');
            router.refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Erreur inconnue.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <form onSubmit={save} className="grid gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative h-20 w-20 overflow-hidden rounded-3xl border border-border bg-surface-muted">
                    {preview ? (
                        <Image src={preview} alt="" fill className="object-cover" unoptimized />
                    ) : (
                        <div className="grid h-full w-full place-items-center text-lg font-semibold text-muted-foreground">
                            {(name || 'AT').slice(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="grid gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={pickFile} leftIcon={<ImageUp className="h-4 w-4" />}>
                        {preview ? 'Changer l’avatar' : 'Ajouter un avatar'}
                    </Button>
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={updateFile} />
                    <p className="text-xs text-muted-foreground">PNG ou JPG, 1 Mo maximum.</p>
                </div>
            </div>

            <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Nom affiché</span>
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ton prénom" autoComplete="name" />
            </label>

            {message ? <Alert variant="success">{message}</Alert> : null}
            {error ? <Alert variant="danger">{error}</Alert> : null}

            <Button type="submit" loading={busy} loadingLabel="Enregistrement" disabled={busy} leftIcon={<Save className="h-4 w-4" />}>
                Enregistrer le profil
            </Button>
        </form>
    );
}
