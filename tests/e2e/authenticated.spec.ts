import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import {
    E2E_BASE_URL,
    expectNoHorizontalOverflow,
    setConsentCookie,
    settlePageLayout,
} from './support';

type Credentials = {
    email: string;
    password: string;
};

function readCredentials(
    email: string | undefined,
    password: string | undefined,
): Credentials | null {
    const normalizedEmail = email?.trim();
    const normalizedPassword = password?.trim();

    if (!normalizedEmail || !normalizedPassword) return null;
    return { email: normalizedEmail, password: normalizedPassword };
}

const learnerCredentials = readCredentials(
    process.env.TEST_USER_EMAIL,
    process.env.TEST_USER_PASSWORD,
);
const adminCredentials =
    readCredentials(
        process.env.TEST_ADMIN_EMAIL,
        process.env.TEST_ADMIN_PASSWORD,
    ) ??
    readCredentials(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
const accountCredentials = learnerCredentials ?? adminCredentials;

test.use({
    trace: 'off',
    screenshot: 'off',
    video: 'off',
});

async function login(page: Page, credentials: Credentials, nextPath: string) {
    await page.goto(`/connexion?next=${encodeURIComponent(nextPath)}`, {
        waitUntil: 'domcontentloaded',
    });
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox', { name: 'Adresse e-mail', exact: true }).fill(credentials.email);
    await page.getByLabel(/^mot de passe/i).fill(credentials.password);

    const submit = page.locator('#main-content').getByRole('button', {
        name: /^se connecter$/i,
    });
    await expect(submit).toBeEnabled();

    await Promise.all([
        page.waitForURL(
            (url) => url.pathname === nextPath || url.pathname.startsWith(`${nextPath}/`),
            { timeout: 20_000 },
        ),
        submit.click(),
    ]);
}

async function expectAuthenticatedPage(page: Page, path: string) {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    expect(new URL(page.url()).pathname).toBe(path);
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
    await expect(main).not.toContainText(/le site rencontre un problème temporaire/i);
    await settlePageLayout(page);
    await expectNoHorizontalOverflow(page);
}

async function expectLockedStepsAreNotLinks(page: Page) {
    const lockedSteps = page.locator('main#main-content [aria-disabled="true"]');
    const count = await lockedSteps.count();

    for (let index = 0; index < count; index += 1) {
        const lockedStep = lockedSteps.nth(index);
        expect(await lockedStep.evaluate((element) => element.tagName)).not.toBe('A');
        await expect(lockedStep.locator('a')).toHaveCount(0);
    }
}

async function expectProgrammeScopedResumeLinks(page: Page) {
    const resumeLinks = page
        .locator('main#main-content')
        .getByRole('link', { name: /^(?:commencer|continuer|revoir le bilan|revoir le parcours)$/i });
    await expect(
        resumeLinks.first(),
        'Au moins une action de parcours doit être disponible',
    ).toBeVisible();
    const count = await resumeLinks.count();

    for (let index = 0; index < count; index += 1) {
        const href = await resumeLinks.nth(index).getAttribute('href');
        expect(href, 'La reprise doit cibler le parcours ou son bilan').toMatch(
            /^\/espace\/(?:formations\/[^/]+(?:\/jour\/\d+)?|bilan)$/,
        );
    }
}

async function expectCourseCardsAreStructured(page: Page) {
    const cards = page.locator('main#main-content [data-course-card]');
    await expect(cards.first(), 'Au moins une carte de formation doit être affichée').toBeVisible();
    const count = await cards.count();

    for (let index = 0; index < count; index += 1) {
        const card = cards.nth(index);
        await expect(card.locator('[data-course-title]')).toHaveCount(1);
        await expect(card.locator('[data-course-title]')).toBeVisible();
        await expect(card).toHaveAttribute('data-course-status', /^(?:fresh|active|paused|completed)$/);

        const resumeLink = card.locator('[data-course-resume-link]');
        await expect(resumeLink).toHaveCount(1);
        await expect(resumeLink).toBeVisible();
        expect(await resumeLink.getAttribute('href')).toMatch(
            /^\/espace\/(?:formations\/[^/]+(?:\/jour\/\d+)?|bilan)$/,
        );
    }
}

async function expectDayStatusAndActionReason(page: Page) {
    const main = page.locator('main#main-content');
    const liveStatus = main.locator('[aria-live="polite"]').filter({ hasText: /\S/ }).first();
    await expect(liveStatus).toBeVisible();

    const actionReason = main.locator('#lesson-validation-status');
    await expect(actionReason).toBeVisible();
    await expect(actionReason).not.toHaveText(/^\s*$/);

    const actionBar = main.getByRole('region', { name: /validation du jour/i });
    await expect(actionBar).toBeVisible();
    const describedActions = actionBar.locator('[aria-describedby]');
    const describedActionCount = await describedActions.count();

    if (describedActionCount > 0) {
        for (let index = 0; index < describedActionCount; index += 1) {
            const describedBy = (await describedActions.nth(index).getAttribute('aria-describedby'))?.trim();
            expect(describedBy, 'L’action doit référencer une raison accessible.').toBeTruthy();

            for (const id of describedBy!.split(/\s+/)) {
                await expect(page.locator(`[id="${id}"]`)).not.toHaveText(/^\s*$/);
            }
        }
    } else {
        expect(
            await actionBar.getByRole('link').count(),
            'Une journée déjà validée doit proposer une action de continuation en plus du retour.',
        ).toBeGreaterThan(1);
    }
}

async function expectAccountDeepLinks(page: Page) {
    await page.goto('/espace/compte?onglet=donnees', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    expect(new URL(page.url()).searchParams.get('onglet')).toBe('donnees');
    await expect(page.getByRole('tab', { name: 'Données', exact: true })).toHaveAttribute(
        'data-state',
        'active',
    );

    await page.getByRole('tab', { name: 'Préférences', exact: true }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get('onglet')).toBe('preferences');
    await expect(page.getByRole('tab', { name: 'Préférences', exact: true })).toHaveAttribute(
        'data-state',
        'active',
    );
}

async function expectMobileSecondaryAccess(page: Page) {
    const moreButton = page.getByRole('button', { name: 'Plus', exact: true });
    await expect(moreButton).toBeVisible();
    await moreButton.click();

    const dialog = page.getByRole('dialog', { name: 'Ton espace' });
    await expect(dialog).toBeVisible();
    const resumeLink = dialog.getByRole('link', { name: 'Reprendre mon parcours', exact: true });
    if ((await resumeLink.count()) > 0) {
        await expect(resumeLink).toHaveAttribute(
            'href',
            /^\/espace\/(?:formations\/[^/]+(?:\/jour\/\d+)?|bilan)$/,
        );
    }
    const secondaryNavigation = dialog.getByRole('navigation', {
        name: 'Accès secondaires',
    });

    for (const destination of [
        { label: 'Bilan', href: '/espace/bilan' },
        { label: 'Guide 30 jours', href: '/espace/plan-30-jours' },
        { label: 'Ressources', href: '/espace/ressources' },
        { label: 'Compte', href: '/espace/compte' },
        { label: 'Aide', href: '/aide' },
    ]) {
        await expect(
            secondaryNavigation.getByRole('link', {
                name: destination.label,
                exact: true,
            }),
        ).toHaveAttribute('href', destination.href);
    }

    await dialog.getByRole('button', { name: 'Fermer', exact: true }).click();
    await expect(dialog).toBeHidden();
}

function formatAxeViolations(
    violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'],
) {
    return violations
        .map((violation) => {
            const targets = violation.nodes
                .flatMap((node) => node.target)
                .slice(0, 5)
                .join(', ');
            return `${violation.id} (${violation.impact ?? 'impact inconnu'}) : ${targets}`;
        })
        .join('\n');
}

async function expectAxeAa(page: Page, context: string) {
    const results = await new AxeBuilder({ page })
        .withTags([
            'wcag2a',
            'wcag2aa',
            'wcag21a',
            'wcag21aa',
            'wcag22aa',
        ])
        .analyze();

    expect(
        results.violations,
        `Violations Axe (${context}) :\n${formatAxeViolations(results.violations)}`,
    ).toEqual([]);
}

test.describe('Smoke tests authentifiés optionnels', () => {
    test.beforeEach(async ({ context, baseURL }) => {
        await setConsentCookie(context, baseURL ?? E2E_BASE_URL);
    });

    test('un apprenant parcourt son espace et RESET-7 sans débordement', async ({ page }) => {
        test.skip(
            !learnerCredentials,
            'Définir TEST_USER_EMAIL et TEST_USER_PASSWORD dans .env.local pour activer ce scénario.',
        );
        if (!learnerCredentials) return;

        await login(page, learnerCredentials, '/espace');

        for (const path of ['/espace', '/espace/formations']) {
            await test.step(path, async () => {
                await expectAuthenticatedPage(page, path);
                await expectProgrammeScopedResumeLinks(page);
                await expectCourseCardsAreStructured(page);
            });
        }

        await test.step('/espace/formations/reset-7', async () => {
            await expectAuthenticatedPage(page, '/espace/formations/reset-7');
            await expectLockedStepsAreNotLinks(page);
        });

        await test.step('/espace/formations/reset-7/jour/1', async () => {
            let markSaveStarted: (() => void) | undefined;
            let releaseSaveResponse: (() => void) | undefined;
            const saveStarted = new Promise<void>((resolve) => {
                markSaveStarted = resolve;
            });
            const saveResponseReleased = new Promise<void>((resolve) => {
                releaseSaveResponse = resolve;
            });

            await page.route('**/api/learn/state', async (route) => {
                if (route.request().method() !== 'POST') {
                    await route.continue();
                    return;
                }

                markSaveStarted?.();
                await saveResponseReleased;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ version: '2026-01-01T00:00:00.000Z' }),
                });
            });
            await expectAuthenticatedPage(page, '/espace/formations/reset-7/jour/1');
            await expectDayStatusAndActionReason(page);

            const notesToggle = page.getByRole('button', { name: /note libre/i });
            if ((await notesToggle.getAttribute('aria-expanded')) !== 'true') {
                await notesToggle.click();
            }
            await page.getByLabel('Note libre du jour', { exact: true }).fill('Brouillon Playwright non persisté');
            await expect(page.getByText('Modifications en attente', { exact: true }).first()).toBeVisible();
            await saveStarted;
            await expect(page.getByText('Enregistrement…', { exact: true }).first()).toBeVisible();
            releaseSaveResponse?.();
            await expect(page.getByText('Enregistré', { exact: true }).first()).toBeVisible();
        });

        for (const path of [
            '/espace/journal',
            '/espace/notes',
            '/espace/ressources',
        ]) {
            await test.step(path, async () => {
                await expectAuthenticatedPage(page, path);
            });
        }

        await test.step('/espace/bilan', async () => {
            await expectAuthenticatedPage(page, '/espace/bilan');
            await expect(
                page.getByRole('heading', {
                    name: /^(?:tes repères prennent forme|ton parcours RESET-7 est accompli)$/i,
                }),
            ).toBeVisible();
        });

        await test.step('/espace/plan-30-jours', async () => {
            await expectAuthenticatedPage(page, '/espace/plan-30-jours');
            await expect(
                page.getByText(/^(?:disponible après RESET-7|RESET-7 terminé)$/i).first(),
            ).toBeVisible();
        });

        await test.step('/espace/compte', async () => {
            await expectAuthenticatedPage(page, '/espace/compte');
            await expectAccountDeepLinks(page);
        });

        if ((page.viewportSize()?.width ?? 1024) < 1024) {
            await test.step('navigation mobile Plus', async () => {
                await expectAuthenticatedPage(page, '/espace');
                await expectMobileSecondaryAccess(page);
            });
        }
    });

    test('le shell et les parcours apprenant respectent les règles Axe AA', async ({ page }, testInfo) => {
        test.skip(
            !['chromium-390', 'chromium-1440'].includes(testInfo.project.name),
            'L’analyse Axe authentifiée cible un mobile et un desktop.',
        );
        test.skip(
            !learnerCredentials,
            'Définir TEST_USER_EMAIL et TEST_USER_PASSWORD dans .env.local pour activer ce scénario.',
        );
        if (!learnerCredentials) return;

        await login(page, learnerCredentials, '/espace');
        await expectAuthenticatedPage(page, '/espace');
        await expectAxeAa(page, `shell ${testInfo.project.name}`);

        await expectAuthenticatedPage(page, '/espace/formations');
        await expectCourseCardsAreStructured(page);
        await expectAxeAa(page, `cartes formations ${testInfo.project.name}`);

        if (testInfo.project.name === 'chromium-390') {
            await page.getByRole('button', { name: 'Plus', exact: true }).click();
            await expect(page.getByRole('dialog', { name: 'Ton espace' })).toBeVisible();
            await expectAxeAa(page, 'dialogue Plus mobile');
        }

        if (testInfo.project.name === 'chromium-390') {
            await page.getByRole('dialog', { name: 'Ton espace' }).getByRole('button', { name: 'Fermer' }).click();
        }

        await expectAuthenticatedPage(page, '/espace/formations/reset-7');
        await expectLockedStepsAreNotLinks(page);
        await expectAxeAa(page, `parcours ${testInfo.project.name}`);
        if (testInfo.project.name === 'chromium-390') {
            await page.getByRole('button', { name: /parcours/i }).click();
            await expect(page.getByRole('dialog', { name: /reset[- ]7/i })).toBeVisible();
            await expectAxeAa(page, 'dialogue parcours mobile');
        }
    });

    test('les routes apprenant restent accessibles en lecture seule', async ({ page }, testInfo) => {
        test.skip(
            !['chromium-320', 'chromium-390', 'chromium-768', 'chromium-1024', 'chromium-1440'].includes(testInfo.project.name),
            'Le smoke test apprenant cible les cinq largeurs de référence.',
        );
        test.skip(
            !accountCredentials,
            'Définir des identifiants apprenant ou administrateur pour vérifier les routes.',
        );
        if (!accountCredentials) return;

        await login(page, accountCredentials, '/espace');
        for (const path of ['/espace', '/espace/formations']) {
            await expectAuthenticatedPage(page, path);
            await expectProgrammeScopedResumeLinks(page);
            await expectCourseCardsAreStructured(page);
        }

        await expectAuthenticatedPage(page, '/espace/formations/reset-7');
        await expectLockedStepsAreNotLinks(page);

        for (const path of ['/espace/journal', '/espace/notes', '/espace/ressources']) {
            await expectAuthenticatedPage(page, path);
        }

        await expectAuthenticatedPage(page, '/espace/bilan');
        await expect(
            page.getByRole('heading', {
                name: /^(?:tes repères prennent forme|ton parcours RESET-7 est accompli)$/i,
            }),
        ).toBeVisible();

        await expectAuthenticatedPage(page, '/espace/plan-30-jours');
        await expect(
            page.getByText(/^(?:disponible après RESET-7|RESET-7 terminé)$/i).first(),
        ).toBeVisible();

        if ((page.viewportSize()?.width ?? 1024) < 1024) {
            await expectAuthenticatedPage(page, '/espace');
            await expectMobileSecondaryAccess(page);
        }
    });

    test('les onglets et le confort de lecture du compte restent partageables', async ({ page }, testInfo) => {
        test.skip(
            testInfo.project.name !== 'chromium-390',
            'Ce parcours de réglages est vérifié une seule fois en mobile.',
        );
        test.skip(
            !accountCredentials,
            'Définir des identifiants apprenant ou administrateur pour vérifier le compte.',
        );
        if (!accountCredentials) return;

        await login(page, accountCredentials, '/espace/compte');
        await expectAccountDeepLinks(page);

        const root = page.locator('html');
        const darkTheme = page.getByRole('button', { name: 'Sombre Repos visuel' });
        const systemTheme = page.getByRole('button', { name: 'Système Suit ton appareil' });
        await darkTheme.click();
        await expect(root).toHaveAttribute('data-theme', 'dark');
        await expect(root).toHaveClass(/\bdark\b/);

        await systemTheme.click();
        await expect(root).toHaveAttribute('data-theme-preference', 'system');
        const expectedSystemTheme = await page.evaluate(() =>
            window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        );
        await expect(root).toHaveAttribute('data-theme', expectedSystemTheme);

        await page.getByRole('button', { name: 'Grand', exact: true }).click();
        await expect.poll(() =>
            page.evaluate(() =>
                getComputedStyle(document.documentElement).getPropertyValue('--text-scale').trim(),
            ),
        ).toBe('1.25');
        await expectNoHorizontalOverflow(page);

        const reduceMotion = page.getByRole('switch', { name: 'Réduire les animations' });
        await page.keyboard.press('Tab');
        await expect(reduceMotion).toBeFocused();
        await page.keyboard.press('Space');
        await expect(root).toHaveClass(/\breduce-motion\b/);
        await page.keyboard.press('Space');
        await expect(root).not.toHaveClass(/\breduce-motion\b/);
        await page.getByRole('button', { name: 'Standard', exact: true }).click();
    });

    test('un administrateur ouvre les principales listes de gestion', async ({ page }) => {
        test.skip(
            !adminCredentials,
            'Définir TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD ou ADMIN_EMAIL/ADMIN_PASSWORD dans .env.local pour activer ce scénario.',
        );
        if (!adminCredentials) return;

        await login(page, adminCredentials, '/administration');

        for (const path of [
            '/administration',
            '/administration/programmes',
            '/administration/articles',
            '/administration/apprenants',
            '/espace',
        ]) {
            await test.step(path, async () => {
                await expectAuthenticatedPage(page, path);
            });
        }
    });
});
