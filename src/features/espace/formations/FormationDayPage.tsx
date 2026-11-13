import { ArrowLeft, Clock3, PlayCircle, Quote, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui';
import { routeBuilders } from '@/config/routes';
import { CourseProgress, LearnerHeader, LearnerPage, LearnerPanel, ProgramDetailButton } from '@/features/espace/components';

import { LessonClient } from './components';
import type { LearnerFormField, LessonInitialState } from './components/lesson.types';

type Player = { kind: 'none' | 'youtube' | 'vimeo' | 'file'; src: string };

type FormationDayPageProps = {
  safeSlug: string;
  draftOwnerKey: string;
  unit: {
    unitIndex: number;
    title?: string;
    mantra?: string;
    durationMin?: number;
    videoUrl?: string;
    contentParagraphs?: string[];
    journalFields: LearnerFormField[];
    validationFields: LearnerFormField[];
  };
  currentDay: number;
  completedCount: number;
  totalDays: number;
  remaining: number;
  prevHref: string | null;
  nextHref: string | null;
  initial: LessonInitialState;
};

export function FormationDayPage({ safeSlug, draftOwnerKey, unit, completedCount, totalDays, remaining, prevHref, nextHref, initial }: FormationDayPageProps) {
  const player = detectPlayer(unit.videoUrl);
  const percent = totalDays ? Math.round((completedCount / totalDays) * 100) : 0;

  return (
    <LearnerPage size="full" spacing="relaxed">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={routeBuilders.formation(safeSlug)}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Introduction
        </Link>
        <ProgramDetailButton slug={safeSlug} label="Vue d’ensemble" />
      </div>

      <LearnerHeader
        eyebrow={`Jour ${unit.unitIndex} sur ${totalDays}`}
        title={unit.title ?? `Jour ${unit.unitIndex}`}
        description={
          unit.mantra ? (
            <span className="flex items-start gap-2 font-serif text-base italic sm:text-lg">
              <Quote className="mt-1 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
              {unit.mantra}
            </span>
          ) : undefined
        }
        meta={
          <>
            <Badge variant="secondary">Rituel du jour</Badge>
            {unit.durationMin ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground">
                <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
                Environ {unit.durationMin} min
              </span>
            ) : null}
            <span>{remaining} journée{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}</span>
          </>
        }
      />

      <LearnerPanel variant="muted" padding="sm" aria-label="Progression du parcours">
        <CourseProgress percent={percent} done={completedCount} total={totalDays} />
      </LearnerPanel>

      {player.kind !== 'none' ? (
        <section className="overflow-hidden rounded-3xl border border-border bg-foreground/95 shadow-elevated" aria-label="Vidéo du jour">
          <div className="aspect-video w-full">
            {player.kind === 'file' ? (
              <video className="h-full w-full" src={player.src} controls playsInline preload="metadata" />
            ) : (
              <iframe
                className="h-full w-full"
                src={player.src}
                title="Vidéo du jour"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            )}
          </div>
        </section>
      ) : (
        <section role="status" aria-label="Vidéo de démonstration" className="overflow-hidden rounded-3xl border border-border bg-surface shadow-elevated">
          <div className="relative aspect-video min-h-56 overflow-hidden bg-surface-muted">
            <Image
              src="/images/espace/reset-7-studio.webp"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 768px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/35 to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground sm:p-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-semibold text-primary shadow-soft">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Site de démonstration
              </span>
              <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight text-white">La vidéo n’est pas intégrée à cette démo</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">
                Le texte, la pratique et ton journal restent disponibles. Tu peux poursuivre cette journée sans être bloqué·e.
              </p>
            </div>
          </div>
        </section>
      )}

      {Array.isArray(unit.contentParagraphs) && unit.contentParagraphs.length > 0 ? (
        <LearnerPanel
          title="La pratique du jour"
          description="Prends le temps de lire, puis avance à ton rythme."
          action={
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary" aria-hidden="true">
              <PlayCircle className="h-5 w-5" />
            </span>
          }
        >
          <div className="max-w-4xl space-y-4 text-base leading-relaxed text-foreground/90">
            {unit.contentParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </LearnerPanel>
      ) : null}

      <LessonClient
        key={`${draftOwnerKey}:${safeSlug}:${unit.unitIndex}:${initial.version ?? 'new'}`}
        slug={safeSlug}
        draftOwnerKey={draftOwnerKey}
        day={unit.unitIndex}
        prevHref={prevHref}
        nextHref={nextHref}
        initial={initial}
        journalFields={unit.journalFields}
        validationFields={unit.validationFields}
      />
    </LearnerPage>
  );
}

function detectPlayer(url?: string): Player {
  if (!url?.startsWith('https://')) return { kind: 'none', src: '' };

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'https:') return { kind: 'none', src: '' };
    const host = parsedUrl.hostname.toLowerCase();

    if (host.includes('youtu.be') || host.includes('youtube')) {
      const id = host.includes('youtu.be') ? parsedUrl.pathname.slice(1) : parsedUrl.searchParams.get('v');
      if (id) return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1` };
    }

    if (host.includes('vimeo.com')) {
      const parts = parsedUrl.pathname.split('/').filter(Boolean);
      const id = parts.pop();
      if (id) return { kind: 'vimeo', src: `https://player.vimeo.com/video/${id}` };
    }

    if (/\.(mp4|webm|mov)(\?.*)?$/i.test(parsedUrl.pathname)) return { kind: 'file', src: parsedUrl.toString() };
  } catch {
    return { kind: 'none', src: '' };
  }

  return { kind: 'none', src: '' };
}
