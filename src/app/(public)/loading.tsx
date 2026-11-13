import { Container, Section, Skeleton } from '@/components/ui';

export default function PublicLoading() {
    return (
        <Section spacing="lg" className="bg-background">
            <Container size="lg">
                <div role="status" aria-live="polite" className="mx-auto max-w-3xl">
                    <span className="sr-only">Chargement de la page</span>
                    <Skeleton className="h-6 w-36 rounded-full" />
                    <Skeleton className="mt-5 h-14 w-full max-w-2xl rounded-2xl" />
                    <Skeleton className="mt-4 h-5 w-full rounded-lg" />
                    <Skeleton className="mt-2 h-5 w-4/5 rounded-lg" />
                    <div className="mt-10 grid gap-4 sm:grid-cols-2">
                        <Skeleton className="h-48 rounded-3xl" />
                        <Skeleton className="h-48 rounded-3xl" />
                    </div>
                </div>
            </Container>
        </Section>
    );
}
