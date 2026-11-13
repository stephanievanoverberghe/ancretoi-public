import { Reveal } from '@/components/motion';
import { Badge, type BadgeProps } from '@/components/ui';
import { cn } from '@/lib/cn';

export type SectionHeaderProps = {
    eyebrow: string;
    title: string;
    description?: string;
    align?: 'left' | 'center';
    eyebrowVariant?: BadgeProps['variant'];
};

/**
 * En-tête de section commun aux pages publiques : eyebrow en badge,
 * titre serif et description, avec apparition douce au scroll.
 */
export function SectionHeader({ eyebrow, title, description, align = 'left', eyebrowVariant = 'outline' }: SectionHeaderProps) {
    return (
        <Reveal className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
            <header className={cn(align === 'center' && 'text-center')}>
                <Badge
                    variant={eyebrowVariant}
                    size="md"
                    className="rounded-none border-x-0 border-t-0 bg-transparent px-0 pb-2 text-xs font-semibold uppercase tracking-[0.2em]"
                >
                    {eyebrow}
                </Badge>
                <h2 className={cn('mt-5 max-w-[20ch] text-balance font-serif text-3xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]', align === 'center' && 'mx-auto')}>{title}</h2>
                {description ? <p className={cn('mt-4 max-w-[64ch] text-base leading-relaxed text-muted-foreground sm:text-lg', align === 'center' && 'mx-auto')}>{description}</p> : null}
            </header>
        </Reveal>
    );
}
