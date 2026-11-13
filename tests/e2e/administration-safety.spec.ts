import { expect, test } from '@playwright/test';

import { loginWithCredentials, readE2ECredentials } from './support';

const adminCredentials =
    readE2ECredentials(process.env.TEST_ADMIN_EMAIL, process.env.TEST_ADMIN_PASSWORD) ??
    readE2ECredentials(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);

test.describe('Administration — invariants sans mutation', () => {
    test.skip(!adminCredentials, 'Identifiants admin E2E absents.');

    test('refuse de modifier le slug d’un programme avant toute écriture', async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== 'chromium-390', 'Scénario exécuté sur un seul viewport.');
        await loginWithCredentials(page, adminCredentials!, '/administration/programmes');

        const result = await page.evaluate(
            async ({ endpoint, payload }) => {
                const response = await fetch(endpoint, {
                    method: 'PUT',
                    credentials: 'same-origin',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                return {
                    status: response.status,
                    body: await response.json() as unknown,
                };
            },
            {
                endpoint: '/api/admin/programs/slug-original-e2e',
                payload: {
                slug: 'slug-modifie-e2e',
                title: 'Programme de contrôle E2E',
                status: 'draft',
                level: 'Basique',
                durationDays: 1,
                estMinutesPerDay: 20,
                marketing: {
                    hero: { title: 'Programme de contrôle E2E' },
                    benefits: [],
                },
                days: [
                    {
                        title: 'Jour 1',
                        videoUrl: 'https://example.com/video.mp4',
                        status: 'draft',
                    },
                ],
            },
            },
        );

        expect(result.status).toBe(400);
        expect(result.body).toEqual({ error: 'slug_immutable' });
    });
});
