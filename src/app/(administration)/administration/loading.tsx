import { Card, Skeleton } from '@/components/ui';

export default function AdministrationLoading() {
    return (
        <div
            className="mx-auto w-full max-w-[var(--container-max)] space-y-5 sm:space-y-6 lg:space-y-8"
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <span className="sr-only">Chargement de l’administration…</span>

            <div aria-hidden="true" className="space-y-5 sm:space-y-6">
                <Card className="overflow-hidden rounded-[2rem] p-4 sm:p-6 lg:p-8">
                    <Skeleton className="h-3 w-24 rounded-full" />
                    <Skeleton className="mt-4 h-9 w-72 max-w-[85%] rounded-xl sm:h-11" />
                    <Skeleton className="mt-3 h-4 w-[34rem] max-w-full rounded-full" />
                    <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                        {Array.from({ length: 4 }, (_, index) => (
                            <Skeleton key={index} className="h-24 rounded-2xl sm:h-28" />
                        ))}
                    </div>
                </Card>

                <Card className="rounded-3xl p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                        <Skeleton className="h-10 min-w-0 flex-1 rounded-xl" />
                        <Skeleton className="hidden h-10 w-32 rounded-xl sm:block" />
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }, (_, index) => (
                            <Skeleton key={index} className="h-44 rounded-2xl sm:h-52" />
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
