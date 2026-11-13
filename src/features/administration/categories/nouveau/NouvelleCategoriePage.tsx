// src/features/administration/categories/nouveau/NouvelleCategoriePage.tsx

import 'server-only';
import Link from 'next/link';
import { requireAdmin } from '@/server/auth/authz';
import { ensureAdminCategoriesReady } from '@/server/administration/categories.service';
import NewCategoryForm from './components/NewCategoryForm';

export async function NouvelleCategoriePage() {
    await requireAdmin();
    await ensureAdminCategoriesReady();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-[1.75rem] border border-border bg-gradient-to-br from-primary/14 via-surface to-accent/10 p-5 shadow-soft md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <nav className="text-xs text-muted-foreground">
                            <Link href="/administration" className="hover:underline">
                                Admin
                            </Link>
                            <span className="px-1.5">›</span>
                            <Link href="/administration/articles" className="hover:underline">
                                Blog
                            </Link>
                            <span className="px-1.5">›</span>
                            <Link href="/administration/categories" className="hover:underline">
                                Catégories
                            </Link>
                            <span className="px-1.5">›</span>
                            <span className="text-foreground">Nouveau</span>
                        </nav>
                        <h1 className="mt-2 font-serif text-2xl font-semibold text-foreground md:text-3xl">Créer une catégorie</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Nom • Slug • Couleur • Icône • Image • Alt • Description</p>
                    </div>
                    <Link href="/administration/categories" className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted">
                        Retour liste
                    </Link>
                </div>
            </div>

            <NewCategoryForm />
        </div>
    );
}
