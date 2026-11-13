import type React from 'react';

export type EnrollmentRowClient = {
    _id: string;
    programTitle: string;
    programSlug: string;
    coverUrl?: string | null;
    level?: 'Basique' | 'Cible' | 'Premium' | null;
    status: 'active' | 'completed' | 'paused' | 'canceled';
    unitsCount: number;
    unitsDone: number;
    progressPct: number;
    currentDay?: number | null;
    updatedAt?: string | Date | null;
};

export type UserDocLite = {
    _id: string;
    name?: string | null;
    email: string;
    avatarUrl?: string | null;
    theme?: 'system' | 'light' | 'dark';
    marketing?: boolean;
    productUpdates?: boolean;
    createdAt?: string | Date | null;
    passwordChangedAt?: string | Date | null;
};

export type StatusBreakdown = { active: number; completed: number; paused: number; canceled: number };

export type UserStats = {
    enrollCount: number;
    avgPercent: number;
    totalUnitsDone: number;
    practicedDays: number;
    firstStartAt?: string | Date | null;
    dailyPace: number;
    status: StatusBreakdown;
};

export type UserTabsProps = {
    user: UserDocLite;
    enrolls: EnrollmentRowClient[];
    stats: UserStats;
    IdentityExtraSlot?: React.ReactNode;
    PreferencesExtraSlot?: React.ReactNode;
};

export type TabKey = 'identite' | 'preferences' | 'inscriptions' | 'stats';
