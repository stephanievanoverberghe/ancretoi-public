'use client';

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export type AdminUrlStateCodec<State> = {
    read: (params: URLSearchParams) => State;
    write: (state: State, params: URLSearchParams, previousState: State) => void;
    equals?: (left: State, right: State) => boolean;
};

type UseAdminUrlStateOptions<State> = {
    codec: AdminUrlStateCodec<State>;
    initialState?: State;
    debounceMs?: number;
    commitMode?: 'history' | 'router';
};

function shallowEqual(left: unknown, right: unknown): boolean {
    if (Object.is(left, right)) return true;
    if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;

    const leftRecord = left as Record<string, unknown>;
    const rightRecord = right as Record<string, unknown>;
    const leftKeys = Object.keys(leftRecord);
    const rightKeys = Object.keys(rightRecord);

    return leftKeys.length === rightKeys.length && leftKeys.every((key) => Object.is(leftRecord[key], rightRecord[key]));
}

export function writeAdminUrlParam(params: URLSearchParams, key: string, value: string, fallback = '') {
    if (value && value !== fallback) params.set(key, value);
    else params.delete(key);
}

export function useAdminUrlState<State>({
    codec,
    initialState,
    debounceMs = 220,
    commitMode = 'history',
}: UseAdminUrlStateOptions<State>): [State, Dispatch<SetStateAction<State>>] {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchParamsString = searchParams.toString();
    const codecRef = useRef(codec);
    codecRef.current = codec;

    const [state, setState] = useState<State>(() => initialState ?? codec.read(new URLSearchParams(searchParamsString)));
    const stateRef = useRef(state);
    stateRef.current = state;
    const urlStateRef = useRef(state);

    const observedSearchRef = useRef(searchParamsString);
    const ownWriteRef = useRef<string | null>(null);
    const externalRevisionRef = useRef(0);

    const syncFromSearch = useCallback((search: string, source: 'next' | 'popstate') => {
        observedSearchRef.current = search;

        if (source === 'next' && ownWriteRef.current === search) {
            ownWriteRef.current = null;
            return;
        }

        ownWriteRef.current = null;
        externalRevisionRef.current += 1;
        const nextState = codecRef.current.read(new URLSearchParams(search));
        urlStateRef.current = nextState;
        const equals = codecRef.current.equals ?? shallowEqual;
        setState((current) => (equals(current, nextState) ? current : nextState));
    }, []);

    useEffect(() => {
        if (searchParamsString === observedSearchRef.current) return;
        syncFromSearch(searchParamsString, 'next');
    }, [searchParamsString, syncFromSearch]);

    useEffect(() => {
        const onPopState = () => syncFromSearch(window.location.search.slice(1), 'popstate');
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [syncFromSearch]);

    useEffect(() => {
        const scheduledRevision = externalRevisionRef.current;
        const timer = window.setTimeout(() => {
            if (scheduledRevision !== externalRevisionRef.current) return;

            const currentSearch = window.location.search.slice(1);
            const nextParams = new URLSearchParams(currentSearch);
            codecRef.current.write(stateRef.current, nextParams, urlStateRef.current);
            const nextSearch = nextParams.toString();
            urlStateRef.current = stateRef.current;
            if (nextSearch === currentSearch) return;

            ownWriteRef.current = nextSearch;
            const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
            window.history.replaceState(window.history.state, '', nextUrl);
            if (commitMode === 'router') {
                window.setTimeout(() => router.replace(nextUrl, { scroll: false }), 0);
            }
        }, debounceMs);

        return () => window.clearTimeout(timer);
    }, [commitMode, debounceMs, router, state]);

    return [state, setState];
}
