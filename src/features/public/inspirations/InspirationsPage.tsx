import 'server-only';

import { PlayCircle } from 'lucide-react';

import { Container, Section } from '@/components/ui';
import { inspirationsContent } from '@/content/inspirations';
import { listPublishedInspirations } from '@/server/inspirations/public-inspirations.service';

import { InspirationsGalleryClient, InspirationsHero } from './components';

export async function InspirationsPage() {
    let docs: Awaited<ReturnType<typeof listPublishedInspirations>> = [];
    let hasLoadingError = false;

    try {
        docs = await listPublishedInspirations();
    } catch {
        hasLoadingError = true;
    }

    const latest = docs[0] ?? null;

    return (
        <div>
            <InspirationsHero latest={latest} />

            <Section id="grid" spacing="lg" className="scroll-mt-24 bg-background">
                <Container size="xl">
                    <div className="mb-8 max-w-2xl sm:mb-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">La vidéothèque sensible</p>
                        <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">Une sélection à regarder avec intention.</h2>
                        <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
                            Choisis un thème, ouvre un espace calme et lance le lecteur seulement quand tu es prête.
                        </p>
                    </div>

                    {hasLoadingError ? (
                        <div className="rounded-[2rem] border border-border bg-surface px-6 py-10 text-center sm:px-10" role="status">
                            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary/10 text-secondary" aria-hidden="true">
                                <PlayCircle className="h-5 w-5" />
                            </span>
                            <h3 className="mt-4 font-serif text-2xl text-foreground">La sélection est momentanément indisponible.</h3>
                            <p className="mx-auto mt-2 max-w-[58ch] text-sm leading-relaxed text-muted-foreground">
                                Tu peux continuer à parcourir le site et revenir ici dans quelques instants.
                            </p>
                        </div>
                    ) : docs.length ? (
                        <InspirationsGalleryClient items={docs} />
                    ) : (
                        <div className="rounded-[2rem] border border-dashed border-border bg-surface-muted px-6 py-10 text-center">
                            <p className="font-serif text-2xl text-foreground">{inspirationsContent.empty.noItems}</p>
                            <p className="mx-auto mt-2 max-w-[55ch] text-sm leading-relaxed text-muted-foreground">
                                Seules les vidéos réellement sélectionnées et publiées apparaîtront ici.
                            </p>
                        </div>
                    )}
                </Container>
            </Section>
        </div>
    );
}
