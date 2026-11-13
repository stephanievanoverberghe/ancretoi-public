export type AdminCategoryRow = {
    id: string;
    name: string;
    slug: string;
    description: string;
    color: string | null;
    icon: string | null;
    imagePath: string | null;
    imageAlt: string | null;
    usage: { posts: number };
    timestamps: { createdAt: string | null; updatedAt: string | null };
};

export type CategorySortKey = 'alphaAsc' | 'alphaDesc' | 'usageDesc' | 'recent';
export type CategoryViewMode = 'cards' | 'table';

export type AdminCategoriesPersistedState = {
    q: string;
    sort: CategorySortKey;
    onlyUnused: boolean;
    view: CategoryViewMode;
};
