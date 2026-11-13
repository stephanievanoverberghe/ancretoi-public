import 'server-only';

import Image from 'next/image';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, BookOpenCheck, Clock3, LogIn, UserRound } from 'lucide-react';

import {
    archiveAdminLearner,
    getAdministrationApprenantDetailData,
    hardDeleteAdminLearner,
    restoreAdminLearner,
    setAdminLearnerRole,
    suspendAdminLearner,
    unsuspendAdminLearner,
} from '@/server/administration/apprenants.service';

import { AdminRoleSwitch, ConfirmAction, UserTabs } from '../components';

async function setRole(formData: FormData) {
    'use server';
    const { id } = await setAdminLearnerRole(formData);
    revalidatePath('/administration/apprenants', 'page');
    revalidatePath(`/administration/apprenants/${id}`, 'page');
}

async function suspend(formData: FormData) {
    'use server';
    const { id } = await suspendAdminLearner(formData);
    revalidatePath('/administration/apprenants');
    revalidatePath(`/administration/apprenants/${id}`);
}

async function unsuspend(formData: FormData) {
    'use server';
    const { id } = await unsuspendAdminLearner(formData);
    revalidatePath('/administration/apprenants');
    revalidatePath(`/administration/apprenants/${id}`);
}

async function archive(formData: FormData) {
    'use server';
    const { id } = await archiveAdminLearner(formData);
    revalidatePath('/administration/apprenants');
    revalidatePath(`/administration/apprenants/${id}`);
}

async function restore(formData: FormData) {
    'use server';
    const { id } = await restoreAdminLearner(formData);
    revalidatePath('/administration/apprenants');
    revalidatePath(`/administration/apprenants/${id}`);
}

async function hardDelete(formData: FormData) {
    'use server';
    await hardDeleteAdminLearner(formData);
    revalidatePath('/administration/apprenants');
    redirect('/administration/apprenants?deleted=1');
}

