import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

import { Badge, Container, LinkButton } from '@/components/ui';
import { publicMedia } from '@/config/public-media';
import { authContent } from '@/content/auth';

type AuthFrameProps = {
    eyebrow: string;
    title: string;
    description: string;
    children: ReactNode;
    footer?: ReactNode;
};

export function AuthFrame({ eyebrow, title, description, children, footer }: AuthFrameProps) {
    const media = publicMedia.authPortal;

    return (
        <div className="relative overflow-hidden bg-background py-4 sm:py-8 lg:py-12">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_18%_12%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_50%),radial-gradient(circle_at_86%_20%,color-mix(in_srgb,var(--public-sage)_16%,transparent),transparent_45%)]" aria-hidden="true" />

            <Container size="xl" className="relative">
                <div className="grid overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-elevated sm:rounded-[2.25rem] lg:min-h-[43rem] lg:grid-cols-[minmax(20rem,0.92fr)_minmax(28rem,1.08fr)]">
                    <aside className="relative min-h-44 overflow-hidden sm:min-h-56 lg:min-h-full">
                        <Image
                            src={media.src}
                            alt={media.alt}
                            fill
                            priority
                            sizes="(max-width: 1023px) 100vw, 43vw"
                            className="object-cover"
                            style={{ objectPosition: media.objectPosition }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#21162d]/90 via-[#21162d]/24 to-transparent lg:bg-gradient-to-r lg:from-[#21162d]/88 lg:via-[#21162d]/22 lg:to-transparent" aria-hidden="true" />

                        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7 lg:p-10 xl:p-12">
                            <Badge variant="outline" size="md" className="border-white/35 bg-white/12 text-white backdrop-blur">
                                {authContent.shell.eyebrow}
                            </Badge>
                            <h2 className="mt-3 max-w-xl font-serif text-2xl leading-tight text-balance sm:text-3xl lg:mt-6 lg:text-4xl xl:text-5xl">
                                {authContent.shell.title}
                            </h2>
                            <p className="mt-4 hidden max-w-lg text-sm leading-relaxed text-white/82 lg:block lg:text-base">
                                {authContent.shell.description}
                            </p>
                            <ul className="mt-6 hidden gap-3 lg:grid">
                                {authContent.shell.highlights.map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-sm font-medium text-white/92">
                                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/12 backdrop-blur">
                                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    <section className="flex min-w-0 flex-col justify-center p-5 sm:p-8 lg:p-10 xl:p-14">
                        <Link
                            href={authContent.shell.links.programmes.href}
                            className="mb-7 inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            {authContent.shell.links.programmes.label}
                        </Link>

                        <div className="mx-auto w-full max-w-[35rem]">
                            <Badge variant="outline" size="md" className="bg-background/75">
                                {eyebrow}
                            </Badge>
                            <h1 className="mt-4 font-serif text-3xl leading-[1.05] text-balance text-foreground sm:text-4xl lg:text-5xl">{title}</h1>
                            <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>

                            <div className="mt-7 border-t border-border pt-7">{children}</div>

                            {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
                        </div>

                        <div className="mt-7 flex justify-center lg:hidden">
                            <LinkButton href={authContent.shell.links.aide.href} variant="tertiary" size="sm">
                                {authContent.shell.links.aide.label}
                            </LinkButton>
                        </div>
                    </section>
                </div>
            </Container>
        </div>
    );
}
