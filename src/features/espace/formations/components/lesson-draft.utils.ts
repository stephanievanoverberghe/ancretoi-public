type LessonDraftFieldUpdate = {
  revision: number;
  updatedAt: string;
};

type LessonDraft = {
  version: 1;
  ownerKey: string;
  tabId: string;
  slug: string;
  day: number;
  revision: number;
  data: Record<string, string>;
  practiced: boolean;
  baseVersion: string | null;
  fieldUpdates: Record<string, LessonDraftFieldUpdate>;
  practicedUpdate: LessonDraftFieldUpdate | null;
  updatedAt: string;
  expiresAt: string;
};

type LessonDraftReadResult = {
  draft: LessonDraft | null;
  sourceKeys: string[];
};

const LESSON_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

let currentTabId: string | null = null;

function getLessonDraftPrefix(ownerKey: string, slug: string, day: number) {
  return `ancre-toi:lesson-draft:${encodeURIComponent(ownerKey)}:${encodeURIComponent(slug)}:${day}:`;
}

function isFieldUpdate(value: unknown): value is LessonDraftFieldUpdate {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const update = value as Partial<LessonDraftFieldUpdate>;
  return (
    Number.isSafeInteger(update.revision) &&
    Number(update.revision) >= 1 &&
    typeof update.updatedAt === 'string' &&
    Number.isFinite(Date.parse(update.updatedAt))
  );
}

function compareFieldUpdate(
  left: LessonDraftFieldUpdate,
  leftTabId: string,
  right: LessonDraftFieldUpdate,
  rightTabId: string,
) {
  const dateDifference = Date.parse(left.updatedAt) - Date.parse(right.updatedAt);
  if (dateDifference !== 0) return dateDifference;
  if (left.revision !== right.revision) return left.revision - right.revision;
  return leftTabId.localeCompare(rightTabId);
}

export function getLessonTabId() {
  if (!currentTabId) currentTabId = window.crypto.randomUUID();
  return currentTabId;
}

function createLessonDraftKey(
  ownerKey: string,
  slug: string,
  day: number,
  tabId: string,
) {
  return `${getLessonDraftPrefix(ownerKey, slug, day)}${encodeURIComponent(tabId)}:${window.crypto.randomUUID()}`;
}

function parseLessonDraft(
  raw: string,
  ownerKey: string,
  slug: string,
  day: number,
): LessonDraft | null {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const draft = value as Partial<LessonDraft>;
  if (
    draft.version !== 1 ||
    draft.ownerKey !== ownerKey ||
    typeof draft.tabId !== 'string' ||
    !draft.tabId ||
    draft.slug !== slug ||
    draft.day !== day ||
    typeof draft.practiced !== 'boolean' ||
    !(draft.baseVersion === null || typeof draft.baseVersion === 'string') ||
    !draft.fieldUpdates ||
    typeof draft.fieldUpdates !== 'object' ||
    Array.isArray(draft.fieldUpdates) ||
    !Object.values(draft.fieldUpdates).every(isFieldUpdate) ||
    !(draft.practicedUpdate === null || isFieldUpdate(draft.practicedUpdate)) ||
    typeof draft.updatedAt !== 'string' ||
    !Number.isFinite(Date.parse(draft.updatedAt)) ||
    typeof draft.expiresAt !== 'string' ||
    !Number.isFinite(Date.parse(draft.expiresAt)) ||
    !Number.isSafeInteger(draft.revision) ||
    Number(draft.revision) < 1 ||
    !draft.data ||
    typeof draft.data !== 'object' ||
    Array.isArray(draft.data)
  ) {
    return null;
  }

  const data = Object.fromEntries(
    Object.entries(draft.data).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );
  const fieldUpdates = Object.fromEntries(
    Object.entries(draft.fieldUpdates).filter(
      (entry): entry is [string, LessonDraftFieldUpdate] =>
        Object.hasOwn(data, entry[0]) && isFieldUpdate(entry[1]),
    ),
  );

  return {
    version: 1,
    ownerKey,
    tabId: draft.tabId,
    slug,
    day,
    revision: Number(draft.revision),
    data,
    practiced: draft.practiced,
    baseVersion: draft.baseVersion,
    fieldUpdates,
    practicedUpdate: draft.practicedUpdate ?? null,
    updatedAt: draft.updatedAt,
    expiresAt: draft.expiresAt,
  };
}

