import { Card, CardContent, Container, Section, Skeleton } from '@/components/ui';

export default function ProgramsLoading() {
    return (
        <Section spacing="lg" className="bg-background">
            <Container size="xl">
                <div role="status" aria-live="polite" className="grid gap-8">
                    <div className="max-w-3xl">
                        <Skeleton className="h-7 w-44 rounded-full" />
                        <Skeleton className="mt-5 h-12 w-full max-w-2xl rounded-2xl sm:h-16" />
                        <Skeleton className="mt-4 h-5 w-full max-w-xl rounded-full" />
                        <Skeleton className="mt-2 h-5 w-4/5 max-w-lg rounded-full" />
                    </div>
                    <div className="grid gap-4 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Card key={index} className="min-h-[28rem] rounded-3xl">
                                <CardContent className="flex h-full flex-col p-5">
                                    <Skeleton className="h-7 w-28 rounded-full" />
                                    <div className="mt-auto grid gap-3">
                                        <Skeleton className="h-10 w-3/4 rounded-xl" />
                                        <Skeleton className="h-4 w-full rounded-full" />
                                        <Skeleton className="h-4 w-5/6 rounded-full" />
                                        <Skeleton className="h-10 w-full rounded-xl" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <span className="sr-only">Chargement des programmes</span>
                </div>
            </Container>
        </Section>
    );
}
