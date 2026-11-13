import { expect, test } from '@playwright/test';

import {
    CONSENT_COOKIE_NAME,
    E2E_BASE_URL,
    expectNoHorizontalOverflow,
    setConsentCookie,
} from './support';

const analyticsAvailable = Boolean(process.env.NEXT_PUBLIC_GA_ID?.trim());

test.describe('Thème, accessibilité et consentement', () => {
    test('applique le thème sombre et les préférences d’accessibilité avant l’hydratation', async ({
        page,
    }) => {
        await page.addInitScript(() => {
            localStorage.setItem('ancretoi-theme', 'dark');
            localStorage.setItem(
                'a11y-prefs',
                JSON.stringify({ textScale: 1.25, reduceMotion: true }),
            );
        });

        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const root = page.locator('html');
        await expect(root).toHaveAttribute('data-theme', 'dark');
        await expect(root).toHaveAttribute('data-theme-preference', 'dark');
        await expect(root).toHaveClass(/(?:^|\s)dark(?:\s|$)/);
        await expect(root).toHaveClass(/(?:^|\s)reduce-motion(?:\s|$)/);
        await expect
            .poll(() =>
                root.evaluate((element) =>
                    element.style.getPropertyValue('--text-scale'),
                ),
            )
            .toBe('1.25');
    });

    test('le lien d’évitement mène au contenu principal', async ({ context, page, baseURL }) => {
        await setConsentCookie(context, baseURL ?? E2E_BASE_URL);
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const skipLink = page.locator('a[href="#main-content"]');
        await page.keyboard.press('Tab');
        await expect(skipLink).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page.locator('main#main-content')).toBeFocused();
    });

    test('le refus global enregistre uniquement les cookies nécessaires', async ({
        context,
        page,
    }) => {
        await context.clearCookies({ name: CONSENT_COOKIE_NAME });
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const banner = page.getByRole('region', {
            name: /préférences de confidentialité/i,
        });
        await expect(banner).toBeVisible();
        await banner
            .getByRole('button', { name: /refuser les cookies optionnels/i })
            .click();
        await expect(banner).toBeHidden();

        const consentCookie = (await context.cookies()).find(
            (cookie) => cookie.name === CONSENT_COOKIE_NAME,
        );
        expect(consentCookie).toBeDefined();
        expect(JSON.parse(decodeURIComponent(consentCookie!.value))).toEqual({
            p: 0,
            a: 0,
            m: 0,
            v: 1,
        });
    });

    test('la page de préférences persiste un consentement explicite', async ({
        context,
        page,
        baseURL,
    }) => {
        await setConsentCookie(context, baseURL ?? E2E_BASE_URL);
        await page.goto('/cookies/preferences', { waitUntil: 'domcontentloaded' });

        await expect(
            page.getByRole('switch', { name: /cookies nécessaires/i }),
        ).toBeDisabled();
        await expect(
            page.getByRole('switch', { name: /cookies marketing/i }),
        ).toHaveCount(0);
        await expect(
            page.getByRole('switch', { name: /^préférences$/i }),
        ).toHaveCount(0);
        await expect(
            page.getByRole('switch', { name: /mesure d’audience/i }),
        ).toHaveCount(analyticsAvailable ? 1 : 0);
        await page.getByRole('button', { name: /tout accepter/i }).click();
        await page.getByRole('button', { name: /enregistrer mes choix/i }).click();
        await expect(
            page.getByText(/préférences enregistrées/i),
        ).toBeVisible();

        const consentCookie = (await context.cookies()).find(
            (cookie) => cookie.name === CONSENT_COOKIE_NAME,
        );
        expect(consentCookie).toBeDefined();
        expect(JSON.parse(decodeURIComponent(consentCookie!.value))).toEqual({
            p: 0,
            a: Number(analyticsAvailable),
            m: 0,
            v: 1,
        });
    });

    test('la première couche de consentement reste compacte et actionnable', async ({
        context,
        page,
    }, testInfo) => {
        test.skip(
            !['chromium-320', 'chromium-390'].includes(testInfo.project.name),
            'La compacité de la bannière est vérifiée aux deux largeurs mobiles.',
        );

        await context.clearCookies({ name: CONSENT_COOKIE_NAME });
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const banner = page.getByRole('region', {
            name: /préférences de confidentialité/i,
        });
        const actions = [
            banner.getByRole('button', {
                name: /accepter les cookies optionnels/i,
            }),
            banner.getByRole('button', {
                name: /refuser les cookies optionnels/i,
            }),
            banner.getByRole('link', { name: /personnaliser/i }),
        ];

        await expect(banner).toBeVisible();
        for (const action of actions) await expect(action).toBeVisible();
        await expect(actions[2]).toHaveAttribute('href', '/cookies/preferences');

        const bannerBox = await banner.boundingBox();
        const viewport = page.viewportSize();
        expect(bannerBox).not.toBeNull();
        expect(viewport).not.toBeNull();
        expect(bannerBox!.height).toBeLessThanOrEqual(viewport!.height * 0.55);
        expect(bannerBox!.x).toBeGreaterThanOrEqual(-1);
        expect(bannerBox!.x + bannerBox!.width).toBeLessThanOrEqual(
            viewport!.width + 1,
        );

        const actionWidths = await Promise.all(
            actions.map(async (action) => (await action.boundingBox())!.width),
        );
        expect(Math.max(...actionWidths) - Math.min(...actionWidths)).toBeLessThanOrEqual(2);
        await expectNoHorizontalOverflow(page);
    });
});