export async function ApprenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getAdministrationApprenantDetailData(id);

    if (!data) notFound();

    const { user, enrollsClient, stats, lastLearningActivityAt } = data;
    const displayName = user.name?.trim() || user.email;

    return (
        <div className="mx-auto max-w-[88rem] space-y-8">
            <section className="overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-primary/10 via-surface to-gold-100/70 shadow-soft">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <nav aria-label="Fil d’Ariane" className="hidden text-xs text-muted-foreground sm:block">
                            <Link href="/administration" className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">Administration</Link>
                            <span className="px-1.5" aria-hidden="true">›</span>
                            <Link href="/administration/apprenants" className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">Apprenants</Link>
                            <span className="px-1.5" aria-hidden="true">›</span>
                            <span className="text-foreground">Profil</span>
                        </nav>
                        <Link
                            href="/administration/apprenants"
                            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground motion-safe:transition-colors motion-reduce:transition-none hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Retour à la liste
                        </Link>
                    </div>

                    <div className="mt-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-primary/10 text-primary shadow-soft">
                            {user.avatarUrl ? (
                                <Image src={user.avatarUrl} alt="" fill className="object-cover" sizes="64px" />
                            ) : (
                                <span className="grid h-full w-full place-items-center text-lg font-semibold" aria-hidden="true">{getInitials(displayName)}</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Profil apprenant</p>
                            <h1 className="mt-1 break-words font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{displayName}</h1>
                            <p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <StatusPill tone={user.role === 'admin' ? 'warning' : 'primary'}>{user.role === 'admin' ? 'Administrateur' : 'Apprenant'}</StatusPill>
                                {user.suspendedAt ? <StatusPill tone="warning">Suspendu</StatusPill> : null}
                                {user.deletedAt ? <StatusPill tone="neutral">Archivé</StatusPill> : null}
                                {!user.suspendedAt && !user.deletedAt ? <StatusPill tone="success">Actif</StatusPill> : null}
                            </div>
                        </div>
                    </div>

                    <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <Kpi icon={<LogIn className="h-4 w-4" />} label="Dernière connexion" value={formatDateTime(user.lastLoginAt)} />
                        <Kpi icon={<Clock3 className="h-4 w-4" />} label="Dernière activité pédagogique" value={formatDateTime(lastLearningActivityAt)} />
                        <Kpi icon={<BookOpenCheck className="h-4 w-4" />} label="Progression moyenne" value={`${stats.avgPercent}%`} />
                        <Kpi icon={<UserRound className="h-4 w-4" />} label="Parcours" value={enrollsClient.length} />
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-border bg-surface p-4 shadow-soft sm:p-6" aria-labelledby="account-actions-title">
                <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Accès</p>
                    <h2 id="account-actions-title" className="text-xl font-semibold text-foreground">Rôle et état du compte</h2>
                    <p className="text-sm text-muted-foreground">Ces actions modifient réellement le compte. Vérifiez le profil visé avant de changer son rôle ou son état.</p>
                </div>

                <form id="roleForm" action={setRole}>
                    <input type="hidden" name="id" value={String(user._id)} />
                    <input type="hidden" name="role" value={user.role} />
                </form>

                <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(16rem,1fr)_auto_auto_auto] xl:items-center">
                    <AdminRoleSwitch currentRole={user.role} formId="roleForm" />
                    <ConfirmAction
                        action={user.suspendedAt ? unsuspend : suspend}
                        title={user.suspendedAt ? 'Retirer la suspension' : 'Marquer comme suspendu'}
                        message={user.suspendedAt ? 'Le statut suspendu sera retiré de ce compte.' : 'Le compte sera marqué comme suspendu dans l’administration.'}
                        confirmLabel={user.suspendedAt ? 'Retirer la suspension' : 'Suspendre'}
                        variant={user.suspendedAt ? 'success' : 'warn'}
                    >
                        <input type="hidden" name="id" value={String(user._id)} />
                    </ConfirmAction>
                    <ConfirmAction
                        action={user.deletedAt ? restore : archive}
                        title={user.deletedAt ? 'Restaurer' : 'Archiver'}
                        message={user.deletedAt ? 'Le compte réapparaîtra dans les vues actives.' : 'Le compte sera conservé mais marqué comme archivé.'}
                        confirmLabel={user.deletedAt ? 'Restaurer' : 'Archiver'}
                        variant="neutral"
                    >
                        <input type="hidden" name="id" value={String(user._id)} />
                    </ConfirmAction>
                    <ConfirmAction
                        action={hardDelete}
                        title="Supprimer définitivement"
                        message="Cette action irréversible supprime le compte et ses données associées."
                        confirmLabel="Supprimer définitivement"
                        requireText="SUPPRIMER"
                        variant="danger"
                        esc={false}
                        backdrop={false}
                    >
                        <input type="hidden" name="id" value={String(user._id)} />
                    </ConfirmAction>
                </div>
            </section>

            <UserTabs
                user={{
                    _id: String(user._id),
                    name: user.name ?? null,
                    email: user.email,
                    avatarUrl: user.avatarUrl ?? null,
                    theme: user.theme ?? 'system',
                    marketing: !!user.marketing,
                    productUpdates: !!user.productUpdates,
                    createdAt: user.createdAt ?? null,
                    passwordChangedAt: user.passwordChangedAt ?? null,
                }}
                enrolls={enrollsClient}
                stats={stats}
            />
        </div>
    );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
    return (
        <div className="rounded-2xl border border-border/80 bg-surface/85 p-4 shadow-soft backdrop-blur">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-primary" aria-hidden="true">{icon}</span>
                {label}
            </div>
            <div className="mt-2 break-words text-base font-semibold tabular-nums text-foreground">{value}</div>
        </div>
    );
}

function StatusPill({ tone, children }: { tone: 'primary' | 'success' | 'warning' | 'neutral'; children: React.ReactNode }) {
    const toneClass = {
        primary: 'border-primary/20 bg-primary/10 text-primary',
        success: 'border-success/25 bg-success/10 text-success',
        warning: 'border-warning/45 bg-warning/10 text-foreground',
        neutral: 'border-border bg-surface-muted text-muted-foreground',
    }[tone];

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass}`}>
            {tone === 'warning' ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" /> : null}
            {children}
        </span>
    );
}

function formatDateTime(value?: Date | string | null) {
    return value ? new Date(value).toLocaleString('fr-FR') : 'Jamais';
}

function getInitials(value: string) {
    const words = value.split(/[\s@._-]+/).filter(Boolean);
    return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join('') || '?';
}
