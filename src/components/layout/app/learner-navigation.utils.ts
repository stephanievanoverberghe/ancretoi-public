import type { LearnerNavigationItem } from '@/config/navigation';
import { espaceRoutes } from '@/config/routes';
import { isActiveRoute } from '@/lib/navigation';

/** Les notes libres appartiennent au même espace d’écriture que le journal guidé. */
export function isLearnerNavigationActive(
  pathname: string,
  item: LearnerNavigationItem,
) {
  if (isActiveRoute(pathname, item.href, { exact: item.exact })) return true;

  return (
    item.href === espaceRoutes.journal &&
    isActiveRoute(pathname, espaceRoutes.notes)
  );
}
