import { cn } from '@/lib/cn';

type BrandedPageLoadingProps = {
    title?: string;
    message?: string;
    contained?: boolean;
};

/**
 * Transition de page légère, sans image distante ni durée artificielle.
 * Les animations respectent les préférences système et applicatives.
 */
export function BrandedPageLoading({
    title = 'La page prend forme',
    message = 'Un instant, on pose les derniers détails.',
    contained = false,
}: BrandedPageLoadingProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className={cn(
                'relative isolate flex w-full items-center justify-center overflow-hidden bg-background px-5 py-12 text-foreground',
                contained
                    ? 'min-h-[60vh]'
                    : 'min-h-screen supports-[min-height:100dvh]:min-h-[100dvh]',
            )}
        >
            <span className="sr-only">Chargement de la page en cours.</span>

            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <span className="absolute -left-24 top-[8%] size-72 rounded-full bg-primary/10 blur-3xl sm:size-96" />
                <span className="absolute -right-24 bottom-[5%] size-72 rounded-full bg-secondary/10 blur-3xl sm:size-96" />
                <span className="absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/8 blur-3xl" />
            </div>

            <div aria-hidden="true" className="relative flex max-w-md -translate-y-16 flex-col items-center text-center sm:translate-y-0">
                <div className="relative size-28 sm:size-32">
                    <span className="absolute inset-1 rounded-[44%_56%_51%_49%/55%_43%_57%_45%] border border-primary/35 bg-primary/5 motion-safe:animate-[spin_10s_linear_infinite]" />
                    <span className="absolute inset-4 rounded-[58%_42%_45%_55%/44%_56%_44%_56%] border border-secondary/40 bg-secondary/5 motion-safe:animate-[spin_7s_linear_infinite_reverse]" />
                    <span className="absolute inset-8 rounded-[46%_54%_57%_43%/54%_44%_56%_46%] bg-gradient-to-br from-primary via-primary to-secondary shadow-[0_18px_50px_color-mix(in_srgb,var(--primary)_28%,transparent)] motion-safe:animate-pulse" />
                    <span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_6px_color-mix(in_srgb,var(--accent)_18%,transparent)]" />
                </div>

                <div className="mt-7 flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    <span className="h-px w-8 bg-accent" />
                    Ancre-toi
                    <span className="h-px w-8 bg-accent" />
                </div>

                <p className="mt-4 text-balance font-serif text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                    {title}
                </p>
                <p className="mt-3 max-w-[32ch] text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
                    {message}
                </p>

                <div className="mt-7 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
                    <span className="size-1.5 rounded-full bg-secondary motion-safe:animate-pulse [animation-delay:180ms]" />
                    <span className="size-1.5 rounded-full bg-accent motion-safe:animate-pulse [animation-delay:360ms]" />
                </div>
            </div>
        </div>
    );
}
