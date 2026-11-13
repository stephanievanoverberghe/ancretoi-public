import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Dialog, type Locator, type Page } from '@playwright/test';

import {
    E2E_BASE_URL,
    expectAuthenticatedVisibleRoute,
    expectNoHorizontalOverflow,
    loginWithCredentials,
    readE2ECredentials,
    setConsentCookie,
    settlePageLayout,
} from './support';

const NEWSLETTER_SEND_GLOB = '**/api/admin/newsletter/send**';
const XL_BREAKPOINT = 1280;

const adminCredentials =
    readE2ECredentials(
        process.env.TEST_ADMIN_EMAIL,
        process.env.TEST_ADMIN_PASSWORD,
    ) ?? readE2ECredentials(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);

const primaryAdminRoutes = [
    '/administration',
    '/administration/programmes',
    '/administration/articles',
    '/administration/categories',
    '/administration/inspirations',
    '/administration/apprenants',
    '/administration/newsletter',
] as const;

const axeTags = [
    'wcag2a',
    'wcag2aa',
    'wcag21a',
    'wcag21aa',
    'wcag22aa',
] as const;

async function loginAsAdmin(page: Page, nextPath = '/administration') {
    if (!adminCredentials) throw new Error('Identifiants admin E2E absents.');
    await loginWithCredentials(page, adminCredentials, nextPath);
}

function onlyProjects(projectName: string, allowed: readonly string[]) {
    test.skip(
        !allowed.includes(projectName),
        `Scénario ciblé sur ${allowed.join(', ')}.`,
    );
}

async function openVisibleAdminNavigation(page: Page): Promise<Locator> {
    const width = page.viewportSize()?.width ?? 1440;

    if (width < XL_BREAKPOINT) {
        await page
            .getByRole('button', { name: 'Ouvrir la navigation admin' })
            .click();
        const drawer = page.getByRole('dialog', { name: 'Administration' });
        await expect(drawer).toBeVisible();
        return drawer.getByRole('navigation', {
            name: 'Navigation administration mobile',
        });
    }

    return page.getByRole('navigation', { name: 'Navigation administration' });
}

async function expectAxeAa(page: Page, context: string) {
    const results = await new AxeBuilder({ page }).withTags([...axeTags]).analyze();
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
        `Violations Axe (${context}) :\n${summary}`,
    ).toEqual([]);
}

async function openResponsiveFilters(
    page: Page,
    toolbarName: string,
    summaryName: string | RegExp,
) {
    const toolbar = page.getByRole('search', { name: toolbarName });
    await expect(toolbar).toBeVisible();

    const mobileDetails = toolbar.locator('details:visible');
    if ((await mobileDetails.count()) > 0) {
        const summary = mobileDetails.locator('summary');
        await expect(summary).toContainText(summaryName);
        await summary.scrollIntoViewIfNeeded();
        await summary.click();
        await expect(mobileDetails).toHaveAttribute('open', '');
        return mobileDetails;
    }

    return toolbar;
}

async function pushAdminQueryState(page: Page, key: string, value: string) {
    await page.evaluate(
        ({ parameter, nextValue }) => {
            const url = new URL(window.location.href);
            if (nextValue) url.searchParams.set(parameter, nextValue);
            else url.searchParams.delete(parameter);
            window.history.pushState(window.history.state, '', url);
            window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
        },
        { parameter: key, nextValue: value },
    );
}

async function fillNewsletterCampaign(page: Page, tag = 'vip-e2e') {
    await page.getByRole('textbox', { name: 'Sujet', exact: true }).fill('Campagne E2E sans envoi');
    await page
        .getByRole('textbox', { name: 'Contenu HTML', exact: true })
        .fill('<h2>Test E2E</h2><p>Aucun email réel.</p>');
    await page.getByRole('textbox', { name: 'Email test', exact: true }).fill('playwright@example.test');
    await page.getByRole('textbox', { name: 'Tag destinataire', exact: true }).fill(tag);
}

