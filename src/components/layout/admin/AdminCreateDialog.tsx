'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { BookOpen, Newspaper, Plus, Sparkles, X } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui';
import { administrationRoutes } from '@/config/routes';

const createLinks = [
    {
        href: administrationRoutes.programmeNouveau,
        label: 'Programme',
        description: 'Construire un nouveau parcours pédagogique.',
        icon: BookOpen,
    },
    {
        href: administrationRoutes.articleNouveau,
        label: 'Article',
        description: 'Rédiger une ressource pour le blog.',
        icon: Newspaper,
    },
    {
        href: administrationRoutes.inspirationNouveau,
        label: 'Inspiration',
        description: 'Ajouter une pratique courte en vidéo.',
        icon: Sparkles,
    },
] as const;

export function AdminCreateDialog() {
    return (
        <DialogPrimitive.Root>
            <DialogPrimitive.Trigger asChild>
                <Button type="button" size="sm" leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}>
                    <span className="hidden sm:inline">Créer</span>
                    <span className="sr-only sm:hidden">Créer un contenu</span>
                </Button>
            </DialogPrimitive.Trigger>

            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-overlay/50 backdrop-blur-[2px]" />
                <DialogPrimitive.Content className="fixed inset-x-3 bottom-3 z-[var(--z-modal)] max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-[2rem] border border-border bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-foreground shadow-elevated outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(34rem,calc(100vw-3rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <DialogPrimitive.Title className="font-serif text-2xl font-semibold leading-tight text-foreground">Créer un contenu</DialogPrimitive.Title>
                            <DialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Choisissez le format à ouvrir dans le studio éditorial.
                            </DialogPrimitive.Description>
                        </div>
                        <DialogPrimitive.Close asChild>
                            <button type="button" aria-label="Fermer" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground motion-safe:transition-colors motion-reduce:transition-none hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </DialogPrimitive.Close>
                    </div>

                    <nav className="mt-6 grid gap-3" aria-label="Créer un contenu">
                        {createLinks.map((item) => {
                            const Icon = item.icon;
                            return (
                                <DialogPrimitive.Close key={item.href} asChild>
                                    <Link href={item.href} className="group flex min-h-20 items-center gap-4 rounded-2xl border border-border bg-surface-muted/45 p-4 motion-safe:transition-colors motion-reduce:transition-none hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                                        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary motion-safe:transition-colors motion-reduce:transition-none group-hover:bg-primary group-hover:text-primary-foreground" aria-hidden="true">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span>
                                            <span className="block font-semibold text-foreground">{item.label}</span>
                                            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{item.description}</span>
                                        </span>
                                    </Link>
                                </DialogPrimitive.Close>
                            );
                        })}
                    </nav>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
