import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { defineConfig } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

const localEnvPath = resolve(process.cwd(), '.env.local');

if (existsSync(localEnvPath)) {
    loadEnv({
        path: localEnvPath,
        override: false,
        quiet: true,
    });
}

const baseURL = 'http://127.0.0.1:3210';

const viewportProjects = [
    { name: 'chromium-320', width: 320, height: 700 },
    { name: 'chromium-390', width: 390, height: 844 },
    { name: 'chromium-768', width: 768, height: 1024 },
    { name: 'chromium-1024', width: 1024, height: 900 },
    { name: 'chromium-1366', width: 1366, height: 768 },
    { name: 'chromium-1440', width: 1440, height: 1000 },
] as const;

export default defineConfig({
    testDir: './tests/e2e',
    outputDir: 'output/playwright/test-results',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : 2,
    timeout: 120_000,
    expect: {
        timeout: 7_500,
    },
    reporter: [
        [process.env.CI ? 'dot' : 'list'],
        ['html', { outputFolder: 'output/playwright/report', open: 'never' }],
    ],
    use: {
        baseURL,
        browserName: 'chromium',
        colorScheme: 'light',
        locale: 'fr-FR',
        timezoneId: 'Europe/Paris',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: viewportProjects.map(({ name, width, height }) => ({
        name,
        use: {
            viewport: { width, height },
        },
    })),
    webServer: {
        command: 'node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3210',
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
    },
});
