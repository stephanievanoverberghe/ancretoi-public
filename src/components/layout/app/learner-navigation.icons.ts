import type { LucideIcon } from 'lucide-react';
import { BarChart3, BookOpen, FolderOpen, Home, LifeBuoy, NotebookPen, Target, UserCircle } from 'lucide-react';

import type { LearnerNavigationIconKey } from '@/config/navigation';

export const learnerNavigationIcons = {
  book: BookOpen,
  chart: BarChart3,
  folder: FolderOpen,
  help: LifeBuoy,
  home: Home,
  notes: NotebookPen,
  target: Target,
  user: UserCircle,
} satisfies Record<LearnerNavigationIconKey, LucideIcon>;

export function getLearnerNavigationIcon(icon: LearnerNavigationIconKey): LucideIcon {
  return learnerNavigationIcons[icon];
}
