export type AdminPostRow = {
    id: string;
    slug: string;
    status: 'draft' | 'published';
    title: string;
    coverPath: string | null;
    coverAlt: string | null;
    summary: string | null;
    tags: string[];
    category: string | null;
    timestamps: { createdAt: string | null; updatedAt: string | null; publishedAt: string | null };
    seo?: { title?: string; description?: string };
    featured?: boolean;
};

export type CategoryOption = { slug: string; name: string; color: string | null; icon: string | null };

export type StatusFilter = 'all' | 'draft' | 'published';
export type SortKey = 'recent' | 'alpha';
export type ViewMode = 'cards' | 'table';

export type Persisted = {
    q: string;
    status: StatusFilter;
    category: string;
    sort: SortKey;
    view: ViewMode;
};

export type PostCounts = {
    total: number;
    draft: number;
    published: number;
};
