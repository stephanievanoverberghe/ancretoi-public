import { expect, test } from '@playwright/test';

import {
    E2E_BASE_URL,
    expectCanonicalPath,
    expectHealthyVisibleRoute,
    expectNoHorizontalOverflow,
    setConsentCookie,
} from './support';

type RouteExpectation = {
    path: string;
    noindex?: boolean;
};

const routeGroups: readonly {
    label: string;
    routes: readonly RouteExpectation[];
}[] = [
    {
        label: 'pages publiques',
        routes: [
            { path: '/' },
            { path: '/programmes' },
            { path: '/methode' },
            { path: '/temoignages' },
            { path: '/blog' },
            { path: '/inspirations' },
            { path: '/aide' },
            { path: '/contact' },
            { path: '/quiz/boussole' },
            { path: '/mentions-legales' },
            { path: '/conditions-generales' },
            { path: '/confidentialite' },
            { path: '/cookies' },
            { path: '/cookies/preferences' },
            { path: '/credits' },
            { path: '/retractation' },
        ],
    },
    {
        label: 'pages d’authentification',
        routes: [
            { path: '/connexion', noindex: true },
            { path: '/inscription', noindex: true },
            { path: '/mot-de-passe-oublie', noindex: true },
            { path: '/reinitialiser-mot-de-passe', noindex: true },
        ],
    },
    {
        label: 'pages de paiement',
        routes: [
            { path: '/paiement', noindex: true },
            { path: '/paiement/succes', noindex: true },
            { path: '/paiement/annule', noindex: true },
        ],
    },
    {
        label: 'retours de newsletter',
        routes: [
            { path: '/newsletter/confirmation', noindex: true },
            { path: '/newsletter/erreur', noindex: true },
            { path: '/newsletter/desinscription', noindex: true },
        ],
    },
] as const;

const legalRoutes = [
    '/mentions-legales',
    '/conditions-generales',
    '/confidentialite',
    '/cookies',
    '/credits',
    '/retractation',
] as const;

const removedNewsletterRoutes = [
    '/newsletter/confirmed',
    '/newsletter/error',
    '/newsletter/unsubscribed',
] as const;

const legalPlaceholderPatterns = [
    { label: 'marqueur TODO/TBD', pattern: /\b(?:todo|tbd|lorem ipsum)\b/i },
    { label: 'mention « à compléter »', pattern: /\b(?:à|a)\s+compl[ée]ter\b/i },
    {
        label: 'champ légal entre crochets',
        pattern: /\[(?:nom|adresse|siren|siret|tva|téléphone|telephone)[^\]]*\]/i,
    },
    { label: 'suite de caractères factices', pattern: /\b(?:x{4,}|0{9})\b/i },
    { label: 'domaine d’exemple', pattern: /\bexample\.(?:com|org|net)\b/i },
] as const;

test.describe('Routes visibles et métadonnées', () => {
    test.beforeEach(async ({ context, baseURL }) => {
        await setConsentCookie(context, baseURL ?? E2E_BASE_URL);
    });

    for (const group of routeGroups) {
        test(`${group.label} : rendu, canonical et responsive`, async ({ page }) => {
            for (const route of group.routes) {
                await test.step(route.path, async () => {
                    await expectHealthyVisibleRoute(page, route.path);
                    await expectCanonicalPath(page, route.path);
                    await expectNoHorizontalOverflow(page);

                    if (route.noindex) {
                        await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
                            'content',
                            /noindex/i,
                        );
                    }
                });
            }
        });
    }

    test('les routes protégées redirigent vers la connexion avec leur destination', async ({
        page,
    }) => {
        for (const protectedPath of ['/espace', '/administration']) {
            await test.step(protectedPath, async () => {
                const response = await page.goto(protectedPath, {
                    waitUntil: 'domcontentloaded',
                });

                expect(response?.status()).toBeLessThan(400);
                const destination = new URL(page.url());
                expect(destination.pathname).toBe('/connexion');
                expect(destination.searchParams.get('next')).toBe(protectedPath);
            });
        }
    });

    test('les anciennes routes newsletter ne sont ni exposées ni redirigées', async ({
        page,
    }, testInfo) => {
        test.skip(
            testInfo.project.name !== 'chromium-390',
            'Le retrait des routes historiques est vérifié une seule fois.',
        );

        for (const path of removedNewsletterRoutes) {
            await test.step(path, async () => {
                const response = await page.goto(path, {
                    waitUntil: 'domcontentloaded',
                });

                expect(response?.status()).toBe(404);
                expect(new URL(page.url()).pathname).toBe(path);
            });
        }
    });

    test('les pages légales ne contiennent aucun placeholder de publication', async ({
        page,
    }) => {
        for (const path of legalRoutes) {
            await test.step(path, async () => {
                await expectHealthyVisibleRoute(page, path);
                const bodyText = await page.locator('body').innerText();

                for (const placeholder of legalPlaceholderPatterns) {
                    expect(
                        bodyText,
                        `${path} contient un ${placeholder.label}`,
                    ).not.toMatch(placeholder.pattern);
                }
            });
        }
    });

    test('le site de démonstration est attribué à Alchimiste Créations', async ({
        page,
    }) => {
        for (const path of ['/', '/mentions-legales', '/conditions-generales', '/credits']) {
            await test.step(path, async () => {
                await expectHealthyVisibleRoute(page, path);
                await expect(
                    page.getByRole('link', { name: 'alchimiste-creations.com' }).first(),
                ).toHaveAttribute('href', 'https://alchimiste-creations.com');
            });
        }
    });

    test('les coordonnées légales publiques restent minimales', async ({ page }) => {
        await expectHealthyVisibleRoute(page, '/mentions-legales');
        const bodyText = await page.locator('body').innerText();

        expect(bodyText).toContain('contact@alchimiste-creations.com');
        expect(bodyText).toContain('59280 Armentières');
        expect(bodyText).not.toMatch(/Téléphone\s*:/i);
    });
});