/** Rassemble les dernières modifications de chaque champ, sans confondre les onglets. */
export function readLessonDraft(
  ownerKey: string,
  slug: string,
  day: number,
): LessonDraftReadResult {
  try {
    const prefix = getLessonDraftPrefix(ownerKey, slug, day);
    const sources: Array<{ key: string; draft: LessonDraft }> = [];
    const expiredKeys: string[] = [];

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key?.startsWith(prefix)) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;

      try {
        const draft = parseLessonDraft(raw, ownerKey, slug, day);
        if (!draft || Date.parse(draft.expiresAt) <= Date.now()) {
          expiredKeys.push(key);
        } else {
          sources.push({ key, draft });
        }
      } catch {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) window.localStorage.removeItem(key);
    if (sources.length === 0) return { draft: null, sourceKeys: [] };

    sources.sort((left, right) =>
      left.draft.updatedAt.localeCompare(right.draft.updatedAt),
    );
    const latest = sources.at(-1)!.draft;
    const fieldWinners = new Map<
      string,
      { update: LessonDraftFieldUpdate; tabId: string; value: string }
    >();
    let practicedWinner: {
      update: LessonDraftFieldUpdate;
      tabId: string;
      value: boolean;
    } | null = null;

    for (const { draft } of sources) {
      for (const [key, update] of Object.entries(draft.fieldUpdates)) {
        const current = fieldWinners.get(key);
        if (
          !current ||
          compareFieldUpdate(update, draft.tabId, current.update, current.tabId) > 0
        ) {
          fieldWinners.set(key, { update, tabId: draft.tabId, value: draft.data[key] });
        }
      }

      if (
        draft.practicedUpdate &&
        (!practicedWinner ||
          compareFieldUpdate(
            draft.practicedUpdate,
            draft.tabId,
            practicedWinner.update,
            practicedWinner.tabId,
          ) > 0)
      ) {
        practicedWinner = {
          update: draft.practicedUpdate,
          tabId: draft.tabId,
          value: draft.practiced,
        };
      }
    }

    return {
      draft: {
        ...latest,
        revision: Math.max(...sources.map(({ draft }) => draft.revision)),
        data: Object.fromEntries(
          [...fieldWinners].map(([key, winner]) => [key, winner.value]),
        ),
        practiced: practicedWinner?.value ?? latest.practiced,
        fieldUpdates: Object.fromEntries(
          [...fieldWinners].map(([key, winner]) => [key, winner.update]),
        ),
        practicedUpdate: practicedWinner?.update ?? null,
      },
      sourceKeys: sources.map(({ key }) => key),
    };
  } catch {
    return { draft: null, sourceKeys: [] };
  }
}

/**
 * Écrit d'abord un snapshot immuable, puis retire le précédent. Une autre tab ne peut
 * donc jamais faire disparaître une modification plus récente en nettoyant une vieille clé.
 */
export function writeLessonDraft(
  previousKey: string | null,
  draft: Omit<LessonDraft, 'updatedAt' | 'expiresAt'>,
) {
  try {
    const now = Date.now();
    const key = createLessonDraftKey(
      draft.ownerKey,
      draft.slug,
      draft.day,
      draft.tabId,
    );
    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...draft,
        updatedAt: new Date(now).toISOString(),
        expiresAt: new Date(now + LESSON_DRAFT_TTL_MS).toISOString(),
      }),
    );
    if (previousKey && previousKey !== key) window.localStorage.removeItem(previousKey);
    return key;
  } catch {
    // Le garde-fou beforeunload reste actif si le stockage local est indisponible.
    return previousKey;
  }
}

export function removeLessonDrafts(keys: Iterable<string>) {
  try {
    for (const key of new Set(keys)) window.localStorage.removeItem(key);
  } catch {
    // Une indisponibilité du stockage ne doit pas invalider une sauvegarde serveur réussie.
  }
}

export type { LessonDraft, LessonDraftFieldUpdate };
