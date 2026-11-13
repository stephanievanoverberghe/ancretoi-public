export type UiUser = {
    _id: string;
    name: string | null;
    email: string;
    role: 'user' | 'admin';
    createdAtIso: string;
    avatarUrl: string | null;
    isSelf: boolean;
    isArchived: boolean;
    isSuspended: boolean;
    lastLoginAtIso: string | null;
    lastLearningActivityAtIso: string | null;
    enrollCount: number;
    activePrograms: number;
    completedPrograms: number;
    averageProgressPct: number;
};

export type UiEnrollment = {
    programSlug: string;
    programTitle: string;
    coverUrl: string | null;
    level: 'Basique' | 'Cible' | 'Premium' | null;
    status: 'active' | 'completed' | 'paused' | 'canceled';
    startedAtIso: string | null;
    updatedAtIso: string | null;
    progressPct: number | null;
    currentDay: number | null;
    unitsCount: number | null;
    _id?: string;
    programId?: string;
    finishedAtIso?: string | null;
};

export type UiUserDetail = UiUser & {
    enrollments: UiEnrollment[];
    theme?: 'system' | 'light' | 'dark';
    marketing?: boolean;
    productUpdates?: boolean;
    passwordChangedAtIso?: string | null;
    limits?: {
        maxConcurrentPrograms: number | null;
        features: string[];
    };
};

export type RoleFilter = 'all' | 'admin' | 'user';
export type StatusFilter = 'all' | 'active' | 'archived' | 'suspended';
export type SortKey = 'recent' | 'alpha' | 'lastLogin' | 'progress';
export type ViewMode = 'cards' | 'table';

export type AdminUsersStats = {
    total: number;
    admins: number;
    usersCount: number;
    active: number;
    archived: number;
    suspended: number;
};

export type AdminUsersFilterState = {
    q: string;
    role: RoleFilter;
    status: StatusFilter;
    sort: SortKey;
    view: ViewMode;
};
