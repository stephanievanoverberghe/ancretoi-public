import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

import { Badge, Container, Section } from '@/components/ui';
import { publicMedia } from '@/config/public-media';
import { quizContent } from '@/content/quiz';

export function QuizHeroSection() {
    return (
        <Section spacing="lg" className="relative overflow-hidden border-b border-border bg-surface">
            <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-primary/14 blur-3xl" aria-hidden="true" />
            <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-secondary/12 blur-3xl" aria-hidden="true" />

            <Container size="xl" className="relative grid gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(22rem,0.72fr)] lg:items-center">
                <div className="max-w-3xl">
                    <Badge variant="secondary" size="md">
                        {quizContent.hero.eyebrow}
                    </Badge>
                    <h1 className="mt-5 max-w-[13ch] text-balance font-serif text-4xl font-semibold leading-[1.02] text-foreground sm:text-5xl lg:text-6xl">{quizContent.hero.title}</h1>
                    <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-muted-foreground sm:text-lg">{quizContent.hero.description}</p>

                    <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
                        {quizContent.hero.meta.map((item) => (
                            <li key={item} className="inline-flex items-center gap-2 text-sm text-foreground">
                                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative aspect-[3/2] overflow-hidden rounded-[2.5rem] border border-border shadow-elevated">
                    <Image src={publicMedia.compassQuiz.src} alt={publicMedia.compassQuiz.alt} fill priority sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" style={{ objectPosition: publicMedia.compassQuiz.objectPosition }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" aria-hidden="true" />
                    <p className="absolute bottom-5 left-5 right-5 max-w-[24ch] font-serif text-2xl leading-tight text-white sm:bottom-7 sm:left-7">Pas de bonne réponse. Seulement ton point de départ.</p>
                </div>
            </Container>
        </Section>
    );
}
