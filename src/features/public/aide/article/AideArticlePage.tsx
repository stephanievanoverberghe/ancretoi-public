import { ArrowLeft, CheckCircle2, LifeBuoy } from 'lucide-react';

import { Badge, Container, LinkButton, Section } from '@/components/ui';
import { publicRoutes } from '@/config/routes';
import type { AideArticle } from '@/content/aide-articles';

type AideArticlePageProps = {
    article: AideArticle;
};

export function AideArticlePage({ article }: AideArticlePageProps) {
    return (
        <Section spacing="lg" className="relative overflow-hidden bg-background">
            <div className="absolute -right-28 top-8 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
            <Container size="lg" className="relative">
                <LinkButton href={publicRoutes.aide} variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Retour au centre d’aide
                </LinkButton>

                <header className="mt-8 max-w-[72ch]">
                    <Badge variant="secondary">Centre d’aide</Badge>
                    <h1 className="mt-4 max-w-[18ch] text-balance font-serif text-4xl leading-[1.05] text-foreground sm:text-5xl">
                        {article.title}
                    </h1>
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                        {article.description}
                    </p>
                </header>

                <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,72ch)_minmax(15rem,0.42fr)] lg:items-start">
                    <div>
                        <ol className="border-t border-border">
                            {article.steps.map((step, index) => (
                                <li key={step} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 border-b border-border py-6">
                                    <span className="font-serif text-3xl text-primary">{String(index + 1).padStart(2, '0')}</span>
                                    <span className="pt-1 text-base leading-relaxed text-foreground sm:text-lg">{step}</span>
                                </li>
                            ))}
                        </ol>

                        {article.note ? (
                            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-info/25 bg-info/10 p-5 text-sm leading-relaxed text-foreground">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden="true" />
                                <p>{article.note}</p>
                            </div>
                        ) : null}
                    </div>

                    <aside className="rounded-[2rem] border border-border bg-surface p-6 shadow-soft lg:sticky lg:top-28">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary" aria-hidden="true"><LifeBuoy className="h-5 w-5" /></span>
                        <h2 className="mt-4 font-serif text-2xl text-foreground">Toujours bloquée ?</h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Explique-nous ce que tu vois : on te répond sans jargon.</p>
                        <LinkButton href={publicRoutes.contact} className="mt-5 w-full">Nous contacter</LinkButton>
                    </aside>
                </div>
            </Container>
        </Section>
    );
}
