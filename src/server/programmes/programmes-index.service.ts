import 'server-only';

import { getProgramBySlug, getPublicPrograms } from './programmes.service';

export const getPrograms = getPublicPrograms;
export { getProgramBySlug };
