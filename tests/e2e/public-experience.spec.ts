import { expect, type Page, test } from '@playwright/test';

import {
    E2E_BASE_URL,
    expectAccessibleMedia,
    expectHealthyVisibleRoute,
    expectNoHorizontalOverflow,
    setConsentCookie,
} from './support';

const visualProjects = ['chromium-390', 'chromium-1440'] as const;

function isVisualProject(projectName: string) {
    return visualProjects.includes(projectName as (typeof visualProjects)[number]);
}

async function mockCsrf(page: Page) {
    await page.route('**/api/auth/csrf', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ token: 'csrf-e2e-public' }),
        });
    });
}

test.describe('Expérience publique éditoriale', () => {
    test.beforeEach(async ({ context, baseURL }) => {
        await setConsentCookie(context, baseURL ?? E2E_BASE_URL);
    });

    test('le header desktop et le drawer mobile exposent la même navigation', async ({
        page,
    }, testInfo) => {
        test.skip(
            !isVisualProject(testInfo.project.name),
            'La navigation publique est vérifiée sur un mobile et un desktop.',
        );

        await expectHealthyVisibleRoute(page, '/');

        if (testInfo.project.name === 'chromium-390') {
            const trigger = page.getByRole('button', { name: 'Ouvrir le menu' });
            await trigger.click();

            const drawer = page.getByRole('dialog', { name: 'Navigation mobile' });
            await expect(drawer).toBeVisible();
            await expect(
                drawer.getByRole('navigation', { name: 'Menu des programmes' }),
            ).toBeVisible();
            await expect(
                drawer.getByRole('navigation', { name: 'Navigation mobile' }),
            ).toBeVisible();

            await page.keyboard.press('Escape');
            await expect(drawer).toBeHidden();
            await expect(trigger).toBeFocused();

            await trigger.click();
            await drawer.getByRole('link', { name: 'Méthode', exact: true }).click();
            await expect(page).toHaveURL(/\/methode$/);
            await expect(drawer).toBeHidden();
        } else {
            const navigation = page.getByRole('navigation', {
                name: 'Navigation principale',
            });
            const programmes = navigation.getByRole('button', {
                name: 'Programmes',
                exact: true,
            });

            await expect(navigation).toBeVisible();
            await programmes.click();
            const programmesMenu = page.getByRole('group', {
                name: 'Menu des programmes',
            });
            await expect(programmesMenu).toBeVisible();

            const programmesBox = await programmes.boundingBox();
            const menuBox = await programmesMenu.boundingBox();
            expect(programmesBox).not.toBeNull();
            expect(menuBox).not.toBeNull();

            if (programmesBox && menuBox) {
                await page.mouse.move(
                    programmesBox.x + programmesBox.width / 2,
                    programmesBox.y + programmesBox.height +
                        (menuBox.y - programmesBox.y - programmesBox.height) / 2,
                );
                await page.waitForTimeout(180);
            }

            await expect(programmesMenu).toBeVisible();
            await programmesMenu
                .getByRole('link', { name: /Tous les programmes/ })
                .click();
            await expect(page).toHaveURL(/\/programmes$/);

            await programmes.click();
            await expect(programmesMenu).toBeVisible();
            await page.keyboard.press('Escape');
            await expect(programmesMenu).toBeHidden();
            await expect(programmes).toBeFocused();

            await expectHealthyVisibleRoute(page, '/methode');
            await expect(
                page
                    .getByRole('navigation', { name: 'Navigation principale' })
                    .getByRole('link', { name: 'Méthode', exact: true }),
            ).toHaveAttribute('aria-current', 'page');
        }
    });

    test('les contenus Reveal restent visibles avant toute intersection', async ({
        page,
    }, testInfo) => {
        test.skip(
            testInfo.project.name !== 'chromium-390',
            'Le rendu progressif de Reveal est vérifié une seule fois.',
        );

        await page.addInitScript(() => {
            Object.defineProperty(window, 'IntersectionObserver', {
                configurable: true,
                value: undefined,
            });
        });
        await expectHealthyVisibleRoute(page, '/');

        const reveals = page.locator('[data-public-reveal]');
        await expect
            .poll(() => reveals.count(), {
                message: 'La page d’accueil doit contenir des sections Reveal',
            })
            .toBeGreaterThan(0);

        const hiddenReveals = await reveals.evaluateAll((elements) =>
            elements.flatMap((element, index) => {
                const style = getComputedStyle(element);
                const hidden =
                    Number(style.opacity) < 0.99 ||
                    style.visibility === 'hidden' ||
                    style.display === 'none';
                return hidden ? [`Reveal ${index + 1}`] : [];
            }),
        );

        expect(
            hiddenReveals,
            'Reveal doit enrichir le rendu sans masquer le contenu initial',
        ).toEqual([]);
    });

    test('les pages illustrées exposent des médias accessibles sans débordement', async ({
        page,
    }, testInfo) => {
        test.skip(
            !isVisualProject(testInfo.project.name),
            'Les médias publics sont vérifiés sur un mobile et un desktop.',
        );

        for (const path of [
            '/',
            '/methode',
            '/aide',
            '/quiz/boussole',
            '/connexion',
            '/paiement',
            '/newsletter/confirmation',
        ]) {
            await test.step(path, async () => {
                await expectHealthyVisibleRoute(page, path);
                await expectAccessibleMedia(page);
                await expectNoHorizontalOverflow(page);
            });
        }

        await expectHealthyVisibleRoute(page, '/credits');
        await expectNoHorizontalOverflow(page);
    });
});

