import 'server-only';

import { ResourceType } from '@/generated/prisma/client';
import { requireUser } from '@/server/auth/authz';
import { findLearnerResources, findLearnerUserIdByEmail } from './apprentissage.repository';

export type LearnerResourceKind = 'article' | 'video' | 'audio' | 'exercise' | 'tool';

export type LearnerResource = {
    _id: string;
    slug: string;
    title: string;
    kind: LearnerResourceKind;
    description: string | null;
    minutes: number | null;
    tags: string[];
    coverUrl: string | null;
    url: string | null;
    createdAt: Date;
};

export type LearnerResourcesQuery = {
    q?: string;
    kind?: LearnerResourceKind;
    tags?: string[];
    sort?: string;
};

function toPrismaResourceType(kind?: LearnerResourceKind) {
    if (kind === 'video') return ResourceType.VIDEO;
    if (kind === 'audio') return ResourceType.AUDIO;
    if (kind === 'exercise') return ResourceType.EXERCISE;
    if (kind === 'tool') return ResourceType.TOOL;
    if (kind === 'article') return ResourceType.ARTICLE;
    return undefined;
}

function fromPrismaResourceType(type: ResourceType): LearnerResourceKind {
    if (type === ResourceType.VIDEO) return 'video';
    if (type === ResourceType.AUDIO) return 'audio';
    if (type === ResourceType.EXERCISE) return 'exercise';
    if (type === ResourceType.TOOL) return 'tool';
    return 'article';
}

export async function getLearnerResourcesData(nextPath: string, query: LearnerResourcesQuery) {
    const session = await requireUser(nextPath);
    const user = await findLearnerUserIdByEmail(session.email);

    if (!user || user.deletedAt) {
        return {
            userFound: false as const,
            items: [] as LearnerResource[],
            allTags: [] as string[],
        };
    }

    const tags = query.tags ?? [];
    const type = toPrismaResourceType(query.kind);
    const itemsRaw = await findLearnerResources({ type, q: query.q, tags, sort: query.sort });

    const items = itemsRaw.map((item) => ({
        _id: item.id,
        slug: item.slug,
        title: item.title,
        kind: fromPrismaResourceType(item.type),
        description: item.description,
        minutes: item.minutes,
        tags: item.tags,
        coverUrl: item.coverUrl,
        url: item.url,
        createdAt: item.createdAt,
    }));

    const allTags = Array.from(new Set(items.flatMap((item) => item.tags))).sort((a, b) => a.localeCompare(b, 'fr'));

    return {
        userFound: true as const,
        items,
        allTags,
    };
}
