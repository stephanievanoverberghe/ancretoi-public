import 'server-only';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

import { getAdminInspirationEditData, updateAdminInspiration } from '@/server/administration/inspirations.service';
import { AdminServerActionStatus, AdminServerSubmitButton } from '../../shared/AdminServerActionFormControls';
import { DeleteInspirationButton } from '@/features/administration/inspirations/components';
import { InspirationEditorMediaPreview } from '../components/InspirationEditorMediaPreview';

const toIso = (d?: string | Date | null) => (d ? new Date(d).toLocaleString('fr-FR') : '—');

/* ---------- Actions serveur ---------- */
async function updateInspiration(formData: FormData) {
    'use server';
    const updated = await updateAdminInspiration(formData);

    revalidatePath('/administration/inspirations');
    revalidatePath('/inspirations');
    revalidatePath(`/inspirations/${updated.slug}`, 'page');

    if (updated.renamed) {
        redirect(`/administration/inspirations/${updated.slug}/modifier?renamed=1`);
    }
}

/* ---------- Page ---------- */
export async function ModifierInspirationPage(props: { params: Promise<{ slug: string }> }) {
    const { slug } = await props.params;
    const doc = await getAdminInspirationEditData(slug);

    if (!doc) notFound();

    const tagsCsv = (Array.isArray(doc.tags) ? doc.tags : []).join(', ');

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
                            <Link href="/administration/inspirations" className="hover:underline">
                                Inspirations
                            </Link>
                            <span className="px-1.5">›</span>
                            <span className="text-foreground">Éditer</span>
                        </div>
                        <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{doc.title || 'Sans titre'}</h1>
                        <p className="text-sm text-muted-foreground mt-1">/{doc.slug}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/administration/inspirations" className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted">
                            Retour liste
                        </Link>
                        {doc.status === 'published' ? (
                            <Link href={`/inspirations/${doc.slug}`} className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover" target="_blank">
                                Ouvrir public
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Form */}
            <form
                action={updateInspiration}
                className="grid grid-cols-1 gap-6 pb-24 md:grid-cols-2 md:pb-0 [&_input]:!border-input [&_input]:!bg-background [&_input]:!text-foreground [&_section]:!border-border [&_section]:!bg-surface [&_textarea]:!border-input [&_textarea]:!bg-background [&_textarea]:!text-foreground"
            >
                <div className="sticky top-16 z-30 flex flex-col gap-2 rounded-2xl border border-border bg-surface/95 px-3 py-3 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between md:col-span-2">
                    <nav aria-label="Sections de l’inspiration" className="flex min-w-0 items-center gap-1 overflow-x-auto text-xs">
                        <a href="#identite" className="rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">Identité</a>
                        <a href="#media" className="rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">Média</a>
                    </nav>
                    <div className="flex shrink-0 items-center justify-between gap-2">
                        <AdminServerActionStatus />
                        <AdminServerSubmitButton idleLabel="Sauvegarder" className="hidden sm:inline-flex" />
                    </div>
                </div>
                {/* Identité */}
                <section id="identite" className="scroll-mt-36 rounded-2xl border border-border bg-surface p-5 ring-1 ring-border/50 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-semibold">Identité</h2>
                        <span className="text-xs text-muted-foreground">Obligatoire</span>
                    </div>

                    <input type="hidden" name="id" defaultValue={String(doc._id)} />
                    <input type="hidden" name="origSlug" defaultValue={doc.slug} />

                    <div className="grid gap-4">
                        <label className="block">
                            <div className="text-sm text-muted-foreground mb-1">Titre *</div>
                            <input
                                name="title"
                                defaultValue={doc.title ?? ''}
                                placeholder="Ex. RAIN — Accueillir l’émotion"
                                className="w-full rounded-xl border border-input bg-background px-3 py-2"
                                required
                            />
                        </label>

                        <label className="block">
                            <div className="text-sm text-muted-foreground mb-1">Slug</div>
                            <input name="slug" defaultValue={doc.slug} placeholder="auto si vide" className="w-full rounded-xl border border-input bg-background px-3 py-2" />
                            <p className="mt-1 text-[11px] text-muted-foreground">Si vide, généré depuis le titre.</p>
                        </label>

                        <fieldset className="block">
                            <div className="text-sm text-muted-foreground mb-1">Statut</div>
                            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface-muted">
                                {(['draft', 'published'] as const).map((v) => (
                                    <label key={v} className="relative">
                                        <input type="radio" name="status" value={v} defaultChecked={doc.status === v} className="peer absolute inset-0 h-0 w-0 opacity-0" />
                                        <div className="cursor-pointer select-none px-3 py-2 text-center text-sm text-foreground peer-checked:bg-surface peer-checked:text-primary peer-checked:shadow-inner">
                                            {v === 'draft' ? 'Brouillon' : 'Publié'}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    </div>
                </section>

                {/* Vidéo & contenu */}
                <section id="media" className="scroll-mt-36 rounded-2xl border border-border bg-surface p-5 ring-1 ring-border/50 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-semibold">Vidéo & contenu</h2>
                        <span className="text-xs text-muted-foreground">Obligatoire / Recommandé</span>
                    </div>

                    <div className="grid gap-4">
                        <label className="block">
                            <div className="text-sm text-muted-foreground mb-1">URL vidéo *</div>
                            <input
                                name="videoUrl"
                                defaultValue={doc.videoUrl ?? ''}
                                placeholder="YouTube/Vimeo/MP4"
                                className="w-full rounded-xl border border-input bg-background px-3 py-2"
                                required
                            />
                            <p className="mt-1 text-[11px] text-muted-foreground">Les miniatures auto fonctionnent pour YouTube.</p>
                        </label>

                        <InspirationEditorMediaPreview initialTitle={doc.title} initialVideoUrl={doc.videoUrl} />

                        <label className="block">
                            <div className="text-sm text-muted-foreground mb-1">Résumé</div>
                            <textarea
                                name="summary"
                                defaultValue={doc.summary ?? ''}
                                placeholder="2–3 phrases max (optionnel)"
                                className="w-full rounded-xl border border-input bg-background px-3 py-2 h-28"
                            />
                        </label>

                        <label className="block">
                            <div className="text-sm text-muted-foreground mb-1">Tags</div>
                            <input
                                name="tags"
                                defaultValue={tagsCsv}
                                placeholder="respiration, RAIN, limites"
                                className="w-full rounded-xl border border-input bg-background px-3 py-2"
                            />
                        </label>
                    </div>
                </section>

                {/* Méta / actions */}
                <section className="rounded-2xl border border-border bg-surface p-5 ring-1 ring-border/50 shadow-sm md:col-span-2">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                            <div>Créé : {toIso(doc.createdAt)}</div>
                            <div>MAJ : {toIso(doc.updatedAt)}</div>
                            <div>Publié : {toIso(doc.publishedAt)}</div>
                            {doc.curatorEmail ? <div>Par : {doc.curatorEmail}</div> : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <AdminServerSubmitButton idleLabel="Sauvegarder" className="hidden sm:inline-flex" />

                            {/* ⬇️ ICI : le bouton avec modale */}
                            <DeleteInspirationButton slug={doc.slug} afterDelete="redirect" redirectTo="/administration/inspirations" />
                        </div>
                    </div>
                </section>

                <AdminServerSubmitButton
                    idleLabel="Sauvegarder"
                    className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-4 right-4 z-40 py-3 shadow-elevated sm:hidden"
                />
            </form>
        </div>
    );
}
