import { getPrismaHealth } from "@/server/db/prisma-health.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getPrismaHealth();

  return Response.json(result, {
    status: result.ok ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
