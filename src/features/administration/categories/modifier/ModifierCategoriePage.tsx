// src/features/administration/categories/modifier/ModifierCategoriePage.tsx
import 'server-only';

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { deleteAdminCategory, getAdminCategoryEditData, updateAdminCategory } from '@/server/administration/categories.service';

import { AdminServerActionStatus, AdminServerSubmitButton } from '../../shared/AdminServerActionFormControls';
import { DeleteCategoryButton } from '../components';
import { CategoryEditorPreview } from './CategoryEditorPreview';

const fmtDate = (d?: string | Date | null) => (d ? new Date(d).toLocaleString('fr-FR') : '—');

/* =========================
   Actions serveur
   ========================= */
async function updateCategory(formData: FormData) {
    'use server';
    const updated = await updateAdminCategory(formData);

    // Revalidate zones qui consomment les catégories
    revalidatePath('/administration/categories');
    revalidatePath('/administration/articles');
    revalidatePath('/administration/articles/nouveau');
    revalidatePath('/administration/categories/nouveau');

    if (updated.renamed) {
        redirect(`/administration/categories/${updated.slug}/modifier?renamed=1`);
    }
}

async function deleteCategory(formData: FormData) {
    'use server';
    await deleteAdminCategory(formData);

    // Revalidate + retour liste
    revalidatePath('/administration/categories');
    revalidatePath('/administration/articles');

    redirect('/administration/categories?deleted=1');
}

/* =========================
   Page
   ========================= */
export async function ModifierCategoriePage(props: { params: Promise<{ slug: string }> }) {
    const { slug } = await props.params;
    const doc = await getAdminCategoryEditData(slug);

    if (!doc) notFound();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-[1.75rem] border border-border bg-gradient-to-br from-primary/14 via-surface to-accent/10 p-5 shadow-soft md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">
                            <Link href="/administration" className="hover:underline">
                                Admin
                            </Link>
                            <span className="px-1.5">›</span>
                            <Link href="/administration/categories" className="hover:underline">
                                Catégories
                            </Link>
                            <span className="px-1.5">›</span>
                            <span className="text-foreground">Éditer</span>
                        </div>
                        <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{doc.name}</h1>
                        <p className="text-sm text-muted-foreground mt-1">/{doc.slug}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/administration/categories" className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted">
                            Retour liste
                        </Link>
                    </div>
                </div>
            </div>

            {/* Form edition + Preview côte à côte */}
            <form
                action={updateCategory}
                className="grid gap-5 pb-24 sm:pb-0 lg:grid-cols-[1.15fr,0.85fr] [&_input]:!border-input [&_input]:!bg-background [&_input]:!text-foreground [&_textarea]:!border-input [&_textarea]:!bg-background [&_textarea]:!text-foreground"
            >
                <div className="sticky top-16 z-30 flex flex-col gap-2 rounded-2xl border border-border bg-surface/95 px-3 py-3 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
                    <nav aria-label="Sections de la catégorie" className="flex min-w-0 items-center gap-1 overflow-x-auto text-xs">
                        <a href="#champs" className="rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">Champs</a>
                        <a href="#apercu" className="rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">Aperçu</a>
                    </nav>
                    <div className="flex shrink-0 items-center justify-between gap-2">
                        <AdminServerActionStatus />
                        <AdminServerSubmitButton idleLabel="Sauvegarder" className="hidden sm:inline-flex" />
                    </div>
                </div>
                {/* === Formulaire === */}
                <section id="champs" className="scroll-mt-36 space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-soft">
                    <input type="hidden" name="id" defaultValue={String(doc._id)} />
                    <input type="hidden" name="origSlug" defaultValue={doc.slug} />

                    <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                        <label className="block">
                            <div className="text-sm text-muted-foreground mb-1">Nom *</div>
                            <input name="name" defaultValue={doc.name} required className="w-full rounded-xl border bg-background px-3 py-2" placeholder="Ex : Émotions" />
                        </label>

                        <label className="block">
                            <div className="text-sm text-muted-foreground mb-1">Slug</div>
                            <input name="slug" defaultValue={doc.slug} className="w-full rounded-xl border bg-background px-3 py-2" placeholder="ex: emotions" />
                            <p className="mt-1 text-[11px] text-muted-foreground">Si vide, il sera régénéré depuis le nom.</p>
                        </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                            <div className="text-sm text-muted-foreground mb-1">Couleur (hex)</div>
                            <input name="color" defaultValue={doc.color ?? ''} className="w-full rounded-xl border bg-background px-3 py-2" placeholder="#9b87f5" />
                            <p className="mt-1 text-[11px] text-muted-foreground">Optionnel. Ex: #9b87f5</p>
                        </label>

                        <label className="block">
                            <div className="text-sm text-muted-foreground mb-1">Icône (nom Lucide/emoji)</div>
                            <input name="icon" defaultValue={doc.icon ?? ''} className="w-full rounded-xl border bg-background px-3 py-2" placeholder="sparkles" />
                            <p className="mt-1 text-[11px] text-muted-foreground">Optionnel (texte libre).</p>
                        </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                            <div className="text-sm text-muted-foreground mb-1">Image (chemin local /public)</div>
                            <input
                                name="imagePath"
                                defaultValue={doc.imagePath ?? ''}
                                className="w-full rounded-xl border bg-background px-3 py-2"
                                placeholder="/images/blog/categories/creation.jpg"
                            />
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Exemple: <code>/images/blog/categories/…</code> — pas d’URL externe.
                            </p>
                        </label>

                        <label className="block">
                            <div className="text-sm text-muted-foreground mb-1">Texte alternatif</div>
                            <input
                                name="imageAlt"
                                defaultValue={doc.imageAlt ?? ''}
                                className="w-full rounded-xl border bg-background px-3 py-2"
                                placeholder="Illustration de la catégorie Émotions"
                            />
                        </label>
                    </div>

                    <label className="block">
                        <div className="text-sm text-muted-foreground mb-1">Description</div>
                        <textarea
                            name="description"
                            defaultValue={doc.description}
                            className="w-full rounded-xl border bg-background px-3 py-2 h-28"
                            placeholder="À quoi sert cette catégorie…"
                        />
                    </label>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                            <div>Créé : {fmtDate(doc.createdAt)}</div>
                            <div>MAJ : {fmtDate(doc.updatedAt)}</div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <AdminServerSubmitButton idleLabel="Sauvegarder" className="hidden sm:inline-flex" />

                            {/* Suppression définitive (pas de form imbriqué) */}
                            <DeleteCategoryButton slug={doc.slug} afterDelete="redirect" redirectTo="/administration/categories" />
                        </div>
                    </div>
                </section>

                <CategoryEditorPreview
                    initialName={doc.name}
                    initialSlug={doc.slug}
                    initialDescription={doc.description}
                    initialColor={doc.color}
                    initialImagePath={doc.imagePath}
                    initialImageAlt={doc.imageAlt}
                    createdLabel={fmtDate(doc.createdAt)}
                    updatedLabel={fmtDate(doc.updatedAt)}
                />


                <AdminServerSubmitButton
                    idleLabel="Sauvegarder"
                    className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-4 right-4 z-40 py-3 shadow-elevated sm:hidden"
                />
            </form>

            {/* Danger zone : suppression via action serveur (optionnel si tu préfères DeleteCategoryButton) */}

            <form action={deleteCategory} className="hidden">
                <input type="hidden" name="id" defaultValue={String(doc._id)} />
            </form>
        </div>
    );
}
