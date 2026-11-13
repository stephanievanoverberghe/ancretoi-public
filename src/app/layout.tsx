// src/app/layout.tsx
import './globals.css';
import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Script from 'next/script';
import { BrandedPageLoading } from '@/components/feedback/BrandedPageLoading';
import { ClientPreferencesSync } from '@/components/layout/ClientPreferencesSync';
import { legalIdentity } from '@/content/legal/legal-identity';
import { AnalyticsGate, CookieBanner } from '@/features/public/legal/cookies/components';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const isProd = process.env.NODE_ENV === 'production';
const allowIndex = (process.env.NEXT_PUBLIC_INDEX ?? (isProd ? 'true' : 'false')) === 'true';

const preferencesBootstrap = `(function(){try{var r=document.documentElement;var t=localStorage.getItem('ancretoi-theme')||'light';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);r.dataset.theme=d?'dark':'light';r.dataset.themePreference=t;r.classList.toggle('dark',d);var raw=localStorage.getItem('a11y-prefs');if(raw){var p=JSON.parse(raw);var s=Number(p.textScale);if(s===1||s===1.1||s===1.25)r.style.setProperty('--text-scale',String(s));r.classList.toggle('reduce-motion',Boolean(p.reduceMotion));}}catch(e){}})();`;

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),

    applicationName: 'Ancre-toi',
    title: {
        default: 'Ancre-toi',
        template: '%s | Ancre-toi',
    },

    description: 'Rituels courts (10–20 min/j) pour te recentrer et tenir dans le temps : RESET-7, BOUSSOLE-10, ANCRAGE-30, ALCHIMIE-90. Accès à vie.',
    keywords: [
        'rituels courts',
        'respiration 4-6',
        'gestion du stress',
        'ancrage',
        'journal intégré',
        'habitudes tenables',
        'RESET-7',
        'BOUSSOLE-10',
        'ANCRAGE-30',
        'ALCHIMIE-90',
        'programmes bien-être',
        'routine quotidienne',
    ],

    authors: [{ name: legalIdentity.legalName, url: legalIdentity.website }],
    creator: legalIdentity.legalName,
    publisher: legalIdentity.legalName,

    robots: {
        index: allowIndex,
        follow: allowIndex,
        nocache: !allowIndex,
        googleBot: {
            index: allowIndex,
            follow: allowIndex,
            noimageindex: !allowIndex,
            'max-snippet': allowIndex ? -1 : 0,
            'max-image-preview': allowIndex ? ('large' as const) : 'none',
            'max-video-preview': allowIndex ? -1 : 0,
        },
    },

    openGraph: {
        title: 'Ancre-toi',
        description: 'Rituels courts (10–20 min/j) pour te recentrer et tenir dans le temps : RESET-7, BOUSSOLE-10, ANCRAGE-30, ALCHIMIE-90. Accès à vie.',
        url: '/',
        siteName: 'Ancre-toi',
        images: [
            {
                url: '/images/og-default.png',
                width: 1200,
                height: 630,
                alt: 'Ancre-toi — Rituels courts, respiration, journal intégré',
            },
        ],
        type: 'website',
        locale: 'fr_FR',
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Ancre-toi',
        description: 'Rituels courts (10–20 min/j) pour te recentrer et tenir dans le temps. Accès à vie.',
        images: ['/images/og-default.png'],
    },

    icons: {
        icon: '/favicon.ico',
    },

    formatDetection: {
        telephone: false,
        address: false,
        email: false,
    },
};

export const viewport: Viewport = {
    themeColor: '#6C4BE0',
    viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="fr"
            data-theme="light"
            data-theme-preference="light"
            suppressHydrationWarning
            className={`${inter.variable} ${playfair.variable} h-full`}
        >
            <head>
                <Script
                    id="ancretoi-client-preferences"
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{ __html: preferencesBootstrap }}
                />
            </head>
            <body className="min-h-screen supports-[min-height:100dvh]:min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
                <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 z-[100] rounded-lg bg-brand-600 px-3 py-2 text-sm text-white shadow">
                    Aller au contenu
                </a>
                <ClientPreferencesSync />
                <Suspense fallback={<BrandedPageLoading />}>{children}</Suspense>
                <CookieBanner days={365} />
                <AnalyticsGate />
            </body>
        </html>
    );
}
