import { ArrowLeft, CalendarDays, Clock3, Gauge, GraduationCap, HeartHandshake, Leaf, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui';
import { espaceRoutes } from '@/config/routes';
import { LearnerHero, LearnerPage, LearnerPanel, ProgramDetailButton, StatTile } from '@/features/espace/components';

import { IntroClient } from './components';

type FormationOverviewPageProps = {
  safeSlug: string;
  programName: string;
  title: string;
  subtitle: string;
  totalDays: number;
  minutesPerDaySafe: number;
  level: string;
  initialEngaged: boolean;
  hasProgress: boolean;
  hasPublishedDays: boolean;
  isCompleted: boolean;
  resumeDay: number;
  isPaused: boolean;
  learnerName: string;
};

const programmeFeatures = [
  {
    icon: Leaf,
    title: 'Clarté & douceur',
    text: 'Des exercices simples, guidés, pour te mettre en mouvement sans te brusquer.',
  },
  {
    icon: HeartHandshake,
    title: 'Ancrage corporel',
    text: 'Des micro-pratiques de respiration et d’écoute du corps pour revenir au calme.',
  },
  {
    icon: TrendingUp,
    title: 'Progression réelle',
    text: 'Un pas par jour. Tu avances, tu notes, tu reviens si besoin — tout est gardé en mémoire.',
  },
] as const;

export function FormationOverviewPage({
  safeSlug,
  programName,
  title,
  subtitle,
  totalDays,
  minutesPerDaySafe,
  level,
  initialEngaged,
  hasProgress,
  hasPublishedDays,
  isCompleted,
  resumeDay,
  isPaused,
  learnerName,
}: FormationOverviewPageProps) {
  return (
    <LearnerPage size="full" spacing="relaxed">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={espaceRoutes.formations}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Mes formations
        </Link>
        <ProgramDetailButton slug={safeSlug} label="Vue d’ensemble" />
      </div>

      <LearnerHero
        eyebrow={
          <Badge variant={isCompleted ? 'success' : isPaused ? 'warning' : initialEngaged ? 'success' : 'secondary'} size="md">
            {programName} · {isCompleted ? 'Terminé' : isPaused ? 'En pause' : initialEngaged ? 'En cours' : 'Introduction'}
          </Badge>
        }
        title={title}
        description={subtitle}
        aside={
          <div className="grid min-w-44 gap-1 rounded-3xl border border-border bg-surface/85 p-4 text-center shadow-soft backdrop-blur">
            <span className="font-serif text-3xl font-semibold text-foreground">{totalDays}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">journées guidées</span>
            <span className="mt-1 text-sm font-medium text-primary">{minutesPerDaySafe} min par jour</span>
          </div>
        }
      />

      <section aria-label="Repères du parcours" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={CalendarDays} label="Jours" value={totalDays || 0} />
        <StatTile icon={Gauge} label="Rythme conseillé" value={`${minutesPerDaySafe} min/j`} />
        <StatTile icon={Clock3} label="Durée totale" value={totalDays > 0 ? `~${totalDays * minutesPerDaySafe} min` : 'À venir'} />
        <StatTile icon={GraduationCap} label="Niveau" value={level} />
      </section>

      <LearnerPanel title="Ce qui t’attend" description="Trois repères pour entrer dans le parcours en confiance.">
        <div className="grid gap-4 md:grid-cols-3 lg:gap-5">
          {programmeFeatures.map(({ icon: Icon, title: featureTitle, text }) => (
            <article key={featureTitle} className="rounded-3xl border border-border bg-surface-muted p-5 sm:p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-surface text-primary shadow-soft" aria-hidden="true">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">{featureTitle}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </LearnerPanel>

      <IntroClient
        slug={safeSlug}
        initialEngaged={initialEngaged}
        hasProgress={hasProgress}
        hasPublishedDays={hasPublishedDays}
        isCompleted={isCompleted}
        learnerName={learnerName}
        resumeDay={resumeDay}
        isPaused={isPaused}
      />
    </LearnerPage>
  );
}
