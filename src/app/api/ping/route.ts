import { getPrismaHealth } from '@/server/db/prisma-health.service';

export async function GET() {
    const result = await getPrismaHealth();
    return Response.json({ database: 'prisma', ...result });
}
