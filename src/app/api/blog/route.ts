// src/app/api/blog/route.ts
import { NextResponse } from 'next/server';
import { listPublishedBlogPosts } from '@/server/blog/public-posts.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    return NextResponse.json(await listPublishedBlogPosts(searchParams));
}
