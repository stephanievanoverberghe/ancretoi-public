// src/features/administration/articles/nouveau/NouvelArticlePage.tsx
import 'server-only';

import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { administrationRoutes, publicRoutes, routeBuilders } from '@/config/routes';
import { createAdminArticle, getNewArticleCategories } from '@/server/administration/articles.service';
import { AdminServerActionStatus, AdminServerSubmitButton } from '../../shared/AdminServerActionFormControls';
import { ArticleEditorMediaPreview } from '../components/ArticleEditorMediaPreview';
import SlugPreview from './components/SlugPreview';

/* ================= Server Action ================= */
async function createPostAction(formData: FormData) {
    'use server';

    const { slug } = await createAdminArticle(formData);

    // Revalidate Admin + Public
    revalidatePath(administrationRoutes.articles);
    revalidatePath(publicRoutes.blog);
    revalidatePath(routeBuilders.article(slug), 'page');

    redirect(administrationRoutes.articles);
}

/* ================= Page ================= */
export async function NouvelArticlePage() {
    const categories = await getNewArticleCategories();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-[1.75rem] border border-border bg-gradient-to-br from-primary/14 via-surface to-accent/10 p-5 shadow-soft md:p-7">
                <div className="text-xs text-muted-foreground">
                    <Link href={administrationRoutes.articles} className="hover:underline">
                        Admin
                    </Link>
                    <span className="px-1.5">›</span>
                    <Link href={administrationRoutes.articles} className="hover:underline">
                        Articles
                    </Link>
                    <span className="px-1.5">›</span>
                    <span className="text-foreground">Nouveau</span>
                </div>
                <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Nouvel article</h1>
                <p className="text-sm text-muted-foreground mt-1">Billet complet avec tags, catégorie, SEO, couverture locale et options de publication.</p>
            </div>

            {/* Form */}
            <form
                action={createPostAction}
                className="space-y-5 rounded-2xl border border-border bg-surface p-4 pb-24 shadow-soft sm:pb-5 md:p-6 [&_input]:border-input [&_input]:bg-background [&_input]:text-foreground [&_select]:border-input [&_select]:bg-background [&_select]:text-foreground [&_textarea]:border-input [&_textarea]:bg-background [&_textarea]:text-foreground"
            >
                <div className="sticky top-16 z-30 -mx-1 flex flex-col gap-2 rounded-2xl border border-border bg-surface/95 px-3 py-3 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                    <nav aria-label="Sections de l’article" className="flex min-w-0 items-center gap-1 overflow-x-auto text-xs">
                        <a href="#identite" className="rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">Identité</a>
                        <a href="#contenu" className="rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">Contenu</a>
                        <a href="#seo" className="rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">SEO</a>
                        <a href="#publication" className="rounded-lg px-2.5 py-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground">Publication</a>
                    </nav>
                    <div className="flex shrink-0 items-center justify-between gap-2">
                        <AdminServerActionStatus />
                        <AdminServerSubmitButton idleLabel="Créer" pendingLabel="Création…" className="hidden sm:inline-flex" />
                    </div>
                </div>
                {/* Ligne 1 : Titre / Slug / Aperçu */}
                <div id="identite" className="grid scroll-mt-36 gap-4 md:grid-cols-[2fr,1fr,auto]">
                    <label className="block">
                        <div className="mb-1 text-sm text-muted-foreground">Titre *</div>
                        <input name="title" placeholder="Titre de l’article" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required />
                    </label>
                    <label className="block">
                        <div className="mb-1 text-sm text-muted-foreground">Slug (auto si vide)</div>
                        <input name="slug" placeholder="ex: mon-bel-article" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    </label>
                    <div className="flex items-end">
                        <SlugPreview />
                    </div>
                </div>

                {/* Ligne 2 : Catégorie / Tags */}
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                        <div className="mb-1 text-sm text-muted-foreground">Catégorie</div>
                        <select name="category" defaultValue="" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                            <option value="">(Aucune)</option>
                            {categories.map((c) => (
                                <option key={c.slug} value={c.slug}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Le <strong>slug</strong> sélectionné est résolu en <em>categoryId</em> à l’enregistrement.
                        </p>
                    </label>
                    <label className="block">
                        <div className="mb-1 text-sm text-muted-foreground">Tags (séparés par virgules ou lignes)</div>
                        <textarea name="tags" placeholder="nextjs, poésie, performance" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm h-20" />
                    </label>
                </div>

                {/* Ligne 3 : Couverture locale */}
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                        <div className="mb-1 text-sm text-muted-foreground">Image de couverture (chemin local)</div>
                        <input name="coverPath" placeholder="/images/blog/mon-article/cover.jpg" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Le fichier doit exister dans <code>/public</code> (chemin commençant par <code>/</code>).
                        </p>
                    </label>
                    <label className="block">
                        <div className="mb-1 text-sm text-muted-foreground">Texte alternatif (accessibilité)</div>
                        <input name="coverAlt" placeholder="Brève description de l’image" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    </label>
                </div>

                <ArticleEditorMediaPreview />

                {/* Résumé */}
                <label className="block">
                    <div className="mb-1 text-sm text-muted-foreground">Résumé (chapeau)</div>
                    <textarea name="summary" placeholder="Quelques lignes d’intro…" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm h-24" />
                </label>

                {/* Contenu */}
                <label id="contenu" className="block scroll-mt-36">
                    <div className="mb-1 text-sm text-muted-foreground">Contenu (Markdown/texte)</div>
                    <textarea name="content" placeholder={`# Titre\n\nTon contenu…`} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm h-72 font-mono" />
                </label>

                {/* SEO */}
                <fieldset id="seo" className="grid scroll-mt-36 gap-4 rounded-xl border border-border bg-surface-muted/40 p-4 md:grid-cols-3">
                    <legend className="text-sm font-medium px-1">SEO</legend>
                    <label className="block">
                        <div className="mb-1 text-xs text-muted-foreground">SEO Title</div>
                        <input name="seoTitle" placeholder="Titre SEO (sinon repris du Titre)" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    </label>
                    <label className="block md:col-span-2">
                        <div className="mb-1 text-xs text-muted-foreground">SEO Description</div>
                        <input
                            name="seoDescription"
                            placeholder="150–160 caractères (sinon repris du Résumé)"
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        />
                    </label>
                    <label className="block md:col-span-3">
                        <div className="mb-1 text-xs text-muted-foreground">Canonical URL (optionnel)</div>
                        <input name="canonicalUrl" placeholder="https://exemple.com/mon-article" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    </label>
                </fieldset>

                {/* Publication */}
                <div id="publication" className="grid scroll-mt-36 items-end gap-4 md:grid-cols-[1fr,1fr,auto]">
                    <label className="block">
                        <div className="mb-1 text-sm text-muted-foreground">Statut</div>
                        <select name="status" defaultValue="draft" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                            <option value="draft">Brouillon</option>
                            <option value="published">Publié</option>
                        </select>
                    </label>

                    <label className="block">
                        <div className="mb-1 text-sm text-muted-foreground">Date de publication (si publié)</div>
                        <input type="datetime-local" name="publishedAt" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    </label>

                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" name="isFeatured" />
                        <span className="text-sm">Mettre en avant</span>
                    </label>
                </div>

                {/* Actions */}
                <div className="hidden items-center justify-end gap-2 sm:flex">
                    <Link href={administrationRoutes.articles} className="rounded-lg border px-3 py-2 text-sm hover:bg-brand-50">
                        Annuler
                    </Link>
                    <AdminServerSubmitButton idleLabel="Créer" pendingLabel="Création…" />
                </div>

                <AdminServerSubmitButton
                    idleLabel="Créer"
                    pendingLabel="Création…"
                    className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-4 right-4 z-40 py-3 shadow-elevated sm:hidden"
                />
            </form>
        </div>
    );
}
