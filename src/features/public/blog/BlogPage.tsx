import 'server-only';

import { BookOpenText } from 'lucide-react';

import { Container, Section } from '@/components/ui';
import { blogContent } from '@/content/blog';
import { listPublishedBlogPagePosts } from '@/server/blog/public-posts.service';

import { BlogGalleryClient, BlogHero } from './components';

export async function BlogPage() {
    let docs: Awaited<ReturnType<typeof listPublishedBlogPagePosts>> = [];
    let hasLoadingError = false;

    try {
        docs = await listPublishedBlogPagePosts();
    } catch {
        hasLoadingError = true;
    }

    const featured = docs[0] ?? null;

    return (
        <div>
            <BlogHero featured={featured} />

            <Section id="grid" spacing="lg" className="scroll-mt-24 bg-background">
                <Container size="xl">
                    <div className="mb-8 max-w-2xl sm:mb-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Le carnet Ancre-toi</p>
                        <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">Choisis le texte qui accompagne ton moment.</h2>
                        <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
                            Parcours les thèmes librement : chaque article se lit à son rythme, sans ordre imposé.
                        </p>
                    </div>

                    {hasLoadingError ? (
                        <div className="rounded-[2rem] border border-border bg-surface px-6 py-10 text-center sm:px-10" role="status">
                            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary" aria-hidden="true">
                                <BookOpenText className="h-5 w-5" />
                            </span>
                            <h3 className="mt-4 font-serif text-2xl text-foreground">Le carnet ne s’ouvre pas pour le moment.</h3>
                            <p className="mx-auto mt-2 max-w-[58ch] text-sm leading-relaxed text-muted-foreground">
                                Le reste du site reste disponible. Réessaie dans quelques instants : aucun contenu n’a été supprimé.
                            </p>
                        </div>
                    ) : docs.length ? (
                        <BlogGalleryClient items={docs} />
                    ) : (
                        <div className="rounded-[2rem] border border-dashed border-border bg-surface-muted px-6 py-10 text-center">
                            <p className="font-serif text-2xl text-foreground">{blogContent.empty.noPosts}</p>
                            <p className="mx-auto mt-2 max-w-[55ch] text-sm leading-relaxed text-muted-foreground">
                                Les publications apparaîtront ici dès qu’elles seront prêtes à être partagées.
                            </p>
                        </div>
                    )}
                </Container>
            </Section>
        </div>
    );
}
