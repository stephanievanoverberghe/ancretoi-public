import 'server-only';

import { checkPrismaConnection } from './prisma';

export async function getPrismaHealth() {
    return checkPrismaConnection();
}
