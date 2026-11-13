import 'server-only';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/server/auth/authz';
import { getAdminProgramEditData } from '@/server/administration/programmes.service';
import { UpdateSuccessModal } from '../components';
import { EditProgramForm, type EditProgramFormShape } from './components';

export async function ModifierProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
    await requireAdmin();

    const { slug } = await params;
    const data = await getAdminProgramEditData(slug);
    if (!data) return notFound();

    const { programSlug } = data;
    const initial = data.initial as EditProgramFormShape;

    return (
        <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-border bg-gradient-to-br from-primary/14 via-surface to-accent/10 p-5 shadow-soft md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <nav className="text-xs text-muted-foreground">
                            <Link href="/administration" className="hover:underline">
                                Admin
                            </Link>
                            <span className="px-1.5">›</span>
                            <Link href="/administration/programmes" className="hover:underline">
                                Programmes
                            </Link>
                            <span className="px-1.5">›</span>
                            <span className="text-foreground">{programSlug}</span>
                        </nav>
                        <h1 className="mt-2 font-serif text-2xl font-semibold text-foreground md:text-3xl">Éditer une formation</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Identité • Marketing • Pédagogie • SEO</p>
                    </div>
                    <Link href="/administration/programmes" className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground motion-safe:transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                        Retour liste
                    </Link>
                </div>
            </div>

            <UpdateSuccessModal />
            <EditProgramForm initialData={initial} />
        </div>
    );
}
