// src/app/api/settings/avatar/route.ts
import 'server-only';
import { NextResponse } from 'next/server';
import { getSession } from '@/server/auth/session';
import { updateAuthUserAvatar } from '@/server/auth/auth.service';

export const runtime = 'nodejs'; // ✅ nécessaire si tu utilises Buffer
export const dynamic = 'force-dynamic'; // (optionnel) évite le cache en prod

export async function POST(req: Request): Promise<Response> {
    try {
        const sess = await getSession();
        if (!sess?.email) {
            return NextResponse.json({ ok: false, error: 'UNAUTH' }, { status: 401 });
        }

        const form = await req.formData();
        const name = form.get('name');
        const remove = form.get('remove'); // '1' pour supprimer
        const file = form.get('avatar') as File | null;

        let avatarUrlToSave: string | null | undefined = undefined;

        // Suppression explicite
        if (remove === '1') {
            avatarUrlToSave = null;
        } else if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
            // ✅ Quick-win : encode en Data URL et stocke en DB
            const buf = Buffer.from(await file.arrayBuffer());
            const mime = file.type || 'image/png';
            const dataUrl = `data:${mime};base64,${buf.toString('base64')}`;
            avatarUrlToSave = dataUrl;

            // 🔁 Plus tard : remplace par un upload S3/Cloudinary et mets l’URL HTTP ici.
            // const uploadedUrl = await uploadToYourStorage(file);
            // avatarUrlToSave = uploadedUrl;
        }

        await updateAuthUserAvatar({
            email: sess.email,
            name: typeof name === 'string' ? name : undefined,
            avatarUrl: avatarUrlToSave,
        });

        return NextResponse.json({ ok: true, avatarUrl: avatarUrlToSave ?? undefined });
    } catch (err) {
        // Log optionnel, mais on RETOURNE une Response
        console.error('POST /api/settings/avatar failed', err);
        return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
    }
}
