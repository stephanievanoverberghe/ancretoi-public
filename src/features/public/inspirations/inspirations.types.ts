export type InspirationItem = {
    title: string;
    slug?: string;
    videoUrl: string;
    summary?: string | null;
    tags?: string[] | null;
    createdAt?: Date | string;
};
