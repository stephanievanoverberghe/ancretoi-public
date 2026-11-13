import type { ReactNode } from 'react';

import { PublicChrome } from '@/components/layout';

export default function PublicLayout({ children }: { children: ReactNode }) {
    return <PublicChrome>{children}</PublicChrome>;
}
