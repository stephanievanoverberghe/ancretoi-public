'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LifeBuoy,
  LogOut,
  NotebookPen,
  PauseCircle,
  RotateCcw,
  TriangleAlert,
} from 'lucide-react';

import { Alert, Button, LinkButton, Textarea } from '@/components/ui';
import { FullscreenModal } from '@/components/ui/overlays';
import { espaceRoutes, publicRoutes, routeBuilders } from '@/config/routes';
import {
  LearnerActionBar,
  LearnerPanel,
  LearnerSaveStatus,
  type LearnerSaveState,
} from '@/features/espace/components';
import { cn } from '@/lib/cn';

import {
  getLessonTabId,
  readLessonDraft,
  removeLessonDrafts,
  writeLessonDraft,
  type LessonDraftFieldUpdate,
} from './lesson-draft.utils';
import type { LearnerFormField, LessonInitialState } from './lesson.types';
import { LessonStructuredFields } from './LessonStructuredFields';

type LessonSaveState = 'clean' | 'dirty' | 'saving' | 'saved' | 'offline' | 'error';
type LocalSaveState = Exclude<LessonSaveState, 'offline'>;

type StatePatch = {
  data?: Record<string, string>;
  practiced?: boolean;
  completed?: boolean;
};

type StateResponse = {
  currentDay?: number;
  status?: 'active' | 'paused' | 'completed';
  version?: string;
};

type StateConflictResponse = {
  error: 'STALE_STATE';
  current: {
    data: Record<string, string>;
    practiced: boolean;
    completed: boolean;
    version: string;
  } | null;
};

const SAVE_ERROR_MESSAGE = "Impossible d'enregistrer pour le moment.";
const OFFLINE_ERROR_MESSAGE = 'Tu es hors connexion. Tes changements restent sur cet écran et seront enregistrés au retour du réseau.';
const PAUSE_ERROR_MESSAGE = 'Impossible de mettre le parcours en pause.';
const MERGED_CONFLICT_MESSAGE = 'Des changements faits ailleurs ont été réunis avec les tiens. La sauvegarde reprend.';

const saveStatusMap = {
  clean: 'idle',
  dirty: 'dirty',
  saving: 'saving',
  saved: 'saved',
  offline: 'offline',
  error: 'error',
} satisfies Record<LessonSaveState, LearnerSaveState>;

function subscribeToNetworkStatus(onStoreChange: () => void) {
  window.addEventListener('online', onStoreChange);
  window.addEventListener('offline', onStoreChange);

  return () => {
    window.removeEventListener('online', onStoreChange);
    window.removeEventListener('offline', onStoreChange);
  };
}

function getNetworkSnapshot() {
  return navigator.onLine;
}

function getServerNetworkSnapshot() {
  return true;
}

