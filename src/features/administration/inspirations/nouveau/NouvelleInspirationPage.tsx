import 'server-only';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { createAdminInspiration } from '@/server/administration/inspirations.service';
import { AdminServerActionStatus, AdminServerSubmitButton } from '../../shared/AdminServerActionFormControls';
import { InspirationEditorMediaPreview } from '../components/InspirationEditorMediaPreview';
import SlugPreview from './components/SlugPreview';

/* ======================= Page ======================= */
export async function NouvelleInspirationPage() {
    async function createInspiration(formData: FormData) {
        'use server';
        const created = await createAdminInspiration(formData);

        // Redirige vers l’édition
        redirect(`/administration/inspirations/${created.slug}/modifier`);
    }

    /* ======================= UI ======================= */
    return (
        <div className="space-y-6">
            {/* ===== Header / Breadcrumb ===== */}
            <div className="rounded-[1.75rem] border border-border bg-gradient-to-br from-primary/14 via-surface to-accent/10 p-5 shadow-soft md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <nav className="text-xs text-muted-foreground">
                            <Link href="/administration" className="hover:underline">
                                Admin
                            </Link>
                            <span className="px-1.5">›</span>
                            <Link href="/administration/inspirations" className="hover:underline">
                                Inspirations
                            </Link>
                            <span className="px-1.5">›</span>
                            <span className="text-foreground">Nouvelle</span>
                        </nav>
                        <h1 className="mt-2 font-serif text-2xl font-semibold text-foreground md:text-3xl">Nouvelle inspiration</h1>
                        <p className="text-sm text-muted-foreground mt-1">Ajoute une vidéo (YouTube/Vimeo/MP4), son résumé, les tags et le statut.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/administration/inspirations" className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted">
                            Retour liste
                        </Link>
                    </div>
                </div>
            </div>

            {/* ===== Form ===== */}
            <form
                action={createInspiration}
                className="relative pb-24 md:pb-0 [&_input]:!border-input [&_input]:!bg-background [&_input]:!text-foreground [&_section]:!border-border [&_section]:!bg-surface [&_select]:!border-input [&_select]:!bg-background [&_textarea]:!border-input [&_textarea]:!bg-background [&_textarea]:!text-foreground"
            >
                {/* CTA sticky mobile */}
                <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-4 right-4 z-40 md:hidden">
                    <AdminServerSubmitButton idleLabel="Créer l’inspiration" pendingLabel="Création…" className="w-full py-3 shadow-elevated" />
                </div>

                <div className="sticky top-16 z-30 mb-6 flex flex-col gap-2 rounded-2xl border border-border bg-surface/95 px-3 py-3 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                    <nav aria-label="Sections de l’inspiration" className="flex min-w-0 items-center gap-1 overflow-x-auto text-xs">
                        <a href="#identite" className="rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">Identité</a>
                        <a href="#media" className="rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">Média</a>
                        <a href="#contenu" className="rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">Contenu</a>
                    </nav>
                    <div className="flex shrink-0 items-center justify-between gap-2">
                        <AdminServerActionStatus />
                        <AdminServerSubmitButton idleLabel="Créer" pendingLabel="Création…" className="hidden md:inline-flex" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* ---- Card: Identité & Statut ---- */}
                    <section id="identite" className="scroll-mt-36 rounded-2xl border border-border bg-surface p-5 ring-1 ring-border/50 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-foreground">Identité</h2>
                            <span className="text-xs text-muted-foreground">Obligatoire</span>
                        </div>

                        <div className="grid gap-4">
                            <label className="block">
                                <div className="text-sm text-muted-foreground mb-1">Titre *</div>
                                <input name="title" placeholder="RAIN — Accueillir l’émotion" className="w-full rounded-xl border border-input bg-background px-3 py-2" required />
                                <p className="mt-1 text-[11px] text-muted-foreground">Affiché dans la liste et la page publique.</p>
                            </label>

                            <label className="block">
                                <div className="text-sm text-muted-foreground mb-1">Slug</div>
                                <input name="slug" placeholder="auto si vide" className="w-full rounded-xl border border-input bg-background px-3 py-2" />
                                <p className="mt-1 text-[11px] text-muted-foreground">Généré depuis le titre si laissé vide (kebab-case).</p>
                            </label>

                            <fieldset className="block">
                                <div className="text-sm text-muted-foreground mb-1">Statut</div>
                                <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface-muted">
                                    {(
                                        [
                                            { v: 'draft', label: 'Brouillon' },
                                            { v: 'published', label: 'Publié' },
                                        ] as const
                                    ).map((opt) => (
                                        <label key={opt.v} className="relative">
                                            <input
                                                type="radio"
                                                name="status"
                                                value={opt.v}
                                                defaultChecked={opt.v === 'draft'}
                                                className="peer absolute inset-0 h-0 w-0 opacity-0"
                                            />
                                            <div className="cursor-pointer select-none px-3 py-2 text-center text-sm text-foreground peer-checked:bg-surface peer-checked:text-primary peer-checked:shadow-inner">
                                                {opt.label}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <div className="pt-1">
                                <SlugPreview />
                            </div>
                        </div>
                    </section>

                    {/* ---- Card: Média ---- */}
                    <section id="media" className="scroll-mt-36 rounded-2xl border border-border bg-surface p-5 ring-1 ring-border/50 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-foreground">Média</h2>
                            <span className="text-xs text-muted-foreground">Obligatoire</span>
                        </div>

                        <div className="grid gap-4">
                            <label className="block">
                                <div className="text-sm text-muted-foreground mb-1">URL vidéo *</div>
                                <input
                                    name="videoUrl"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full rounded-xl border border-input bg-background px-3 py-2"
                                    required
                                />
                                <p className="mt-1 text-[11px] text-muted-foreground">YouTube, Vimeo, ou MP4 accessible publiquement (URL complète).</p>
                            </label>

                            <div className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-[12px] text-foreground">
                                Astuce : pour YouTube, la miniature sera auto-déduite côté “Liste”.
                            </div>

                            <InspirationEditorMediaPreview />
                        </div>
                    </section>

                    {/* ---- Card: Contenu ---- */}
                    <section id="contenu" className="order-1 scroll-mt-36 rounded-2xl border border-border bg-surface p-5 ring-1 ring-border/50 shadow-sm md:order-2 md:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-foreground">Contenu</h2>
                            <span className="text-xs text-muted-foreground">Recommandé</span>
                        </div>

                        <div className="grid gap-4">
                            <label className="block">
                                <div className="text-sm text-muted-foreground mb-1">Résumé</div>
                                <textarea name="summary" placeholder="2–3 phrases max (optionnel)" className="w-full rounded-xl border border-input bg-background px-3 py-2 h-28" />
                                <p className="mt-1 text-[11px] text-muted-foreground">Utilisé en meta/preview et en Quick View.</p>
                            </label>

                            <label className="block">
                                <div className="text-sm text-muted-foreground mb-1">Tags (séparés par des virgules)</div>
                                <input name="tags" placeholder="respiration, RAIN, limites" className="w-full rounded-xl border border-input bg-background px-3 py-2" />
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Ex : <code>bien-être, grounding, souffle</code>
                                </p>
                            </label>
                        </div>
                    </section>
                </div>

                {/* Desktop Submit */}
                <div className="hidden" />
            </form>
        </div>
    );
}
