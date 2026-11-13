import { expect, type BrowserContext, type Page } from '@playwright/test';

export const E2E_BASE_URL = 'http://127.0.0.1:3210';
export const CONSENT_COOKIE_NAME = 'at_consent';

export type E2ECredentials = {
    email: string;
    password: string;
};

export function readE2ECredentials(
    email: string | undefined,
    password: string | undefined,
): E2ECredentials | null {
    const normalizedEmail = email?.trim();
    const normalizedPassword = password?.trim();

    if (!normalizedEmail || !normalizedPassword) return null;
    return { email: normalizedEmail, password: normalizedPassword };
}

type ConsentChoice = {
    preferences: boolean;
    analytics: boolean;
    marketing: boolean;
};

export async function setConsentCookie(
    context: BrowserContext,
    baseURL = E2E_BASE_URL,
    choice: ConsentChoice = {
        preferences: false,
        analytics: false,
        marketing: false,
    },
) {
    const value = encodeURIComponent(
        JSON.stringify({
            p: Number(choice.preferences),
            a: Number(choice.analytics),
            m: Number(choice.marketing),
            v: 1,
        }),
    );

    await context.addCookies([
        {
            name: CONSENT_COOKIE_NAME,
            value,
            url: baseURL,
            sameSite: 'Lax',
        },
    ]);
}

export async function settlePageLayout(page: Page) {
    await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise<void>((resolveFrame) => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => resolveFrame());
            });
        });
    });
}

export async function loginWithCredentials(
    page: Page,
    credentials: E2ECredentials,
    nextPath: string,
) {
    await page.goto(`/connexion?next=${encodeURIComponent(nextPath)}`, {
        waitUntil: 'domcontentloaded',
    });
    await page.waitForLoadState('networkidle');
    await page
        .getByRole('textbox', { name: 'Adresse e-mail', exact: true })
        .fill(credentials.email);
    await page.getByLabel(/^mot de passe/i).fill(credentials.password);

    const submit = page.locator('#main-content').getByRole('button', {
        name: /^se connecter$/i,
    });
    await expect(submit).toBeEnabled();

    await Promise.all([
        page.waitForURL(
            (url) =>
                url.pathname === nextPath ||
                url.pathname.startsWith(`${nextPath}/`),
            { timeout: 20_000 },
        ),
        submit.click(),
    ]);
}

export async function expectAuthenticatedVisibleRoute(page: Page, path: string) {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    const expectedPathname = new URL(path, E2E_BASE_URL).pathname;

    expect(response, `La navigation vers ${path} doit produire une réponse`).not.toBeNull();
    expect(response?.status(), `La route ${path} doit répondre sans erreur HTTP`).toBeLessThan(400);
    expect(new URL(page.url()).pathname).toBe(expectedPathname);

    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
    await expect(main).not.toContainText(/le site rencontre un problème temporaire/i);
    await settlePageLayout(page);
}

export async function expectHealthyVisibleRoute(page: Page, path: string) {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    const expectedPathname = new URL(path, E2E_BASE_URL).pathname;

    expect(response, `La navigation vers ${path} doit produire une réponse`).not.toBeNull();
    expect(
        response?.status(),
        `La route ${path} doit répondre sans erreur HTTP`,
    ).toBeLessThan(400);
    expect(new URL(page.url()).pathname).toBe(expectedPathname);
    await expect(page.locator('main#main-content')).toBeVisible();
    await settlePageLayout(page);
}

export async function expectCanonicalPath(page: Page, expectedPath: string) {
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);

    const href = await canonical.getAttribute('href');
    expect(href, `La page ${expectedPath} doit exposer une URL canonique`).toBeTruthy();

    const canonicalUrl = new URL(href!, page.url());
    expect(canonicalUrl.pathname).toBe(expectedPath);
    expect(canonicalUrl.search).toBe('');
    expect(canonicalUrl.hash).toBe('');
}

export async function expectNoHorizontalOverflow(page: Page) {
    const layout = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const documentWidth = Math.max(
            document.documentElement.scrollWidth,
            document.body?.scrollWidth ?? 0,
        );
        const offenders = Array.from(document.querySelectorAll<HTMLElement>('body *'))
            .filter((element) => {
                const rect = element.getBoundingClientRect();
                return rect.left < -1 || rect.right > viewportWidth + 1;
            })
            .slice(0, 8)
            .map((element) => {
                const id = element.id ? `#${element.id}` : '';
                const classes = Array.from(element.classList)
                    .slice(0, 2)
                    .map((className) => `.${className}`)
                    .join('');
                return `${element.tagName.toLowerCase()}${id}${classes}`;
            });

        return { viewportWidth, documentWidth, offenders };
    });

    expect(
        layout.documentWidth,
        `Débordement horizontal détecté (${layout.documentWidth}px pour ${layout.viewportWidth}px). Éléments possibles : ${layout.offenders.join(', ') || 'non identifiés'}`,
    ).toBeLessThanOrEqual(layout.viewportWidth + 1);
}

export async function expectAccessibleMedia(
    page: Page,
    selector = 'main#main-content img',
) {
    const images = page.locator(selector);
    await expect
        .poll(() => images.count(), {
            message: `Au moins une image est attendue dans ${selector}`,
        })
        .toBeGreaterThan(0);

    const missingAlternatives = await images.evaluateAll((elements) =>
        elements.flatMap((element, index) => {
            const image = element as HTMLImageElement;
            return image.hasAttribute('alt')
                ? []
                : [`image ${index + 1} (${image.currentSrc || image.src || 'source inconnue'})`];
        }),
    );

    expect(
        missingAlternatives,
        `Chaque image doit déclarer un texte alternatif, vide si elle est décorative : ${missingAlternatives.join(', ')}`,
    ).toEqual([]);

    const firstVisibleImage = images.filter({ visible: true }).first();
    await expect(firstVisibleImage).toBeVisible();
    await expect
        .poll(
            () =>
                firstVisibleImage.evaluate(
                    (element) =>
                        (element as HTMLImageElement).complete &&
                        (element as HTMLImageElement).naturalWidth > 0,
                ),
            { message: 'Le premier média visible doit être chargé sans erreur' },
        )
        .toBe(true);
}
