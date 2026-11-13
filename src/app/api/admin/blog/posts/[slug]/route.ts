// / /src/app/api/admin/blog/posts/[slug]/route.ts

import 'server-only';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/server/auth/authz';
import { getPost, updatePost, softDeletePost } from '@/server/blog/posts.service';
import { administrationRoutes, publicRoutes, routeBuilders } from '@/config/routes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

// ❗️IMPORTANT: params is now a Promise in dynamic API routes — must be awaited
type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
    await requireAdmin();
    const { slug } = await ctx.params;
    const doc = await getPost(slug);
    if (!doc) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true, doc });
}

export async function PATCH(req: Request, ctx: Ctx) {
    try {
        await requireAdmin();
        const { slug } = await ctx.params; // ✅ await
        const body = await req.json();
        const updated = await updatePost({ ...body, slug }); // use awaited slug

        // ✅ admin
        revalidatePath(administrationRoutes.articles);
        revalidatePath(administrationRoutes.articles);
        revalidatePath(`${administrationRoutes.articles}/${updated.slug}`, 'page');
        // ✅ public
        revalidatePath(publicRoutes.blog);
        revalidatePath(routeBuilders.article(updated.slug), 'page');

        return NextResponse.json({ ok: true, slug: updated.slug });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'server_error';
        return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
}

export async function DELETE(_req: Request, ctx: Ctx) {
    try {
        await requireAdmin();
        const { slug } = await ctx.params; // ✅ await
        const res = await softDeletePost(slug);

        // ✅ admin
        revalidatePath(administrationRoutes.articles);
        revalidatePath(administrationRoutes.articles);
        revalidatePath(administrationRoutes.articleArchives);
        // ✅ public
        revalidatePath(publicRoutes.blog);

        return NextResponse.json({ ok: true, ...res });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'server_error';
        return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
}
