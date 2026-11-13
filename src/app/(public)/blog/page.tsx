import type { Metadata } from 'next';

import { BlogPage } from '@/features/public/blog';

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Articles Ancre-toi pour avancer avec douceur, clarte et ancrage.',
    alternates: { canonical: '/blog' },
    openGraph: {
        title: 'Blog - Ancre-toi',
        description: 'Articles Ancre-toi pour avancer avec douceur, clarte et ancrage.',
        url: '/blog',
    },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function BlogRoutePage() {
    return <BlogPage />;
}
