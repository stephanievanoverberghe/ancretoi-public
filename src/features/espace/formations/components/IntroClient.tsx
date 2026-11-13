'use client';

import { CheckCircle2, PauseCircle, PlayCircle, ShieldCheck } from 'lucide-react';
import { startTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Alert, Button } from '@/components/ui';
import { routeBuilders } from '@/config/routes';
import { LearnerPanel } from '@/features/espace/components';

type IntroClientProps = {
  slug: string;
  initialEngaged: boolean;
  hasProgress: boolean;
  hasPublishedDays: boolean;
  isCompleted: boolean;
  learnerName: string;
  resumeDay: number;
  isPaused: boolean;
};

type IntroResponse = {
  engaged?: boolean;
  currentDay?: number;
  status?: 'active' | 'paused' | 'completed';
};

export function IntroClient({ slug, initialEngaged, hasProgress, hasPublishedDays, isCompleted, learnerName, resumeDay, isPaused }: IntroClientProps) {
  const router = useRouter();
  const [engaged, setEngaged] = useState(initialEngaged);
  const [busyAction, setBusyAction] = useState<'start' | 'pause' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setEngaged(initialEngaged), [initialEngaged]);

  async function updateEngagement(next: boolean): Promise<IntroResponse> {
    const response = await fetch('/api/learn/intro', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, engaged: next }),
      cache: 'no-store',
    });
    const result = (await response.json().catch(() => ({}))) as IntroResponse;
    if (!response.ok) {
      throw new Error('Impossible de mettre à jour ton parcours pour le moment.');
    }
    return result;
  }

  async function startProgramme() {
    if (!hasPublishedDays) return;

    try {
      setBusyAction('start');
      setError(null);
      if (!engaged && !isCompleted) {
        const result = await updateEngagement(true);
        setEngaged(result.engaged ?? true);
      }
      window.location.assign(routeBuilders.formationJour(slug, resumeDay));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Impossible de démarrer pour le moment.');
      setBusyAction(null);
    }
  }

  async function pauseProgramme() {
    try {
      setBusyAction('pause');
      setError(null);
      const result = await updateEngagement(false);
      setEngaged(result.engaged ?? false);
      startTransition(() => router.refresh());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Impossible de mettre le parcours en pause pour le moment.');
    } finally {
      setBusyAction(null);
    }
  }

  const isBusy = busyAction !== null;
  const mainLabel = isCompleted
    ? `Revoir le jour ${resumeDay}`
    : hasProgress || isPaused
      ? `Reprendre le jour ${resumeDay}`
      : 'Commencer le jour 1';

  return (
    <LearnerPanel
      id="engagement"
      className="scroll-mt-24"
      title={`${learnerName ? `${learnerName}, ` : ''}ton rythme reste le bon`}
      description="Ce cadre protège ton attention : tu peux avancer, t’arrêter et revenir sans perdre ton travail."
      variant="raised"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="rounded-3xl border border-border bg-surface-muted p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface text-primary shadow-soft" aria-hidden="true">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="font-serif text-lg font-semibold text-foreground">Engagement bien-être</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Je pratique en douceur, je m’hydrate et je m’arrête si je me sens dépassé·e.
              </p>
            </div>
          </div>

          <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              Une seule journée est proposée à la fois.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              Tes notes et ta progression restent enregistrées pendant une pause.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              Tu peux revenir à cette introduction à tout moment.
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-primary/20 bg-primary/8 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Prochain pas</p>
          <p className="mt-2 font-serif text-xl font-semibold leading-tight text-foreground">
            {!hasPublishedDays
              ? 'Le contenu arrive bientôt'
              : isCompleted
                ? 'Ton parcours est accompli'
                : engaged
                  ? `Jour ${resumeDay} prêt`
                  : isPaused
                    ? 'Ton parcours est en pause'
                    : 'Entre dans le parcours en conscience'}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {!hasPublishedDays
              ? 'Aucune journée n’est publiée pour le moment. Tu n’as rien à faire ni à valider.'
              : isCompleted
                ? 'Tu peux revoir tes journées sans modifier ton accomplissement.'
                : engaged
                  ? 'Reprends exactement là où tu t’es arrêté·e.'
              : isPaused
                ? `Le jour ${resumeDay} restera ton prochain repère.`
                : 'En continuant, tu confirmes simplement l’engagement bien-être ci-contre.'}
          </p>

          <div className="mt-5 grid gap-2">
            {hasPublishedDays ? (
              <Button onClick={startProgramme} loading={busyAction === 'start'} disabled={isBusy} loadingLabel="Démarrage…" size="lg" className="w-full">
                <PlayCircle className="h-5 w-5" aria-hidden="true" />
                {mainLabel}
              </Button>
            ) : (
              <Alert variant="info" title="Journées en préparation">
                Reviens bientôt ou découvre un autre programme disponible.
              </Alert>
            )}
            {engaged && !isCompleted ? (
              <Button onClick={pauseProgramme} loading={busyAction === 'pause'} disabled={isBusy} loadingLabel="Mise en pause…" variant="tertiary" className="w-full">
                <PauseCircle className="h-4 w-4" aria-hidden="true" />
                Mettre en pause
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <Alert variant="danger" title="Action impossible" className="mt-4">
          {error} Réessaie dans un instant ou contacte l’aide si le problème continue.
        </Alert>
      ) : null}
    </LearnerPanel>
  );
}
