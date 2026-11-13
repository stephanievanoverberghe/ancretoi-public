'use client';

import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { Badge, Button, Card, CardContent, Container, LinkButton, Section } from '@/components/ui';
import { quizContent, type QuizProfile } from '@/content/quiz';
import { cn } from '@/lib/cn';

const profilePriority: readonly QuizProfile[] = ['reset', 'boussole', 'ancrage', 'alchimie'];
const profileImages: Record<QuizProfile, string> = {
    reset: '/images/programs/reset7.webp',
    boussole: '/images/programs/boussole10.webp',
    ancrage: '/images/programs/ancrage30.webp',
    alchimie: '/images/programs/alchimie90.webp',
};

function computeProfile(answers: readonly number[]): QuizProfile {
    const scores: Record<QuizProfile, number> = { reset: 0, boussole: 0, ancrage: 0, alchimie: 0 };

    answers.forEach((optionIndex, questionIndex) => {
        const option = quizContent.quiz.questions[questionIndex]?.options[optionIndex];
        if (option) scores[option.profile] += 1;
    });

    return profilePriority.reduce((best, profile) => (scores[profile] > scores[best] ? profile : best), profilePriority[0]);
}

export function QuizClient() {
    const questions = quizContent.quiz.questions;
    const [answers, setAnswers] = useState<number[]>([]);
    const [step, setStep] = useState(0);
    const headingRef = useRef<HTMLHeadingElement | null>(null);
    const shouldMoveFocus = useRef(false);

    const isDone = step >= questions.length;
    const currentQuestion = questions[step];
    const progressRatio = questions.length ? Math.min(step / questions.length, 1) : 0;

    useEffect(() => {
        if (!shouldMoveFocus.current || isDone) return;
        headingRef.current?.focus();
        shouldMoveFocus.current = false;
    }, [isDone, step]);

    const selectOption = (optionIndex: number) => {
        setAnswers((currentAnswers) => {
            const nextAnswers = [...currentAnswers];
            nextAnswers[step] = optionIndex;
            return nextAnswers;
        });
        shouldMoveFocus.current = true;
        setStep((currentStep) => currentStep + 1);
    };

    const goBack = () => {
        shouldMoveFocus.current = true;
        setStep((currentStep) => Math.max(currentStep - 1, 0));
    };

    const restart = () => {
        setAnswers([]);
        setStep(0);
    };

    if (!questions.length) {
        return (
            <Section spacing="lg" className="bg-background">
                <Container size="md">
                    <div className="rounded-[2rem] border border-dashed border-border bg-surface-muted px-6 py-10 text-center" role="status">
                        <h2 className="font-serif text-2xl text-foreground">Le quiz n’est pas disponible pour le moment.</h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Tu peux toujours comparer les programmes directement.</p>
                        <LinkButton href={quizContent.quiz.secondaryCta.href} variant="tertiary" className="mt-5">{quizContent.quiz.secondaryCta.label}</LinkButton>
                    </div>
                </Container>
            </Section>
        );
    }

    return (
        <Section spacing="lg" className="relative overflow-hidden bg-background">
            <div className="absolute -left-36 top-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
            <Container size="lg" className="relative">
                {isDone ? (
                    <QuizResultCard profile={computeProfile(answers)} onRestart={restart} />
                ) : (
                    <Card className="overflow-hidden rounded-[2.25rem] bg-surface shadow-elevated">
                        <div className="grid lg:grid-cols-[minmax(14rem,0.42fr)_minmax(0,1fr)]">
                            <aside className="flex flex-col bg-primary p-6 text-primary-foreground sm:p-8">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">{quizContent.quiz.progressLabel}</p>
                                <p className="mt-3 font-serif text-6xl leading-none tabular-nums">{String(step + 1).padStart(2, '0')}</p>
                                <p className="mt-2 text-sm text-primary-foreground/70">sur {String(questions.length).padStart(2, '0')}</p>
                                <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-primary-foreground/20" role="progressbar" aria-label="Progression du quiz" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressRatio * 100)}>
                                    <div className="h-full rounded-full bg-primary-foreground transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${Math.max(progressRatio * 100, 5)}%` }} />
                                </div>
                                <p className="mt-6 max-w-[24ch] text-sm leading-relaxed text-primary-foreground/75">Réponds selon ton énergie actuelle, pas selon ce que tu aimerais ressentir.</p>
                            </aside>

                            <CardContent className="p-6 sm:p-8 lg:p-10">
                                <div className="flex justify-end">
                                    {step > 0 ? (
                                        <Button variant="ghost" size="sm" onClick={goBack}><ArrowLeft className="h-4 w-4" aria-hidden="true" />{quizContent.quiz.backLabel}</Button>
                                    ) : <Badge variant="outline">Réponse spontanée</Badge>}
                                </div>

                                <div aria-live="polite">
                                    <h2 ref={headingRef} tabIndex={-1} className="mt-6 max-w-[20ch] text-balance font-serif text-3xl font-semibold leading-[1.08] text-foreground outline-none sm:text-4xl">
                                        {currentQuestion.question}
                                    </h2>

                                    <div className="mt-8 grid gap-3" role="group" aria-label={currentQuestion.question}>
                                        {currentQuestion.options.map((option, optionIndex) => {
                                            const isSelected = answers[step] === optionIndex;
                                            const optionLetter = String.fromCharCode(65 + optionIndex);

                                            return (
                                                <button
                                                    key={option.label}
                                                    type="button"
                                                    aria-pressed={isSelected}
                                                    onClick={() => selectOption(optionIndex)}
                                                    className={cn(
                                                        'group grid min-h-16 cursor-pointer grid-cols-[2.25rem_minmax(0,1fr)_1rem] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                                                        isSelected ? 'border-primary/40 bg-primary/10 text-foreground' : 'border-border bg-background text-foreground hover:border-primary/35 hover:bg-surface-muted',
                                                    )}
                                                >
                                                    <span className="grid h-9 w-9 place-items-center rounded-full border border-current/15 text-xs font-semibold" aria-hidden="true">{optionLetter}</span>
                                                    <span className="text-sm leading-relaxed sm:text-base">{option.label}</span>
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden="true" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                )}

                <p className="mx-auto mt-6 max-w-[70ch] text-center text-sm leading-relaxed text-muted-foreground">{quizContent.quiz.disclaimer}</p>
            </Container>
        </Section>
    );
}

function QuizResultCard({ profile, onRestart }: { profile: QuizProfile; onRestart: () => void }) {
    const result = quizContent.quiz.results[profile];
    const resultHeadingRef = useRef<HTMLHeadingElement | null>(null);

    useEffect(() => {
        resultHeadingRef.current?.focus();
    }, []);

    return (
        <article className="overflow-hidden rounded-[2.25rem] border border-border bg-surface-raised shadow-elevated" aria-live="polite">
            <div className="grid lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1fr)]">
                <div className="relative min-h-[18rem] lg:min-h-full">
                    <Image src={profileImages[profile]} alt="" fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden="true" />
                    <p className="absolute bottom-6 left-6 right-6 max-w-[22ch] font-serif text-2xl leading-tight text-white">Un point de départ adapté à ton moment.</p>
                </div>

                <div className="relative p-6 sm:p-8 lg:p-10">
                    <Badge variant="secondary" size="md">{quizContent.quiz.resultEyebrow}</Badge>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">{result.badge}</p>
                    <h2 ref={resultHeadingRef} tabIndex={-1} className="mt-2 max-w-[18ch] text-balance font-serif text-3xl font-semibold leading-tight text-foreground outline-none sm:text-4xl">{result.title}</h2>
                    <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-muted-foreground sm:text-lg">{result.description}</p>

                    <ul className="mt-6 grid gap-3">
                        {result.reasons.map((reason) => (
                            <li key={reason} className="flex items-start gap-3 text-sm leading-relaxed text-foreground sm:text-base">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                                <span>{reason}</span>
                            </li>
                        ))}
                    </ul>

                    {result.note ? <p className="mt-6 rounded-2xl border border-border bg-background/72 p-4 text-sm leading-relaxed text-muted-foreground">{result.note}</p> : null}

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <LinkButton href={result.primaryCta.href} size="lg" className="w-full sm:w-fit"><Sparkles aria-hidden="true" className="h-4 w-4" />{result.primaryCta.label}</LinkButton>
                        <LinkButton href={quizContent.quiz.secondaryCta.href} variant="tertiary" size="lg" className="w-full sm:w-fit">{quizContent.quiz.secondaryCta.label}<ArrowRight aria-hidden="true" className="h-4 w-4" /></LinkButton>
                    </div>

                    <Button variant="ghost" size="sm" onClick={onRestart} className="mt-4"><RotateCcw className="h-4 w-4" aria-hidden="true" />{quizContent.quiz.restartLabel}</Button>
                </div>
            </div>
        </article>
    );
}
