'use client';

import Image from 'next/image';
import { Tag } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAdminFormFieldValues } from '../../shared/AdminServerActionFormControls';

type CategoryEditorPreviewProps = {
    initialName: string;
    initialSlug: string;
    initialDescription?: string | null;
    initialColor?: string | null;
    initialImagePath?: string | null;
    initialImageAlt?: string | null;
    createdLabel: string;
    updatedLabel: string;
};

function isLocalPublicPath(value: string): boolean {
    return value.startsWith('/') && !value.startsWith('//');
}

function getSafeColor(value: string): string | null {
    const color = value.trim();
    if (!color) return null;
    if (/^#[0-9a-f]{3,8}$/i.test(color)) return color;
    if (/^(?:rgb|hsl)a?\([0-9,.%\s+-]+\)$/i.test(color)) return color;
    if (/^[a-z]+$/i.test(color)) return color;
    return null;
}

export function CategoryEditorPreview({
    initialName,
    initialSlug,
    initialDescription,
    initialColor,
    initialImagePath,
    initialImageAlt,
    createdLabel,
    updatedLabel,
}: CategoryEditorPreviewProps) {
    const { markerRef, values } = useAdminFormFieldValues(['name', 'slug', 'description', 'color', 'imagePath', 'imageAlt'], {
        name: initialName,
        slug: initialSlug,
        description: initialDescription ?? '',
        color: initialColor ?? '',
        imagePath: initialImagePath ?? '',
        imageAlt: initialImageAlt ?? '',
    });
    const [imageFailed, setImageFailed] = useState(false);
    const imagePath = values.imagePath.trim();
    const color = getSafeColor(values.color);
    const hasUsableImage = isLocalPublicPath(imagePath) && !imageFailed;

    useEffect(() => setImageFailed(false), [imagePath]);

    return (
        <aside ref={markerRef} id="apercu" className="scroll-mt-36 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft" aria-label="Aperçu immédiat de la catégorie">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-muted">
                {hasUsableImage ? (
                    <Image
                        src={imagePath}
                        alt={values.imageAlt.trim()}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 34rem"
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <div
                        className="absolute inset-0"
                        style={{ background: color ? `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 55%, black))` : 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                    />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4 text-white">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-background/20 backdrop-blur">
                        <Tag className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h3 className="truncate font-display text-xl font-semibold">{values.name.trim() || 'Nom de la catégorie'}</h3>
                        <p className="truncate text-xs text-white/75">/{values.slug.trim() || 'slug'}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3 p-4">
                {values.description.trim() ? <p className="line-clamp-3 text-sm text-muted-foreground">{values.description.trim()}</p> : <p className="text-sm text-muted-foreground">Ajoute une description pour préciser l’usage de la catégorie.</p>}

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-surface-muted p-3">
                        <div className="text-muted-foreground">Créée</div>
                        <div className="mt-1 font-medium text-foreground">{createdLabel}</div>
                    </div>
                    <div className="rounded-xl bg-surface-muted p-3">
                        <div className="text-muted-foreground">Mise à jour</div>
                        <div className="mt-1 font-medium text-foreground">{updatedLabel}</div>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground">
                    {imagePath && !isLocalPublicPath(imagePath)
                        ? 'Le chemin image doit commencer par /.'
                        : imageFailed
                          ? 'Image introuvable : la couleur de fallback est utilisée.'
                          : color
                            ? `Couleur : ${values.color.trim()}`
                            : 'Fallback basé sur le thème de l’administration.'}
                </p>
            </div>
        </aside>
    );
}
