import { ArrowRight, Compass, Sparkles } from 'lucide-react';

import { Badge, LinkButton } from '@/components/ui';
import { espaceContent } from '@/content/espace';
import {
    CourseCard,
    type CourseCardData,
    LearnerEmptyState,
    LearnerHeader,
    LearnerPage,
} from '@/features/espace/components';

type FormationsPageProps = {
    courses: CourseCardData[];
};

export function FormationsPage({ courses }: FormationsPageProps) {
    return (
        <LearnerPage size="wide" spacing="relaxed">
            <LearnerHeader
                eyebrow={<Badge variant="secondary">{espaceContent.formations.eyebrow}</Badge>}
                title={espaceContent.formations.title}
                description={espaceContent.formations.description}
            />

            {courses.length > 0 ? (
                <ul className="grid grid-cols-1 gap-6 xl:gap-8">
                    {courses.map((course, index) => (
                        <li key={course.programSlug} className="min-w-0">
                            <CourseCard course={course} headingLevel="h2" imagePriority={index < 2} variant="showcase" />
                        </li>
                    ))}
                </ul>
            ) : (
                <LearnerEmptyState
                    icon={Compass}
                    title={espaceContent.empty.courses.title}
                    description={espaceContent.empty.courses.description}
                    actions={
                        <LinkButton href={espaceContent.formations.catalogueHref} size="lg">
                            {espaceContent.formations.catalogueCta}
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </LinkButton>
                    }
                />
            )}

            <aside className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-brand-50 via-surface to-secondary-50 p-6 sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface text-primary shadow-soft" aria-hidden="true">
                            <Sparkles className="h-5 w-5" />
                        </span>
                        <div>
                            <h2 className="font-serif text-xl font-semibold text-foreground sm:text-2xl">Un autre chemin t’appelle ?</h2>
                            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                Découvre les autres parcours et choisis celui qui correspond à ton moment.
                            </p>
                        </div>
                    </div>
                    <LinkButton href={espaceContent.formations.catalogueHref} variant="tertiary" size="lg" className="w-full shrink-0 rounded-xl sm:w-auto">
                        {espaceContent.formations.catalogueCta}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </LinkButton>
                </div>
            </aside>
        </LearnerPage>
    );
}
