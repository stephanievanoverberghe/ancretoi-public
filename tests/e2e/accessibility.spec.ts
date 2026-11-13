import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import {
    E2E_BASE_URL,
    expectHealthyVisibleRoute,
    setConsentCookie,
} from './support';

const criticalPages = [
    '/',
    '/programmes',
    '/connexion',
    '/mentions-legales',
    '/cookies/preferences',
    '/credits',
    '/paiement',
    '/newsletter/confirmation',
] as const;

const axeProjects = ['chromium-390', 'chromium-1440'] as const;

test.describe('Accessibilité WCAG AA', () => {
    test.beforeEach(async ({ context, baseURL }) => {
        await setConsentCookie(context, baseURL ?? E2E_BASE_URL);
    });

    for (const path of criticalPages) {
        test(`${path} ne présente aucune violation Axe AA`, async ({ page }, testInfo) => {
            test.skip(
                !axeProjects.includes(
                    testInfo.project.name as (typeof axeProjects)[number],
                ),
                'Les audits Axe publics ciblent un viewport mobile et un viewport desktop.',
            );
            await expectHealthyVisibleRoute(page, path);

            const results = await new AxeBuilder({ page })
                .withTags([
                    'wcag2a',
                    'wcag2aa',
                    'wcag21a',
                    'wcag21aa',
                    'wcag22aa',
                ])
                .analyze();

            const summary = results.violations
                .map((violation) => {
                    const targets = violation.nodes
                        .flatMap((node) => node.target)
                        .slice(0, 5)
                        .join(', ');
                    return `${violation.id} (${violation.impact ?? 'impact inconnu'}) : ${targets}`;
                })
                .join('\n');

            expect(
                results.violations,
                `Violations Axe sur ${path} :\n${summary}`,
            ).toEqual([]);
        });
    }
});