test.describe('Administration authentifiée, responsive et sans mutation réelle', () => {
    test.beforeEach(async ({ context, page, baseURL }) => {
        test.skip(
            !adminCredentials,
            'Définir TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD ou ADMIN_EMAIL/ADMIN_PASSWORD pour activer les scénarios admin.',
        );
        await setConsentCookie(context, baseURL ?? E2E_BASE_URL);

        // Garde-fou global : aucun scénario ne peut joindre le fournisseur email.
        await page.route(NEWSLETTER_SEND_GLOB, async (route) => {
            await route.abort('blockedbyclient');
        });
    });

    test('les routes principales tiennent à 125 % sans débordement sur chaque viewport', async ({
        page,
    }) => {
        test.setTimeout(180_000);
        await page.addInitScript(() => {
            localStorage.setItem(
                'a11y-prefs',
                JSON.stringify({ textScale: 1.25, reduceMotion: false }),
            );
        });

        await loginAsAdmin(page);

        const root = page.locator('html');
        await expect
            .poll(() =>
                root.evaluate((element) =>
                    getComputedStyle(element)
                        .getPropertyValue('--text-scale')
                        .trim(),
                ),
            )
            .toBe('1.25');

        const width = page.viewportSize()?.width ?? 1440;
        const drawerTrigger = page.getByRole('button', {
            name: 'Ouvrir la navigation admin',
        });

        if (width < XL_BREAKPOINT) {
            await expect(drawerTrigger).toBeVisible();
            const navigation = await openVisibleAdminNavigation(page);
            await expect(
                navigation.getByRole('link', { name: /^Tableau de bord/ }),
            ).toHaveAttribute('aria-current', 'page');
            await page.keyboard.press('Escape');
            await expect(
                page.getByRole('dialog', { name: 'Administration' }),
            ).toBeHidden();
        } else {
            await expect(drawerTrigger).toBeHidden();
            const navigation = page.getByRole('navigation', {
                name: 'Navigation administration',
            });
            await expect(navigation).toBeVisible();
            await expect(
                navigation.getByRole('link', { name: /^Tableau de bord/ }),
            ).toHaveAttribute('aria-current', 'page');
        }

        for (const path of primaryAdminRoutes) {
            await test.step(path, async () => {
                await expectAuthenticatedVisibleRoute(page, path);
                await expectNoHorizontalOverflow(page);
            });
        }
    });

    test('le shell expose navigation active, Créer et compte sans cloche fictive', async ({
        page,
    }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390', 'chromium-1440']);
        await loginAsAdmin(page);

        await expect(
            page.getByRole('button', { name: /notification/i }),
        ).toHaveCount(0);

        await page
            .getByRole('button', { name: /^Créer(?: un contenu)?$/ })
            .click();
        const createDialog = page.getByRole('dialog', {
            name: 'Créer un contenu',
        });
        await expect(createDialog).toBeVisible();
        const createNavigation = createDialog.getByRole('navigation', {
            name: 'Créer un contenu',
        });
        await expect(
            createNavigation.getByRole('link', { name: /^Programme/ }),
        ).toHaveAttribute('href', '/administration/programmes/nouveau');
        await expect(
            createNavigation.getByRole('link', { name: /^Article/ }),
        ).toHaveAttribute('href', '/administration/articles/nouveau');
        await expect(
            createNavigation.getByRole('link', { name: /^Inspiration/ }),
        ).toHaveAttribute('href', '/administration/inspirations/nouveau');
        await page.keyboard.press('Escape');
        await expect(createDialog).toBeHidden();

        await page
            .getByRole('button', { name: 'Ouvrir le menu du compte' })
            .click();
        const accountDialog = page.getByRole('dialog', { name: 'Mon espace' });
        await expect(accountDialog).toBeVisible();
        await expect(
            accountDialog.getByRole('link', { name: 'Mon compte' }),
        ).toHaveAttribute('href', '/espace/compte');
        await expect(
            accountDialog.getByRole('link', { name: 'Voir le site' }),
        ).toHaveAttribute('href', '/');
        await expect(
            accountDialog.getByRole('button', { name: /déconnecter/i }),
        ).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(accountDialog).toBeHidden();

        let navigation = await openVisibleAdminNavigation(page);
        const dashboardLink = navigation.getByRole('link', {
            name: /^Tableau de bord/,
        });
        await expect(dashboardLink).toHaveAttribute('aria-current', 'page');
        const programmesLink = navigation.getByRole('link', {
            name: /^Programmes/,
        });
        await Promise.all([
            page.waitForURL((url) => url.pathname === '/administration/programmes'),
            programmesLink.click(),
        ]);

        navigation = await openVisibleAdminNavigation(page);
        await expect(
            navigation.getByRole('link', { name: /^Programmes/ }),
        ).toHaveAttribute('aria-current', 'page');
        if ((page.viewportSize()?.width ?? 1440) < XL_BREAKPOINT) {
            await page.keyboard.press('Escape');
        }
    });

    test('les filtres programmes restent synchronisés avec l’URL', async ({ page }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390', 'chromium-1440']);
        await loginAsAdmin(page, '/administration/programmes');

        const filters = await openResponsiveFilters(
            page,
            'Filtrer les programmes',
            /(?:Filtres et tri|Recherche et filtres)/,
        );
        const search = filters.locator(
            'input[aria-label="Rechercher un programme"]:visible',
        );
        const status = filters
            .locator('label:visible')
            .filter({ hasText: 'Filtrer par statut' })
            .locator('select');

        await search.fill('__e2e_absent__');
        await expect
            .poll(() => new URL(page.url()).searchParams.get('q'))
            .toBe('__e2e_absent__');
        await status.selectOption('published');
        await expect
            .poll(() => new URL(page.url()).searchParams.get('statut'))
            .toBe('published');
        await expect
            .poll(() => new URL(page.url()).searchParams.get('q'))
            .toBe('__e2e_absent__');

        await expect(
            page.getByText(
                /^(?:Aucun résultat avec ces filtres|Aucun programme pour le moment)$/,
            ),
        ).toBeVisible();
        await filters.getByRole('button', { name: 'Effacer la recherche' }).click();
        await status.selectOption('all');
        await expect
            .poll(() => new URL(page.url()).searchParams.has('q'))
            .toBe(false);
        await expect
            .poll(() => new URL(page.url()).searchParams.has('statut'))
            .toBe(false);
    });

    test('retour et avance resynchronisent deux collections et les apprenants', async ({ page }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390', 'chromium-1366']);
        await loginAsAdmin(page);

        const cases = [
            {
                path: '/administration/programmes',
                toolbar: 'Filtrer les programmes',
                search: 'Rechercher un programme',
            },
            {
                path: '/administration/articles',
                toolbar: 'Filtrer les articles',
                search: 'Rechercher un article',
            },
            {
                path: '/administration/apprenants',
                toolbar: 'Filtrer les apprenants',
                search: 'Rechercher un utilisateur',
            },
        ] as const;

        for (const item of cases) {
            await test.step(item.path, async () => {
                const response = await page.goto(`${item.path}?origine=e2e`, { waitUntil: 'domcontentloaded' });
                expect(response?.status()).toBeLessThan(400);

                const toolbar = page.getByRole('search', { name: item.toolbar });
                const mobile = (page.viewportSize()?.width ?? 1366) < XL_BREAKPOINT;
                if (mobile) {
                    const mobileFilters = toolbar.locator('details');
                    await expect(mobileFilters).toBeVisible();
                    await mobileFilters.locator('summary').click();
                    await expect(mobileFilters).toHaveAttribute('open', '');
                }
                const search = toolbar.locator(`input[aria-label="${item.search}"]:visible`);
                await expect(search).toBeVisible();

                await search.fill('interaction-e2e');
                await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('interaction-e2e');
                expect(new URL(page.url()).searchParams.get('origine')).toBe('e2e');

                await pushAdminQueryState(page, 'q', 'premier-etat');
                await expect(search).toHaveValue('premier-etat');
                await pushAdminQueryState(page, 'q', 'second-etat');
                await expect(search).toHaveValue('second-etat');

                await page.evaluate(() => window.history.back());
                await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('premier-etat');
                await expect(search).toHaveValue('premier-etat');

                await page.evaluate(() => window.history.forward());
                await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('second-etat');
                await expect(search).toHaveValue('second-etat');
                expect(new URL(page.url()).searchParams.get('origine')).toBe('e2e');
            });
        }
    });

    test('les filtres apprenants rechargent le serveur et réinitialisent la page', async ({ page }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390', 'chromium-1366']);
        await loginAsAdmin(page);

        const response = await page.goto('/administration/apprenants?role=admin&page=2&origine=e2e', { waitUntil: 'domcontentloaded' });
        expect(response?.status()).toBeLessThan(400);
        const mobile = (page.viewportSize()?.width ?? 1366) < 1024;

        if (!mobile) {
            const pageOneHref = await page.getByRole('link', { name: 'Page 1' }).getAttribute('href');
            expect(pageOneHref).toBeTruthy();
            const pageOneUrl = new URL(pageOneHref!, page.url());
            expect(pageOneUrl.searchParams.get('role')).toBe('admin');
            expect(pageOneUrl.searchParams.get('origine')).toBe('e2e');
            expect(pageOneUrl.searchParams.has('page')).toBe(false);
        }

        const waitForLearnerRsc = (expected: Record<string, string>) => page.waitForResponse((candidate) => {
            const request = candidate.request();
            const url = new URL(candidate.url());
            const isRsc = request.headers().rsc === '1' || url.searchParams.has('_rsc');
            return request.method() === 'GET'
                && isRsc
                && url.pathname === '/administration/apprenants'
                && Object.entries(expected).every(([key, value]) => url.searchParams.get(key) === value);
        });

        const toolbar = page.getByRole('search', { name: 'Filtrer les apprenants' });
        const search = toolbar.getByRole('searchbox', { name: 'Rechercher un utilisateur' });
        const query = '__e2e_rechargement_serveur__';
        const searchResponsePromise = waitForLearnerRsc({ q: query, role: 'admin', origine: 'e2e' });
        await search.fill(query);
        const searchResponse = await searchResponsePromise;
        expect(searchResponse.status()).toBeLessThan(400);
        await expect.poll(() => new URL(page.url()).searchParams.has('page')).toBe(false);
        await expect(page.getByRole('heading', { name: 'Aucun résultat' })).toBeVisible();

        const idPrefix = mobile ? 'users-mobile' : 'users-desktop';
        const openMobileFilters = async () => {
            if (!mobile) return;
            const details = toolbar.locator('details');
            if ((await details.getAttribute('open')) === null) await details.locator('summary').click();
        };

        await openMobileFilters();
        const statusResponsePromise = waitForLearnerRsc({ q: query, role: 'admin', status: 'active', origine: 'e2e' });
        await page.locator(`#${idPrefix}-status`).selectOption('active');
        const statusResponse = await statusResponsePromise;
        expect(statusResponse.status()).toBeLessThan(400);
        await expect.poll(() => new URL(page.url()).searchParams.has('page')).toBe(false);

        await openMobileFilters();
        const sortResponsePromise = waitForLearnerRsc({ q: query, role: 'admin', status: 'active', sort: 'alpha', origine: 'e2e' });
        await page.locator(`#${idPrefix}-sort`).selectOption('alpha');
        const sortResponse = await sortResponsePromise;
        expect(sortResponse.status()).toBeLessThan(400);

        await expect.poll(() => new URL(page.url()).searchParams.get('sort')).toBe('alpha');
        if (!mobile) {
            await expect.poll(async () => {
                const href = await page.getByRole('link', { name: 'Page 1' }).getAttribute('href');
                return href ? new URL(href, page.url()).searchParams.get('sort') : null;
            }).toBe('alpha');
        }

        const currentUrl = new URL(page.url());
        expect(currentUrl.searchParams.has('page')).toBe(false);
        expect(currentUrl.searchParams.get('origine')).toBe('e2e');
        if (!mobile) {
            const preservedHref = await page.getByRole('link', { name: 'Page 1' }).getAttribute('href');
            const preservedUrl = new URL(preservedHref!, page.url());
            for (const [key, value] of [
                ['q', query],
                ['role', 'admin'],
                ['status', 'active'],
                ['sort', 'alpha'],
                ['origine', 'e2e'],
            ] as const) {
                expect(preservedUrl.searchParams.get(key)).toBe(value);
            }
            expect(preservedUrl.searchParams.has('page')).toBe(false);
        }
    });

    test('la vue dense programmes ne s’active qu’avec assez d’espace', async ({
        page,
    }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-1440']);
        await page.setViewportSize({ width: 1800, height: 1000 });
        await loginAsAdmin(page, '/administration/programmes');

        const editLinks = page.getByRole('link', { name: /Éditer/i });
        test.skip(
            (await editLinks.count()) === 0,
            'Aucun programme disponible pour vérifier les vues carte et tableau.',
        );

        const viewGroup = page.getByRole('group', { name: 'Mode d’affichage' });
        const tableButton = viewGroup.getByRole('button', { name: 'Tableau' });
        await tableButton.click();
        await expect(tableButton).toHaveAttribute('aria-pressed', 'true');
        await expect
            .poll(() => new URL(page.url()).searchParams.get('vue'))
            .toBe('table');
        await expect(page.getByRole('table')).toBeVisible();

        const cardsButton = viewGroup.getByRole('button', { name: 'Cartes' });
        await cardsButton.click();
        await expect(cardsButton).toHaveAttribute('aria-pressed', 'true');
        await expect
            .poll(() => new URL(page.url()).searchParams.has('vue'))
            .toBe(false);
    });

    test('les aperçus rapides se ferment avec Échap', async ({ page }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390', 'chromium-1440']);
        await loginAsAdmin(page);

        let openedQuickViews = 0;
        for (const path of [
            '/administration/programmes',
            '/administration/articles',
            '/administration/inspirations',
        ]) {
            await expectAuthenticatedVisibleRoute(page, path);
            const previewButtons = page.getByRole('button', { name: /aperçu/i });
            if ((await previewButtons.count()) === 0) continue;

            await previewButtons.first().click();
            const dialog = page.getByRole('dialog').last();
            await expect(dialog).toBeVisible();
            await expect(dialog.getByRole('button', { name: 'Fermer' })).toBeVisible();
            await page.keyboard.press('Escape');
            await expect(dialog).toBeHidden();
            openedQuickViews += 1;
        }

        test.skip(
            openedQuickViews === 0,
            'Aucune fixture programme, article ou inspiration pour ouvrir une quick view.',
        );
    });

    test('les archives restent consultables sans restauration ni suppression', async ({
        page,
    }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390']);
        let mutationCalls = 0;
        await page.route('**/api/admin/blog/posts/archives**', async (route) => {
            if (route.request().method() === 'GET') {
                await route.continue();
                return;
            }
            mutationCalls += 1;
            await route.fulfill({
                status: 409,
                contentType: 'application/json',
                body: JSON.stringify({ ok: false, error: 'e2e_mutation_blocked' }),
            });
        });

        await loginAsAdmin(page, '/administration/articles/archives');
        await expectNoHorizontalOverflow(page);
        const restoreButtons = page.getByRole('button', { name: 'Restaurer' });

        if ((await restoreButtons.count()) === 0) {
            await expect(
                page.getByText('Aucun article archivé', { exact: true }),
            ).toBeVisible();
            expect(mutationCalls).toBe(0);
            return;
        }

        await expect(restoreButtons.first()).toBeVisible();
        await page.getByRole('button', { name: 'Supprimer', exact: true }).first().click();
        const dialog = page.getByRole('dialog', {
            name: /Supprimer définitivement/,
        });
        await expect(dialog).toBeVisible();
        const confirmation = dialog.getByRole('checkbox');
        await expect(confirmation).toBeEnabled();
        await expect(
            dialog.getByRole('button', { name: 'Supprimer définitivement' }),
        ).toBeDisabled();
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
        expect(mutationCalls).toBe(0);
    });

    test('les archives inspirations n’exposent aucune suppression définitive', async ({
        page,
    }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390']);
        let mutationCalls = 0;
        await page.route('**/api/admin/inspirations**', async (route) => {
            if (route.request().method() === 'GET') {
                await route.continue();
                return;
            }
            mutationCalls += 1;
            await route.fulfill({
                status: 409,
                contentType: 'application/json',
                body: JSON.stringify({ ok: false, error: 'e2e_mutation_blocked' }),
            });
        });

        await loginAsAdmin(page, '/administration/inspirations/archives');
        await expectNoHorizontalOverflow(page);
        await expect(
            page.getByRole('button', { name: /Supprimer/i }),
        ).toHaveCount(0);

        const restoreButtons = page.getByRole('button', { name: 'Restaurer' });
        if ((await restoreButtons.count()) > 0) {
            await expect(restoreButtons.first()).toBeVisible();
            await expect(
                page.getByText(
                    'La suppression définitive n’est pas disponible pour les inspirations.',
                    { exact: true },
                ).first(),
            ).toBeVisible();
        } else {
            await expect(
                page.getByText('Aucune inspiration archivée', { exact: true }),
            ).toBeVisible();
        }

        expect(mutationCalls).toBe(0);
    });

    test('l’éditeur mobile expose dirty puis saving sans écrire en base', async ({
        page,
    }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390']);

        let interceptedBody = '';
        let markRequestStarted: (() => void) | undefined;
        let releaseResponse: (() => void) | undefined;
        const requestStarted = new Promise<void>((resolve) => {
            markRequestStarted = resolve;
        });
        const responseReleased = new Promise<void>((resolve) => {
            releaseResponse = resolve;
        });

        await page.route('**/api/admin/programs/create', async (route) => {
            if (route.request().method() !== 'POST') {
                await route.continue();
                return;
            }

            interceptedBody = route.request().postData() ?? '';
            markRequestStarted?.();
            await responseReleased;
            await route.fulfill({
                status: 409,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'e2e_mutation_blocked' }),
            });
        });

        await loginAsAdmin(page, '/administration/programmes/nouveau');
        await page
            .getByRole('textbox', { name: 'Slug obligatoire', exact: true })
            .fill('programme-e2e-sans-ecriture');
        await page
            .getByRole('textbox', { name: 'Titre obligatoire', exact: true })
            .fill('Programme E2E sans écriture');
        await expect(
            page.getByText('Modifications non enregistrées', { exact: true }),
        ).toBeVisible();
        await expectNoHorizontalOverflow(page);

        const submit = page.getByRole('button', {
            name: 'Créer le programme',
        });
        await submit.click();
        await requestStarted;
        await expect(page.getByText('Création…', { exact: true }).first()).toBeVisible();
        expect(interceptedBody).toContain('programme-e2e-sans-ecriture');

        releaseResponse?.();
        await expect(
            page.getByText('Échec de l’enregistrement', { exact: true }),
        ).toBeVisible();
        await expect(page).toHaveURL(/\/administration\/programmes\/nouveau$/);
    });

    test('un retour navigateur protège un formulaire sale sans polluer l’historique', async ({ page }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390', 'chromium-1366']);
        await loginAsAdmin(page, '/administration/articles');
        await page.goto('/administration/articles/nouveau', { waitUntil: 'domcontentloaded' });

        const historyLength = await page.evaluate(() => window.history.length);
        await page.getByRole('textbox', { name: /Titre \*/ }).fill('Article E2E non enregistré');
        await expect(page.getByText('Modifications non enregistrées', { exact: true })).toBeVisible();

        const canceledDialogs: Array<{ type: string; message: string }> = [];
        let resolveCanceledDialog: (() => void) | undefined;
        const canceledDialogHandled = new Promise<void>((resolve) => {
            resolveCanceledDialog = resolve;
        });
        const dismissNavigation = (dialog: Dialog) => {
            canceledDialogs.push({ type: dialog.type(), message: dialog.message() });
            void dialog.dismiss().then(() => resolveCanceledDialog?.());
        };
        page.on('dialog', dismissNavigation);
        await page.evaluate(() => window.history.back());
        await canceledDialogHandled;

        await expect.poll(() => new URL(page.url()).pathname).toBe('/administration/articles/nouveau');
        await page.waitForTimeout(250);
        page.off('dialog', dismissNavigation);
        expect(canceledDialogs.some((dialog) =>
            dialog.type === 'beforeunload'
            || (dialog.type === 'confirm' && dialog.message.includes('modifications ne sont pas enregistrées')),
        )).toBe(true);
        await expect(page).toHaveURL(/\/administration\/articles\/nouveau$/);
        expect(await page.evaluate(() => window.history.length)).toBe(historyLength);

        const acceptedDialogs: Array<{ type: string; message: string }> = [];
        const acceptNavigation = (dialog: Dialog) => {
            acceptedDialogs.push({ type: dialog.type(), message: dialog.message() });
            void dialog.accept();
        };
        page.on('dialog', acceptNavigation);
        await page.evaluate(() => window.history.back());
        await expect.poll(() => new URL(page.url()).pathname).toBe('/administration/articles');
        page.off('dialog', acceptNavigation);
        expect(acceptedDialogs.some((dialog) =>
            dialog.type === 'beforeunload'
            || (dialog.type === 'confirm' && dialog.message.includes('modifications ne sont pas enregistrées')),
        )).toBe(true);
        expect(acceptedDialogs.every(({ type }) => type === 'confirm' || type === 'beforeunload')).toBe(true);
        expect(await page.evaluate(() => window.history.length)).toBe(historyLength);
    });

    test('un compte sans avatar conserve un profil accessible', async ({ page }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390']);
        await loginAsAdmin(page, '/administration/apprenants');

        const profileLinks = page.getByRole('link', { name: 'Ouvrir le profil' });
        let fallbackCard: Locator | null = null;
        for (let index = 0; index < (await profileLinks.count()); index += 1) {
            const card = profileLinks.nth(index).locator('xpath=ancestor::li[1]');
            if ((await card.locator('img').count()) === 0) {
                fallbackCard = card;
                break;
            }
        }

        test.skip(!fallbackCard, 'Aucune fixture apprenant sans avatar.');
        await expect(fallbackCard!).toBeVisible();
        await expect(
            fallbackCard!.getByRole('link', { name: 'Ouvrir le profil' }),
        ).toBeVisible();
    });

    test('un compte sans inscription conserve un état explicite', async ({ page }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390']);
        await loginAsAdmin(page, '/administration/apprenants');

        const emptyEnrollment = page.getByText(/^0 parcours · 0 terminé$/).first();
        test.skip(
            (await emptyEnrollment.count()) === 0,
            'Aucune fixture apprenant sans inscription.',
        );
        await expect(emptyEnrollment).toBeVisible();
        await expect(
            emptyEnrollment
                .locator('xpath=ancestor::li[1]')
                .getByRole('link', { name: 'Ouvrir le profil' }),
        ).toBeVisible();
    });

    for (const expectedProgress of [0, 100] as const) {
        test(`une progression ${expectedProgress} % reste représentée exactement`, async ({
            page,
        }, testInfo) => {
            onlyProjects(testInfo.project.name, ['chromium-390']);
            await loginAsAdmin(page, '/administration/apprenants');

            const progressbars = page.getByRole('progressbar', {
                name: /Progression moyenne de/,
            });
            const values = await progressbars.evaluateAll((elements) =>
                elements.map((element) =>
                    Number(element.getAttribute('aria-valuenow')),
                ),
            );
            test.skip(
                !values.includes(expectedProgress),
                `Aucune fixture apprenant avec une progression à ${expectedProgress} %.`,
            );
            expect(values).toContain(expectedProgress);
        });
    }

    test('les onglets apprenant gèrent flèches, Home et End', async ({ page }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390']);
        await loginAsAdmin(page, '/administration/apprenants');

        const profileLink = page.getByRole('link', { name: 'Ouvrir le profil' }).first();
        test.skip((await profileLink.count()) === 0, 'Aucune fixture apprenant.');
        await profileLink.click();

        const tablist = page.getByRole('tablist', { name: 'Sections du profil' });
        await expect(tablist).toBeVisible();
        const identity = tablist.getByRole('tab', { name: 'Identité' });
        const preferences = tablist.getByRole('tab', { name: 'Préférences' });
        const enrollments = tablist.getByRole('tab', { name: 'Inscriptions' });
        const stats = tablist.getByRole('tab', { name: 'Statistiques' });

        const tabs = [identity, preferences, enrollments, stats];
        const controls = await Promise.all(
            tabs.map((tab) => tab.getAttribute('aria-controls')),
        );
        expect(controls.every(Boolean)).toBe(true);
        expect(new Set(controls).size).toBe(4);

        await identity.focus();
        await identity.press('End');
        await expect(stats).toBeFocused();
        await expect(stats).toHaveAttribute('aria-selected', 'true');

        await stats.press('Home');
        await expect(identity).toBeFocused();
        await expect(identity).toHaveAttribute('aria-selected', 'true');

        await identity.press('ArrowRight');
        await expect(preferences).toBeFocused();
        await expect(preferences).toHaveAttribute('aria-selected', 'true');

        await preferences.press('ArrowLeft');
        await expect(identity).toBeFocused();
        await expect(identity).toHaveAttribute('aria-selected', 'true');
    });

    test('la newsletter expose cinq statuts, le tag et un état vide filtré', async ({
        page,
    }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390', 'chromium-1440']);
        await loginAsAdmin(page, '/administration/newsletter');

        const filters = await openResponsiveFilters(
            page,
            'Filtrer les contacts newsletter',
            /(?:Filtres et tri|Recherche et filtres)/,
        );
        const status = filters.locator('select[name="status"]:visible');
        const statusValues = await status.locator('option').evaluateAll((options) =>
            options.map((option) => (option as HTMLOptionElement).value),
        );
        expect(statusValues).toEqual([
            'all',
            'confirmed',
            'pending',
            'unsubscribed',
            'bounced',
            'complained',
        ]);

        await filters.locator('input[name="q"]:visible').fill('__e2e_absent__');
        await status.selectOption('complained');
        await filters.locator('input[name="tag"]:visible').fill('e2e-absent');
        await filters.getByRole('button', { name: 'Appliquer' }).click();

        await expect
            .poll(() => new URL(page.url()).searchParams.get('status'))
            .toBe('complained');
        await expect
            .poll(() => new URL(page.url()).searchParams.get('tag'))
            .toBe('e2e-absent');
        await expect(
            page.getByText(/^(?:Aucun contact newsletter|Aucun résultat)$/),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: 'Préparer l’envoi global' }),
        ).toBeDisabled();
    });

    test('test, revue, annulation et échec partiel newsletter restent entièrement simulés', async ({
        page,
    }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390', 'chromium-1440']);
        await page.unroute(NEWSLETTER_SEND_GLOB);

        const calls: Array<{ method: string; mode: string | null }> = [];
        await page.route(NEWSLETTER_SEND_GLOB, async (route) => {
            const request = route.request();
            const method = request.method();

            const body = request.postData() ?? '';
            const mode = body.match(/name="mode"\r?\n\r?\n([^\r\n]+)/)?.[1] ?? null;
            calls.push({ method, mode });

            if (mode === 'test') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        ok: true,
                        mode: 'test',
                        reviewProof: 'preuve-e2e-sans-envoi',
                        audience: { total: 3, tag: 'vip-e2e' },
                    }),
                });
                return;
            }

            if (mode === 'bulk') {
                expect(body).toContain('preuve-e2e-sans-envoi');
                expect(body).toContain('ENVOYER');
                await route.fulfill({
                    status: 207,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        ok: false,
                        mode: 'bulk',
                        status: 'partial',
                        error: 'partial_send',
                        total: 3,
                        sent: 2,
                        failed: 1,
                        tag: 'vip-e2e',
                    }),
                });
                return;
            }

            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({ ok: false, error: 'bad_request' }),
            });
        });

        await loginAsAdmin(page, '/administration/newsletter');
        await fillNewsletterCampaign(page);

        const prepare = page.getByRole('button', {
            name: 'Préparer l’envoi global',
        });
        await expect(prepare).toBeDisabled();
        await page.getByRole('button', { name: 'Envoyer un test' }).click();
        await expect(
            page.getByText('Version testée, prête pour la revue', { exact: true }),
        ).toBeVisible();
        await expect(prepare).toBeEnabled();

        await prepare.click();
        let review = page.getByRole('dialog', { name: 'Revue de l’envoi global' });
        await expect(review).toBeVisible();
        await expect(review.getByText('3', { exact: true })).toBeVisible();
        await expect(
            review.getByTitle('Aperçu du contenu de la newsletter'),
        ).toHaveAttribute('sandbox', '');
        await review.getByRole('button', { name: 'Annuler', exact: true }).click();
        await expect(review).toBeHidden();

        await prepare.click();
        review = page.getByRole('dialog', { name: 'Revue de l’envoi global' });
        const bulkButton = review.getByRole('button', {
            name: 'Envoyer à 3 contacts',
        });
        await expect(bulkButton).toBeDisabled();
        await review
            .getByRole('textbox', { name: 'Confirmation', exact: true })
            .fill('envoyer');
        await expect(bulkButton).toBeDisabled();
        await review
            .getByRole('textbox', { name: 'Confirmation', exact: true })
            .fill('ENVOYER');
        await expect(bulkButton).toBeEnabled();
        await bulkButton.click();

        await expect(review.getByText('Envoi partiel', { exact: true })).toBeVisible();
        await expect(review.getByText(/2 envoyés · 1 échec sur 3/)).toBeVisible();
        await review.getByRole('button', { name: 'Fermer', exact: true }).click();
        await expect(review).toBeHidden();
        await expect(prepare).toBeDisabled();
        expect(calls.filter((call) => call.mode === 'test')).toHaveLength(1);
        expect(calls.filter((call) => call.mode === 'bulk')).toHaveLength(1);
    });

    test('la newsletter invalide la preuve quand l’audience change et impose un nouveau test', async ({
        page,
    }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390', 'chromium-1440']);
        await page.unroute(NEWSLETTER_SEND_GLOB);

        const calls: string[] = [];
        await page.route(NEWSLETTER_SEND_GLOB, async (route) => {
            const body = route.request().postData() ?? '';
            const mode = body.match(/name="mode"\r?\n\r?\n([^\r\n]+)/)?.[1] ?? 'unknown';
            calls.push(mode);

            if (mode === 'test') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        ok: true,
                        mode: 'test',
                        reviewProof: 'preuve-audience-e2e',
                        audience: { total: 4, tag: 'vip-e2e' },
                    }),
                });
                return;
            }

            if (mode === 'bulk') {
                expect(body).toContain('preuve-audience-e2e');
                await route.fulfill({
                    status: 409,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        ok: false,
                        mode: 'bulk',
                        status: 'audience_changed',
                        error: 'audience_changed',
                        total: 4,
                        currentTotal: 3,
                        sent: 0,
                        failed: 0,
                        tag: 'vip-e2e',
                    }),
                });
                return;
            }

            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({ ok: false, error: 'bad_request' }),
            });
        });

        await loginAsAdmin(page, '/administration/newsletter');
        await fillNewsletterCampaign(page);
        await page.getByRole('button', { name: 'Envoyer un test' }).click();

        const prepare = page.getByRole('button', { name: 'Préparer l’envoi global' });
        await expect(prepare).toBeEnabled();
        await prepare.click();

        const review = page.getByRole('dialog', { name: 'Revue de l’envoi global' });
        await expect(review.getByText('4', { exact: true })).toBeVisible();
        await review.getByRole('textbox', { name: 'Confirmation', exact: true }).fill('ENVOYER');
        await review.getByRole('button', { name: 'Envoyer à 4 contacts' }).click();

        await expect(review.getByText('Audience modifiée', { exact: true })).toBeVisible();
        await expect(review.getByText(/Snapshot testé : 4 · audience actuelle : 3/)).toBeVisible();
        await review.getByRole('button', { name: 'Fermer', exact: true }).click();
        await expect(prepare).toBeDisabled();
        expect(calls).toEqual(['test', 'bulk']);
    });

    test('dashboard, collection, apprenants et newsletter respectent Axe AA', async ({
        page,
    }, testInfo) => {
        onlyProjects(testInfo.project.name, ['chromium-390', 'chromium-1440']);
        test.setTimeout(180_000);
        await loginAsAdmin(page);

        for (const path of [
            '/administration',
            '/administration/programmes',
            '/administration/apprenants',
            '/administration/newsletter',
        ]) {
            await test.step(path, async () => {
                await expectAuthenticatedVisibleRoute(page, path);
                await settlePageLayout(page);
                await expectAxeAa(page, `${path} · ${testInfo.project.name}`);
            });
        }
    });
});
