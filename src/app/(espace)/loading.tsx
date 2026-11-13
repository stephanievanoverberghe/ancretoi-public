import { Skeleton } from '@/components/ui';
import { LearnerPage, LearnerPanel } from '@/features/espace/components';

export default function LearnerLoading() {
    return (
        <LearnerPage size="wide" aria-busy="true" aria-label="Chargement de ton espace">
            <div className="space-y-3" role="status" aria-live="polite">
                <span className="sr-only">Chargement de ton espace</span>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full max-w-xl" />
                <Skeleton className="h-5 w-full max-w-2xl" />
            </div>

            <LearnerPanel padding="lg" className="overflow-hidden">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_12rem] lg:items-center">
                    <div className="space-y-4">
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-8 w-full max-w-lg" />
                        <Skeleton className="h-4 w-full max-w-xl" />
                        <Skeleton className="h-12 w-40 rounded-2xl" />
                    </div>
                    <Skeleton className="mx-auto h-36 w-36 rounded-full" />
                </div>
            </LearnerPanel>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-28 rounded-3xl" />
                ))}
            </div>
        </LearnerPage>
    );
}
