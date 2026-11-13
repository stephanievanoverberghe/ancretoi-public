import 'server-only';

import { requireUser } from '@/server/auth/authz';
import { findDayStatesForUser, findJournalExportUserByEmail, findJournalUserByEmail } from './journal.repository';

export type LearnerDayState = {
    programSlug: string;
    day: number;
    data?: Record<string, string>;
    practiced?: boolean;
    completed?: boolean;
    updatedAt: Date;
};

function asStringRecord(value: unknown): Record<string, string> | undefined {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
            .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    );
}

function asFreeNote(value: unknown): Record<string, string> | undefined {
    const note = asStringRecord(value)?.notes?.trim();
    return note ? { notes: note } : undefined;
}

export async function getLearnerNotesData(nextPath: string, programFilter?: string) {
    const session = await requireUser(nextPath);
    const user = await findJournalUserByEmail(session.email);

    if (!user || user.deletedAt) {
        return {
            userFound: false as const,
            states: [] as LearnerDayState[],
            programOptions: [] as string[],
        };
    }

    const statesRaw = await findDayStatesForUser({ userId: user.id });
    const noteStates = statesRaw.flatMap((state) => {
        const data = asFreeNote(state.data);
        if (!data) return [];

        return [{
            programSlug: state.programSlug,
            day: state.dayIndex,
            data,
            practiced: state.practiced,
            completed: state.completed,
            updatedAt: state.updatedAt,
        }];
    });
    const states = programFilter
        ? noteStates.filter((state) => state.programSlug === programFilter)
        : noteStates;
    const programOptions = Array.from(new Set(noteStates.map((state) => state.programSlug))).sort();

    return {
        userFound: true as const,
        states,
        programOptions,
    };
}

export async function getLearnerJournalData(nextPath: string) {
    const session = await requireUser(nextPath);
    const user = await findJournalUserByEmail(session.email);

    if (!user || user.deletedAt) {
        return {
            userFound: false as const,
            states: [] as LearnerDayState[],
            completedCount: 0,
        };
    }

    const statesRaw = await findDayStatesForUser({ userId: user.id });
    const states = statesRaw
        .map((state) => {
            const data = asStringRecord(state.data) ?? {};
            const journalData = Object.fromEntries(
                Object.entries(data).filter(
                    ([key, value]) => key !== 'notes' && value.trim().length > 0,
                ),
            );

            return {
                programSlug: state.programSlug,
                day: state.dayIndex,
                data: journalData,
                practiced: state.practiced,
                completed: state.completed,
                updatedAt: state.updatedAt,
            };
        })
        .filter(
            (state) =>
                Object.keys(state.data).length > 0 ||
                state.practiced ||
                state.completed,
        );

    return {
        userFound: true as const,
        states,
        completedCount: states.filter((state) => state.completed).length,
    };
}

export async function getLearnerNotesExportData(input: {
    nextPath: string;
    programFilter?: string;
    query?: string;
    scope?: 'journal' | 'notes';
}) {
    const session = await requireUser(input.nextPath);
    const user = await findJournalExportUserByEmail(session.email);

    if (!user || user.deletedAt) {
        return {
            userFound: false as const,
            user: null,
            states: [] as LearnerDayState[],
        };
    }

    const statesRaw = await findDayStatesForUser({ userId: user.id, programFilter: input.programFilter });
    const states = statesRaw.flatMap((state) => {
        const rawData = asStringRecord(state.data) ?? {};
        const data = input.scope === 'notes'
            ? asFreeNote(state.data)
            : Object.fromEntries(
                Object.entries(rawData).filter(
                    ([key, value]) => key !== 'notes' && value.trim().length > 0,
                ),
            );
        if (input.scope === 'notes' && !data) return [];

        return [{
            programSlug: state.programSlug,
            day: state.dayIndex,
            data: data ?? {},
            practiced: state.practiced,
            completed: state.completed,
            updatedAt: state.updatedAt,
        }];
    });

    const query = input.query?.trim().toLowerCase() ?? '';
    const filtered = query ? states.filter((state) => Object.values(state.data ?? {}).some((value) => value?.toLowerCase().includes(query))) : states;

    return {
        userFound: true as const,
        user: {
            id: user.id,
            email: user.email,
        },
        scope: input.scope ?? 'journal',
        states: filtered,
    };
}