test.describe('Formulaires publics isolés des services réels', () => {
    test.beforeEach(async ({ context, baseURL }, testInfo) => {
        test.skip(
            testInfo.project.name !== 'chromium-390',
            'Les mutations interceptées sont vérifiées une seule fois.',
        );
        await setConsentCookie(context, baseURL ?? E2E_BASE_URL);
    });

    test('la connexion affiche l’erreur interceptée sans ouvrir de session', async ({
        page,
    }) => {
        await mockCsrf(page);
        let requestBody: Record<string, unknown> | null = null;
        let csrfHeader: string | undefined;
        let googleStartRequests = 0;

        await page.route('**/api/auth/google/start**', async (route) => {
            googleStartRequests += 1;
            await route.abort();
        });

        await page.route('**/api/auth/login-password', async (route) => {
            requestBody = route.request().postDataJSON() as Record<string, unknown>;
            csrfHeader = await route.request().headerValue('x-csrf-token') ?? undefined;
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Identifiants de démonstration refusés.' }),
            });
        });

        await expectHealthyVisibleRoute(page, '/connexion');
        const main = page.locator('main#main-content');
        await main
            .getByRole('textbox', { name: 'Adresse e-mail', exact: true })
            .fill('connexion-e2e@example.test');
        expect(googleStartRequests, 'Le flux Google ne doit jamais être préchargé').toBe(0);
        await main.getByLabel(/^Mot de passe/).fill('Secret-e2e-2026!');
        await main.getByRole('button', { name: 'Se connecter', exact: true }).click();

        await expect(main.getByText('Connexion impossible', { exact: true })).toBeVisible();
        await expect(main.getByText('Identifiants de démonstration refusés.')).toBeVisible();
        expect(requestBody).toMatchObject({
            email: 'connexion-e2e@example.test',
            password: 'Secret-e2e-2026!',
        });
        expect(csrfHeader).toBe('csrf-e2e-public');
        expect(new URL(page.url()).pathname).toBe('/connexion');
    });

    test('l’inscription valide la force et les liens de confiance sans créer de compte', async ({
        page,
    }) => {
        await mockCsrf(page);
        let requestBody: Record<string, unknown> | null = null;

        await page.route('**/api/auth/register-password', async (route) => {
            requestBody = route.request().postDataJSON() as Record<string, unknown>;
            await route.fulfill({
                status: 422,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Inscription neutralisée par le test.' }),
            });
        });

        await expectHealthyVisibleRoute(page, '/inscription');
        const main = page.locator('main#main-content');
        await main.getByLabel('Prénom', { exact: true }).fill('Élodie');
        await main
            .getByRole('textbox', { name: 'Adresse e-mail', exact: true })
            .fill('inscription-e2e@example.test');
        await main
            .getByRole('button', { name: /générer un mot de passe solide/i })
            .click();

        await expect(main.getByRole('progressbar', { name: 'Force du mot de passe' })).toBeVisible();
        await expect(
            main.getByRole('link', { name: 'conditions générales' }),
        ).toHaveAttribute('href', '/conditions-generales');
        await expect(
            main.getByRole('link', { name: 'politique de confidentialité' }),
        ).toHaveAttribute('href', '/confidentialite');

        const submit = main.getByRole('button', {
            name: 'Créer mon compte',
            exact: true,
        });
        await expect(submit).toBeEnabled();
        await submit.click();

        await expect(main.getByText('Inscription impossible', { exact: true })).toBeVisible();
        await expect(main.getByText('Inscription neutralisée par le test.')).toBeVisible();
        expect(requestBody).toMatchObject({
            email: 'inscription-e2e@example.test',
            name: 'Élodie',
        });
        expect(
            String(
                (requestBody as Record<string, unknown> | null)?.password ?? '',
            ).length,
        ).toBeGreaterThanOrEqual(12);
        expect(new URL(page.url()).pathname).toBe('/inscription');
    });

    test('la demande de réinitialisation n’envoie aucun email réel', async ({
        page,
    }) => {
        await mockCsrf(page);
        let requestBody: Record<string, unknown> | null = null;

        await page.route('**/api/auth/forgot-password', async (route) => {
            requestBody = route.request().postDataJSON() as Record<string, unknown>;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true }),
            });
        });

        await expectHealthyVisibleRoute(page, '/mot-de-passe-oublie');
        const main = page.locator('main#main-content');
        await main
            .getByRole('textbox', { name: 'Adresse e-mail', exact: true })
            .fill('reset-e2e@example.test');
        await main.getByRole('button', { name: 'Envoyer le lien', exact: true }).click();

        await expect(main.getByText('Demande prise en compte', { exact: true })).toBeVisible();
        expect(requestBody).toEqual({ email: 'reset-e2e@example.test' });
    });

    test('le nouveau mot de passe vérifie le token sans modifier de compte réel', async ({
        page,
    }) => {
        await mockCsrf(page);
        let requestBody: Record<string, unknown> | null = null;

        await page.route('**/api/auth/reset-password/verify*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true }),
            });
        });
        await page.route('**/api/auth/reset-password', async (route) => {
            requestBody = route.request().postDataJSON() as Record<string, unknown>;
            await route.fulfill({
                status: 422,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Mise à jour neutralisée par le test.' }),
            });
        });

        await expectHealthyVisibleRoute(
            page,
            '/reinitialiser-mot-de-passe?token=token-e2e-public',
        );
        const main = page.locator('main#main-content');
        await expect(
            main.getByRole('heading', { name: 'Choisis un mot de passe solide.' }),
        ).toBeVisible();

        const password = 'Ancre-2026!Rituel';
        await main.getByLabel(/^Nouveau mot de passe/).fill(password);
        await main.getByLabel(/^Confirmer le mot de passe/).fill(password);
        const submit = main.getByRole('button', { name: 'Mettre à jour', exact: true });
        await expect(submit).toBeEnabled();
        await submit.click();

        await expect(main.getByText('Mise à jour impossible', { exact: true })).toBeVisible();
        await expect(main.getByText('Mise à jour neutralisée par le test.')).toBeVisible();
        expect(requestBody).toEqual({
            token: 'token-e2e-public',
            password,
        });
    });

    test('le paiement couvre attente, erreur et nouvelle tentative sans confirmer de session', async ({
        page,
    }) => {
        let releaseFirstResponse: (() => void) | undefined;
        const firstResponseGate = new Promise<void>((resolve) => {
            releaseFirstResponse = resolve;
        });
        let requestCount = 0;
        const requestBodies: Record<string, unknown>[] = [];

        await page.route('**/api/checkout/confirm', async (route) => {
            requestCount += 1;
            requestBodies.push(
                route.request().postDataJSON() as Record<string, unknown>,
            );
            if (requestCount === 1) await firstResponseGate;
            await route.fulfill({
                status: 503,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Confirmation de test indisponible.' }),
            });
        });

        await page.goto(
            '/paiement/succes?session_id=cs_test_e2e&program=reset-7',
            { waitUntil: 'domcontentloaded' },
        );
        await expect.poll(() => requestCount).toBe(1);
        await expect(
            page.getByRole('heading', { name: 'Confirmation du paiement' }),
        ).toBeVisible();
        await expect(page.getByText('Merci de patienter…')).toBeVisible();

        releaseFirstResponse?.();
        await expect(
            page.getByRole('heading', { name: 'Confirmation interrompue' }),
        ).toBeVisible();
        await expect(page.getByText('Confirmation de test indisponible.')).toBeVisible();

        await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
        await expect.poll(() => requestCount).toBe(2);
        expect(requestBodies).toEqual([
            { session_id: 'cs_test_e2e', program: 'reset-7' },
            { session_id: 'cs_test_e2e', program: 'reset-7' },
        ]);
    });

    test('les paramètres de paiement manquants sont gérés sans appel API', async ({
        page,
    }) => {
        let requestCount = 0;
        await page.route('**/api/checkout/confirm', async (route) => {
            requestCount += 1;
            await route.abort();
        });

        await expectHealthyVisibleRoute(page, '/paiement/succes');
        await expect(
            page.getByRole('heading', { name: 'Confirmation interrompue' }),
        ).toBeVisible();
        await expect(page.getByText(/paramètres manquants/i)).toBeVisible();
        expect(requestCount).toBe(0);
    });

    test('l’inscription newsletter reste en double opt-in sans envoi réel', async ({
        page,
    }) => {
        let requestBody: Record<string, unknown> | null = null;
        await page.route('**/api/newsletter/subscribe', async (route) => {
            requestBody = route.request().postDataJSON() as Record<string, unknown>;
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true }),
            });
        });

        await expectHealthyVisibleRoute(page, '/');
        await page
            .getByRole('textbox', { name: 'Ton adresse e-mail' })
            .fill('newsletter-e2e@example.test');
        await page
            .getByRole('button', { name: 'Recevoir l’inspiration', exact: true })
            .click();

        await expect(
            page.getByText(/confirme ton inscription depuis l’email/i),
        ).toBeVisible();
        expect(requestBody).toEqual({
            email: 'newsletter-e2e@example.test',
            source: 'footer',
        });

        for (const expectation of [
            {
                path: '/newsletter/confirmation',
                heading: 'Inscription confirmée',
            },
            {
                path: '/newsletter/erreur?code=expired',
                heading: 'Lien expiré',
            },
            {
                path: '/newsletter/desinscription',
                heading: 'Désinscription confirmée',
            },
        ]) {
            await test.step(expectation.path, async () => {
                await expectHealthyVisibleRoute(page, expectation.path);
                await expect(
                    page.getByRole('heading', {
                        name: expectation.heading,
                        exact: true,
                    }),
                ).toBeVisible();
            });
        }
    });
});
