import type { ReactNode } from 'react';

import { PublicChrome } from '@/components/layout';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return <PublicChrome>{children}</PublicChrome>;
}
