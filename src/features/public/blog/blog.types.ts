export type BlogItem = {
    slug: string;
    title?: string | null;
    summary?: string | null;
    coverPath?: string | null;
    coverAlt?: string | null;
    readingTimeMin?: number | null;
    publishedAt?: string | Date | null;
    category?: string | null;
    tags?: string[] | null;
};