export function LessonClient({
  slug,
  draftOwnerKey,
  day,
  prevHref,
  nextHref,
  initial,
  journalFields,
  validationFields,
}: {
  slug: string;
  draftOwnerKey: string;
  day: number;
  prevHref: string | null;
  nextHref: string | null;
  initial: LessonInitialState;
  journalFields: LearnerFormField[];
  validationFields: LearnerFormField[];
}) {
  const router = useRouter();
  const [draftTabId, setDraftTabId] = useState<string | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const draftIdentity = useMemo(
    () => JSON.stringify([draftOwnerKey, slug, day]),
    [day, draftOwnerKey, slug],
  );
  const [data, setData] = useState<Record<string, string>>(initial.data);
  const [practiced, setPracticed] = useState(initial.practiced);
  const [completed, setCompleted] = useState(initial.completed);
  const [saveState, setSaveState] = useState<LocalSaveState>('clean');
  const [lastSaved, setLastSaved] = useState<string | null>(initial.lastSavedAt);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [notesOpen, setNotesOpen] = useState(Object.keys(initial.data).length > 0);
  const dataRef = useRef(initial.data);
  const practicedRef = useRef(initial.practiced);
  const revisionRef = useRef(0);
  const savedRevisionRef = useRef(0);
  const serverVersionRef = useRef<string | null>(initial.version);
  const dirtyFieldRevisionsRef = useRef(
    new Map<string, LessonDraftFieldUpdate>(),
  );
  const practicedRevisionRef = useRef<LessonDraftFieldUpdate | null>(null);
  const draftKeyRef = useRef<string | null>(null);
  const draftSourceKeysRef = useRef<string[]>([]);
  const hydratedDraftIdentityRef = useRef<string | null>(null);
  const mutationQueueRef = useRef<Promise<void>>(Promise.resolve());
  const actionLockRef = useRef(false);
  const isOnline = useSyncExternalStore(
    subscribeToNetworkStatus,
    getNetworkSnapshot,
    getServerNetworkSnapshot,
  );
  const currentSaveState: LessonSaveState = isOnline ? saveState : 'offline';

  const isFirstDay = day <= 1;
  const backHref = prevHref ?? routeBuilders.formation(slug);
  const backLabel = isFirstDay ? 'Introduction' : 'Précédent';
  const isDraftReady =
    draftReady && hydratedDraftIdentityRef.current === draftIdentity;
  const isBusy =
    !isDraftReady || validating || pausing || leaving || reopening || navigating;

  const storeDraft = useCallback(
    (nextData: Record<string, string>, nextPracticed: boolean, revision: number) => {
      if (!draftTabId) return;
      draftKeyRef.current = writeLessonDraft(draftKeyRef.current, {
        version: 1,
        ownerKey: draftOwnerKey,
        tabId: draftTabId,
        slug,
        day,
        revision,
        data: nextData,
        practiced: nextPracticed,
        baseVersion: serverVersionRef.current,
        fieldUpdates: Object.fromEntries(dirtyFieldRevisionsRef.current),
        practicedUpdate: practicedRevisionRef.current,
      });
    },
    [day, draftOwnerKey, draftTabId, slug],
  );

  const markDirty = useCallback(
    (
      nextData: Record<string, string>,
      nextPracticed: boolean,
      change: { key?: string; practiced?: boolean },
    ) => {
      const revision = revisionRef.current + 1;
      const update = { revision, updatedAt: new Date().toISOString() };
      revisionRef.current = revision;
      if (change.key) dirtyFieldRevisionsRef.current.set(change.key, update);
      if (change.practiced) practicedRevisionRef.current = update;
      storeDraft(nextData, nextPracticed, revision);
      setSaveError(null);
      setActionError(null);
      setSaveState('dirty');
      return revision;
    },
    [storeDraft],
  );

  const executeStateRequest = useCallback(
    async (patch: StatePatch, revision = revisionRef.current): Promise<StateResponse | null> => {
      if (!getNetworkSnapshot()) {
        setSaveState('dirty');
        setSaveError(OFFLINE_ERROR_MESSAGE);
        return null;
      }

      setSaveError(null);
      setSaveState('saving');

      try {
        const response = await fetch('/api/learn/state', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          keepalive: true,
          body: JSON.stringify({
            slug,
            day,
            patch,
            expectedVersion: serverVersionRef.current,
          }),
        });

        const payload = (await response.json().catch(() => ({}))) as Partial<
          StateResponse & StateConflictResponse
        >;
        if (response.status === 409 && payload.error === 'STALE_STATE') {
          const current = payload.current ?? null;
          const mergedData = { ...(current?.data ?? {}) };

          for (const key of dirtyFieldRevisionsRef.current.keys()) {
            if (Object.hasOwn(dataRef.current, key)) mergedData[key] = dataRef.current[key];
          }

          const mergedPracticed = practicedRevisionRef.current !== null
            ? practicedRef.current
            : (current?.practiced ?? false);
          dataRef.current = mergedData;
          practicedRef.current = mergedPracticed;
          serverVersionRef.current = current?.version ?? null;
          setData(mergedData);
          setPracticed(mergedPracticed);
          setCompleted(current?.completed ?? false);
          storeDraft(mergedData, mergedPracticed, revisionRef.current);
          setSaveState('dirty');
          setSaveError(MERGED_CONFLICT_MESSAGE);
          return null;
        }

        if (!response.ok || !payload.version) throw new Error(SAVE_ERROR_MESSAGE);

        const result = payload as StateResponse;
        serverVersionRef.current = result.version ?? serverVersionRef.current;
        savedRevisionRef.current = Math.max(savedRevisionRef.current, revision);
        for (const [key, fieldUpdate] of dirtyFieldRevisionsRef.current) {
          if (fieldUpdate.revision <= revision) {
            dirtyFieldRevisionsRef.current.delete(key);
          }
        }
        if (
          practicedRevisionRef.current !== null &&
          practicedRevisionRef.current.revision <= revision
        ) {
          practicedRevisionRef.current = null;
        }
        setLastSaved(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
        if (savedRevisionRef.current >= revisionRef.current) {
          setSaveState('saved');
          removeLessonDrafts([
            ...draftSourceKeysRef.current,
            ...(draftKeyRef.current ? [draftKeyRef.current] : []),
          ]);
          draftSourceKeysRef.current = [];
          draftKeyRef.current = null;
        } else {
          const previousDraftKey = draftKeyRef.current;
          storeDraft(dataRef.current, practicedRef.current, revisionRef.current);
          if (
            draftKeyRef.current &&
            draftKeyRef.current !== previousDraftKey
          ) {
            removeLessonDrafts(draftSourceKeysRef.current);
            draftSourceKeysRef.current = [];
          }
          setSaveState('dirty');
        }
        return result;
      } catch {
        setSaveState(revision < revisionRef.current ? 'dirty' : 'error');
        setSaveError(SAVE_ERROR_MESSAGE);
        return null;
      }
    },
    [day, slug, storeDraft],
  );

  const persistState = useCallback(
    (patch: StatePatch, revision = revisionRef.current) => {
      const run = () => {
        const latestRevision = Math.max(revision, revisionRef.current);
        return executeStateRequest(
          {
            ...patch,
            ...(patch.data ? { data: dataRef.current } : {}),
            ...(typeof patch.practiced === 'boolean'
              ? { practiced: practicedRef.current }
              : {}),
          },
          latestRevision,
        );
      };
      const request = mutationQueueRef.current.then(run, run);
      mutationQueueRef.current = request.then(
        () => undefined,
        () => undefined,
      );
      return request;
    },
    [executeStateRequest],
  );

  const updateText = useCallback(
    (key: string, value: string) => {
      if (actionLockRef.current) return;
      const nextData = { ...dataRef.current, [key]: value };
      dataRef.current = nextData;
      setData(nextData);
      markDirty(nextData, practicedRef.current, { key });
    },
    [markDirty],
  );

  useEffect(() => {
    setDraftTabId(getLessonTabId());
  }, []);

  useEffect(() => {
    if (!draftTabId) return;
    if (hydratedDraftIdentityRef.current === draftIdentity) {
      setDraftReady(true);
      return;
    }
    setDraftReady(false);
    hydratedDraftIdentityRef.current = draftIdentity;
    draftKeyRef.current = null;

    const { draft, sourceKeys } = readLessonDraft(draftOwnerKey, slug, day);
    draftSourceKeysRef.current = sourceKeys;
    const nextData = { ...initial.data };
    for (const key of Object.keys(draft?.fieldUpdates ?? {})) {
      if (Object.hasOwn(draft?.data ?? {}, key)) nextData[key] = draft!.data[key];
    }
    const nextPracticed = draft?.practicedUpdate ? draft.practiced : initial.practiced;

    dataRef.current = nextData;
    practicedRef.current = nextPracticed;
    revisionRef.current = draft?.revision ?? 0;
    savedRevisionRef.current = 0;
    serverVersionRef.current = initial.version;
    dirtyFieldRevisionsRef.current = new Map(
      Object.entries(draft?.fieldUpdates ?? {}),
    );
    practicedRevisionRef.current = draft?.practicedUpdate ?? null;
    if (draft) storeDraft(nextData, nextPracticed, draft.revision);
    setData(nextData);
    setPracticed(nextPracticed);
    setCompleted(initial.completed);
    setLastSaved(initial.lastSavedAt);
    setNotesOpen(Object.keys(nextData).length > 0);
    setSaveError(null);
    setActionError(null);
    setSaveState(draft ? 'dirty' : 'clean');
    setDraftReady(true);
  }, [day, draftIdentity, draftOwnerKey, draftTabId, initial.completed, initial.data, initial.lastSavedAt, initial.practiced, initial.version, slug, storeDraft]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (savedRevisionRef.current >= revisionRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (currentSaveState !== 'dirty') return;

    const revision = revisionRef.current;
    const snapshot = { data: dataRef.current, practiced: practicedRef.current };
    const timer = window.setTimeout(() => {
      void persistState(snapshot, revision);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [currentSaveState, data, persistState, practiced]);

  const missingRequiredFields = useMemo(
    () =>
      [...journalFields, ...validationFields].filter(
        (field) => field.required && !(data[field.key] ?? '').trim(),
      ),
    [data, journalFields, validationFields],
  );

  const validationBlockReason = useMemo(() => {
    if (!isDraftReady) return 'Récupération de ton brouillon…';
    if (completed) return 'Cette journée est déjà validée. Tu peux continuer vers la suite du parcours.';
    if (currentSaveState === 'offline') return 'Reconnecte-toi pour enregistrer et valider cette journée.';
    if (currentSaveState === 'error') return 'Réessaie la sauvegarde avant de valider cette journée.';
    if (currentSaveState === 'saving') return 'La sauvegarde est en cours. La validation sera disponible juste après.';
    if (!practiced) return 'Coche « Pratique faite » après avoir terminé la pratique du jour.';
    if (missingRequiredFields.length > 0) {
      const labels = missingRequiredFields.map((field) => field.label).join(', ');
      return `Complète ${missingRequiredFields.length === 1 ? 'la réponse requise' : 'les réponses requises'} : ${labels}.`;
    }
    return null;
  }, [completed, currentSaveState, isDraftReady, missingRequiredFields, practiced]);

  const canValidate = validationBlockReason === null && !validating;

  const ensureLatestSaved = useCallback(async () => {
    await mutationQueueRef.current;
    if (savedRevisionRef.current >= revisionRef.current) return true;

    const revision = revisionRef.current;
    const result = await persistState(
      { data: dataRef.current, practiced: practicedRef.current },
      revision,
    );
    return result !== null && savedRevisionRef.current >= revisionRef.current;
  }, [persistState]);

  const navigateSafely = useCallback(
    async (href: string) => {
      if (actionLockRef.current) return false;
      actionLockRef.current = true;
      setNavigating(true);
      setActionError(null);

      if (!(await ensureLatestSaved())) {
        setActionError('Reste sur cette page jusqu\'à ce que tes changements soient enregistrés.');
        actionLockRef.current = false;
        setNavigating(false);
        return false;
      }

      router.push(href);
      return true;
    },
    [ensureLatestSaved, router],
  );

  useEffect(() => {
    const interceptInternalNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      if (actionLockRef.current) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (savedRevisionRef.current >= revisionRef.current) return;

      event.preventDefault();
      event.stopPropagation();
      void navigateSafely(`${url.pathname}${url.search}${url.hash}`);
    };

    document.addEventListener('click', interceptInternalNavigation, true);
    return () => document.removeEventListener('click', interceptInternalNavigation, true);
  }, [navigateSafely]);

  useEffect(() => {
    const flushLatestRevision = () => {
      if (
        savedRevisionRef.current >= revisionRef.current ||
        !getNetworkSnapshot()
      ) {
        return;
      }

      void persistState(
        { data: dataRef.current, practiced: practicedRef.current },
        revisionRef.current,
      );
    };
    const flushWhenHidden = () => {
      if (document.visibilityState === 'hidden') flushLatestRevision();
    };

    window.addEventListener('popstate', flushLatestRevision);
    window.addEventListener('pagehide', flushLatestRevision);
    document.addEventListener('visibilitychange', flushWhenHidden);
    return () => {
      window.removeEventListener('popstate', flushLatestRevision);
      window.removeEventListener('pagehide', flushLatestRevision);
      document.removeEventListener('visibilitychange', flushWhenHidden);
    };
  }, [persistState]);

  const retryLatestSave = useCallback(async () => {
    const revision = revisionRef.current;
    const result = await persistState(
      { data: dataRef.current, practiced: practicedRef.current },
      revision,
    );
    return result !== null && savedRevisionRef.current >= revisionRef.current;
  }, [persistState]);

  async function onTogglePracticed(next: boolean) {
    if (actionLockRef.current) return;
    if (!next && completed) {
      setReopenOpen(true);
      return;
    }

    practicedRef.current = next;
    setPracticed(next);
    const revision = markDirty(dataRef.current, next, { practiced: true });
    await persistState({ data: dataRef.current, practiced: next }, revision);
  }

  async function onConfirmReopen() {
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    setReopening(true);
    setActionError(null);
    const previousPracticed = practicedRef.current;
    practicedRef.current = false;
    const result = await persistState(
      { data: dataRef.current, practiced: false, completed: false },
      revisionRef.current,
    );

    if (result) {
      practicedRef.current = false;
      setPracticed(false);
      setCompleted(false);
      setReopenOpen(false);
    } else {
      practicedRef.current = previousPracticed;
    }
    actionLockRef.current = false;
    setReopening(false);
  }

  async function onValidate() {
    if (!canValidate || actionLockRef.current) return;
    actionLockRef.current = true;
    setValidating(true);
    setActionError(null);

    const revision = revisionRef.current;
    const result = await persistState(
      { data: dataRef.current, practiced: true, completed: true },
      revision,
    );

    if (!result || savedRevisionRef.current < revisionRef.current) {
      actionLockRef.current = false;
      setValidating(false);
      return;
    }

    setCompleted(true);
    if (result.status === 'completed') {
      router.push(espaceRoutes.bilan);
    } else if (result.currentDay) {
      router.push(routeBuilders.formationJour(slug, result.currentDay));
    } else if (nextHref) {
      router.push(nextHref);
    } else {
      router.push(espaceRoutes.bilan);
    }
  }

  async function onPause() {
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    setPausing(true);
    setActionError(null);

    if (!(await ensureLatestSaved())) {
      setActionError('La pause est disponible dès que tes changements sont enregistrés.');
      actionLockRef.current = false;
      setPausing(false);
      return;
    }

    try {
      const response = await fetch('/api/learn/intro', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, engaged: false }),
      });

      if (!response.ok) throw new Error(PAUSE_ERROR_MESSAGE);
      if (savedRevisionRef.current < revisionRef.current) {
        throw new Error(SAVE_ERROR_MESSAGE);
      }
      router.push(routeBuilders.formation(slug));
    } catch {
      setActionError(PAUSE_ERROR_MESSAGE);
      actionLockRef.current = false;
      setPausing(false);
    }
  }

  async function onQuit() {
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    setLeaving(true);
    setActionError(null);

    if (!(await ensureLatestSaved())) {
      setActionError('Reste sur cette page jusqu’à ce que tes changements soient enregistrés.');
      actionLockRef.current = false;
      setLeaving(false);
      return;
    }
    router.push(routeBuilders.formation(slug));
  }

  const saveStatusDetail =
    lastSaved && (currentSaveState === 'clean' || currentSaveState === 'saved')
      ? `à ${lastSaved}`
      : undefined;

  return (
    <section className="space-y-5" aria-label={`Pratique du jour ${day}`}>
      <LearnerPanel
        title="Ton espace de pratique"
        description="Avance à ton rythme. Tes réponses sont enregistrées automatiquement."
      >
        <label
          className={cn(
            'flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-colors sm:p-4',
            practiced
              ? 'border-success/30 bg-success/10'
              : 'border-border bg-background hover:border-primary/30',
          )}
        >
          <input
            type="checkbox"
            className="size-5 shrink-0 cursor-pointer accent-[var(--primary)]"
            checked={practiced}
            disabled={isBusy || currentSaveState === 'saving'}
            onChange={(event) => void onTogglePracticed(event.target.checked)}
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">Pratique faite</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Coche quand tu as terminé la pratique du jour.
            </span>
          </span>
          {practiced ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
          ) : null}
        </label>

        <div className="mt-5 border-t border-border pt-5">
          <button
            type="button"
            disabled={isBusy}
            aria-expanded={notesOpen}
            aria-controls="lesson-free-notes"
            onClick={() => setNotesOpen((value) => !value)}
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-1 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <NotebookPen className="h-4 w-4 text-primary" aria-hidden="true" />
            {notesOpen ? 'Masquer la note libre' : 'Ajouter une note libre'}
          </button>
          {notesOpen ? (
            <div id="lesson-free-notes" className="mt-3">
              <label htmlFor="lesson-notes" className="sr-only">
                Note libre du jour
              </label>
              <Textarea
                id="lesson-notes"
                rows={4}
                disabled={isBusy}
                placeholder="Ce que tu ressens, ce que tu veux garder du jour…"
                value={data.notes ?? ''}
                onChange={(event) => updateText('notes', event.target.value)}
              />
              <div className="mt-1 text-right text-xs tabular-nums text-muted-foreground">
                {(data.notes ?? '').trim().length} caractères
              </div>
            </div>
          ) : null}
        </div>

        {journalFields.length > 0 ? (
          <LessonStructuredFields
            id="guided-journal"
            title="Ton journal guidé"
            description="Prends quelques mots pour garder une trace de cette journée."
            fields={journalFields}
            data={data}
            disabled={isBusy}
            onChange={updateText}
          />
        ) : null}

        {validationFields.length > 0 ? (
          <LessonStructuredFields
            id="daily-checkpoint"
            title="Ton point du jour"
            description="Observe simplement où tu en es, sans chercher une bonne réponse."
            fields={validationFields}
            data={data}
            disabled={isBusy}
            onChange={updateText}
          />
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <LearnerSaveStatus
            state={saveStatusMap[currentSaveState]}
            label={currentSaveState === 'clean' ? 'Aucune modification' : undefined}
            detail={saveStatusDetail}
          />
          {(currentSaveState === 'error' || currentSaveState === 'offline') ? (
            <Button
              variant="tertiary"
              size="sm"
              disabled={currentSaveState === 'offline' || isBusy}
              onClick={() => void retryLatestSave()}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Réessayer
            </Button>
          ) : null}
        </div>
      </LearnerPanel>

      {saveError ? (
        <Alert
          variant={currentSaveState === 'offline' ? 'warning' : 'danger'}
          title="Sauvegarde interrompue"
          icon={<TriangleAlert className="h-5 w-5" />}
        >
          {saveError}
        </Alert>
      ) : null}

      <LearnerPanel
        as="aside"
        variant="muted"
        padding="sm"
        aria-label="Actions de sécurité et de sortie"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Besoin de souffler ?</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Tu peux faire une pause, demander de l’aide ou quitter sans perdre tes réponses enregistrées.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0">
            <Button
              variant="ghost"
              size="sm"
              loading={pausing}
              loadingLabel="Mise en pause"
              disabled={isBusy || currentSaveState === 'saving'}
              onClick={() => void onPause()}
              leftIcon={<PauseCircle className="h-4 w-4" />}
            >
              Pause
            </Button>
            <LinkButton
              href={publicRoutes.aide}
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              size="sm"
              aria-label="Ouvrir l’aide dans un nouvel onglet"
              leftIcon={<LifeBuoy className="h-4 w-4" />}
            >
              Aide
            </LinkButton>
            <Button
              variant="ghost"
              size="sm"
              loading={leaving}
              loadingLabel="Sortie"
              disabled={isBusy || currentSaveState === 'saving'}
              onClick={() => void onQuit()}
              leftIcon={<LogOut className="h-4 w-4" />}
            >
              Quitter
            </Button>
          </div>
        </div>
      </LearnerPanel>

      {actionError ? (
        <Alert variant="warning" title="Action suspendue" icon={<TriangleAlert className="h-5 w-5" />}>
          {actionError}
        </Alert>
      ) : null}

      <div
        id="lesson-validation-status"
        role="status"
        aria-live="polite"
        className={cn(
          'rounded-2xl border px-4 py-3 text-sm leading-relaxed',
          validationBlockReason
            ? 'border-warning/25 bg-warning/10 text-foreground'
            : 'border-success/25 bg-success/10 text-foreground',
        )}
      >
        {validationBlockReason ?? 'Tout est prêt. Tu peux valider cette journée.'}
      </div>

      <LearnerActionBar
        label={`Navigation et validation du jour ${day}`}
        leading={
          <Button
            variant="tertiary"
            size="sm"
            aria-label={backLabel}
            loading={navigating}
            loadingLabel="Navigation"
            onClick={() => void navigateSafely(backHref)}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">{backLabel}</span>
          </Button>
        }
        status={
          <LearnerSaveStatus
            state={saveStatusMap[currentSaveState]}
            label={currentSaveState === 'clean' ? 'Aucune modification' : undefined}
            detail={saveStatusDetail}
          />
        }
        actions={
          completed ? (
            <Button
              size="sm"
              loading={navigating}
              loadingLabel="Navigation"
              onClick={() => void navigateSafely(nextHref ?? espaceRoutes.bilan)}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {nextHref ? 'Jour suivant' : 'Voir mon bilan'}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => void onValidate()}
              disabled={!canValidate || isBusy}
              loading={validating}
              loadingLabel="Validation"
              aria-describedby="lesson-validation-status"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              {nextHref ? 'Valider le jour' : 'Terminer'}
            </Button>
          )
        }
      />

      <FullscreenModal
        open={reopenOpen}
        onClose={() => !reopening && setReopenOpen(false)}
        title="Rouvrir cette pratique ?"
        closeOnBackdrop={!reopening}
        closeOnEsc={!reopening}
        showCloseButton={!reopening}
        footer={
          <>
            <Button
              variant="ghost"
              disabled={reopening}
              onClick={() => setReopenOpen(false)}
            >
              Garder validée
            </Button>
            <Button
              variant="tertiary"
              loading={reopening}
              loadingLabel="Réouverture"
              onClick={() => void onConfirmReopen()}
            >
              Rouvrir la pratique
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          La journée ne sera plus marquée comme terminée. Tes réponses restent enregistrées et tu pourras la valider à nouveau quand tu le souhaites.
        </p>
        {saveError ? (
          <Alert className="mt-4" variant="danger" title="Réouverture impossible">
            {saveError}
          </Alert>
        ) : null}
      </FullscreenModal>
    </section>
  );
}
