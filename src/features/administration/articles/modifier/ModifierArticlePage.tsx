// src/features/administration/articles/modifier/ModifierArticlePage.tsx
import 'server-only';

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { getAdminArticleEditData, updateAdminArticle } from '@/server/administration/articles.service';
import { AdminServerActionStatus, AdminServerSubmitButton } from '../../shared/AdminServerActionFormControls';
import { DeletePostButton } from '../components';
import { ArticleEditorMediaPreview } from '../components/ArticleEditorMediaPreview';

const fmt = (d?: string | Date | null) => (d ? new Date(d).toLocaleString('fr-FR') : '—');

async function updatePost(formData: FormData) {
    'use server';
    const updated = await updateAdminArticle(formData);

    revalidatePath('/administration/articles');
    revalidatePath('/blog');
    revalidatePath(`/blog/${updated.slug}`, 'page');

    const origSlug = String(formData.get('origSlug') ?? '');
    if (origSlug && origSlug !== updated.slug) {
        redirect(`/administration/articles/${updated.slug}/modifier?renamed=1`);
    }
}

export async function ModifierArticlePage(props: { params: Promise<{ slug: string }> }) {
    const { slug } = await props.params;
    const data = await getAdminArticleEditData(slug);

    if (!data) notFound();

    const { doc, categories } = data;

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
                            <Link href="/administration/articles" className="hover:underline">
                                Articles
                            </Link>
                            <span className="px-1.5">›</span>
                            <span className="text-foreground">Éditer</span>
                        </div>
                        <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{doc.title || 'Sans titre'}</h1>
                        <p className="text-sm text-muted-foreground mt-1">/{doc.slug}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/administration/articles" className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted">
                            Retour liste
                        </Link>
                        {doc.status === 'published' ? (
                            <Link href={`/blog/${doc.slug}`} target="_blank" className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover">
                                Ouvrir public
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Form */}
            <form
                action={updatePost}
                className="space-y-5 rounded-2xl border border-border bg-surface p-4 pb-24 shadow-soft sm:pb-5 md:p-6 [&_input]:border-input [&_input]:bg-background [&_input]:text-foreground [&_select]:border-input [&_select]:bg-background [&_select]:text-foreground [&_textarea]:border-input [&_textarea]:bg-background [&_textarea]:text-foreground"
            >
                <input type="hidden" name="id" defaultValue={String(doc._id)} />
                <input type="hidden" name="origSlug" defaultValue={doc.slug} />

                <div className="sticky top-16 z-30 -mx-1 flex flex-col gap-2 rounded-2xl border border-border bg-surface/95 px-3 py-3 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                    <nav aria-label="Sections de l’article" className="flex min-w-0 items-center gap-1 overflow-x-auto text-xs">
                        <a href="#identite" className="rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">Identité</a>
                        <a href="#contenu" className="rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">Contenu</a>
                        <a href="#seo" className="rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">SEO</a>
                        <a href="#publication" className="rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">Publication</a>
                    </nav>
                    <div className="flex shrink-0 items-center justify-between gap-2">
                        <AdminServerActionStatus />
                        <AdminServerSubmitButton idleLabel="Sauvegarder" className="hidden sm:inline-flex" />
                    </div>
                </div>

                {/* Identité */}
                <section id="identite" className="grid scroll-mt-36 gap-4 md:grid-cols-[2fr,1fr]">
                    <label className="block">
                        <div className="text-sm text-muted-foreground mb-1">Titre *</div>
                        <input name="title" defaultValue={doc.title ?? ''} className="w-full rounded-xl border bg-background px-3 py-2" required />
                    </label>
                    <label className="block">
                        <div className="text-sm text-muted-foreground mb-1">Slug</div>
                        <input name="slug" defaultValue={doc.slug} className="w-full rounded-xl border bg-background px-3 py-2" />
                        <p className="mt-1 text-[11px] text-muted-foreground">Si vide, généré depuis le titre.</p>
                    </label>
                </section>

                {/* Catégorie & Tags */}
                <section className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                        <div className="text-sm text-muted-foreground mb-1">Catégorie</div>
                        <select name="category" defaultValue={doc.category ?? ''} className="w-full rounded-xl border bg-background px-3 py-2">
                            <option value="">(Aucune)</option>
                            {categories.map((c) => (
                                <option key={c.slug} value={c.slug}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Stockage du <strong>slug</strong> catégorie. Les anciennes valeurs libres ne sont plus proposées.
                        </p>
                    </label>
                    <label className="block">
                        <div className="text-sm text-muted-foreground mb-1">Tags</div>
                        <textarea name="tags" defaultValue={(doc.tags ?? []).join(', ')} className="w-full rounded-xl border bg-background px-3 py-2 h-20" />
                    </label>
                </section>

                {/* Cover */}
                <section className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                        <div className="text-sm text-muted-foreground mb-1">Image de couverture (chemin local)</div>
                        <input name="coverPath" defaultValue={doc.coverPath ?? ''} className="w-full rounded-xl border bg-background px-3 py-2" />
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Le fichier doit exister dans <code>/public</code>.
                        </p>
                    </label>
                    <label className="block">
                        <div className="text-sm text-muted-foreground mb-1">Texte alternatif</div>
                        <input name="coverAlt" defaultValue={doc.coverAlt ?? ''} className="w-full rounded-xl border bg-background px-3 py-2" />
                    </label>
                </section>

                <ArticleEditorMediaPreview initialTitle={doc.title} initialCoverPath={doc.coverPath} initialCoverAlt={doc.coverAlt} />

                {/* Résumé & Contenu */}
                <label className="block">
                    <div className="text-sm text-muted-foreground mb-1">Résumé</div>
                    <textarea name="summary" defaultValue={doc.summary ?? ''} className="w-full rounded-xl border bg-background px-3 py-2 h-24" />
                </label>
                <label id="contenu" className="block scroll-mt-36">
                    <div className="text-sm text-muted-foreground mb-1">Contenu (Markdown/texte)</div>
                    <textarea name="content" defaultValue={doc.content ?? ''} className="w-full rounded-xl border bg-background px-3 py-2 h-72 font-mono" />
                </label>

                {/* SEO */}
                <fieldset id="seo" className="grid scroll-mt-36 gap-4 rounded-xl border border-border bg-surface-muted/40 p-4 md:grid-cols-3">
                    <legend className="text-sm font-medium px-1">SEO</legend>
                    <label className="block">
                        <div className="mb-1 text-xs text-muted-foreground">SEO Title</div>
                        <input name="seoTitle" defaultValue={doc.seoTitle ?? ''} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                    </label>
                    <label className="block md:col-span-2">
                        <div className="mb-1 text-xs text-muted-foreground">SEO Description</div>
                        <input name="seoDescription" defaultValue={doc.seoDescription ?? ''} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                    </label>
                    <label className="block md:col-span-3">
                        <div className="mb-1 text-xs text-muted-foreground">Canonical URL</div>
                        <input name="canonicalUrl" defaultValue={doc.canonicalUrl ?? ''} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                    </label>
                </fieldset>

                {/* Publication */}
                <section id="publication" className="grid scroll-mt-36 items-end gap-4 md:grid-cols-[1fr,1fr,auto]">
                    <fieldset className="block">
                        <div className="text-sm text-muted-foreground mb-1">Statut</div>
                        <div className="grid grid-cols-2 overflow-hidden rounded-xl border bg-surface-muted">
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

                    <label className="block">
                        <div className="text-sm text-muted-foreground mb-1">Date de publication (si publié)</div>
                        <input
                            type="datetime-local"
                            name="publishedAt"
                            defaultValue={doc.publishedAt ? new Date(doc.publishedAt).toISOString().slice(0, 16) : ''}
                            className="w-full rounded-xl border bg-background px-3 py-2"
                        />
                    </label>

                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" name="isFeatured" defaultChecked={!!doc.isFeatured} />
                        <span className="text-sm">Mettre en avant</span>
                    </label>
                </section>

                {/* Meta info + actions */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                        <div>Créé : {fmt(doc.createdAt)}</div>
                        <div>MAJ : {fmt(doc.updatedAt)}</div>
                        <div>Publié : {fmt(doc.publishedAt)}</div>
                        {doc.authorEmail ? <div>Auteur : {doc.authorEmail}</div> : null}
                        {doc.readingTimeMin ? <div>Lecture : ~{doc.readingTimeMin} min</div> : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <AdminServerSubmitButton idleLabel="Sauvegarder" className="hidden sm:inline-flex" />
                        <DeletePostButton slug={doc.slug} afterDelete="redirect" redirectTo="/administration/articles" />
                    </div>
                </div>

                <AdminServerSubmitButton
                    idleLabel="Sauvegarder"
                    className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-4 right-4 z-40 py-3 shadow-elevated sm:hidden"
                />
            </form>
        </div>
    );
}
