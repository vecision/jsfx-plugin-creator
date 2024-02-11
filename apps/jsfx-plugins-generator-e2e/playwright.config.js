import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';
// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://127.0.0.1:4200';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig(Object.assign(Object.assign({}, nxE2EPreset(__filename, { testDir: './src' })), { 
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        baseURL,
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    }, 
    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npx nx serve jsfx-plugin-creator',
        url: 'http://127.0.0.1:4200',
        reuseExistingServer: !process.env.CI,
        cwd: workspaceRoot,
    }, projects: [
        {
            name: 'chromium',
            use: Object.assign({}, devices['Desktop Chrome']),
        },
        {
            name: 'firefox',
            use: Object.assign({}, devices['Desktop Firefox']),
        },
        {
            name: 'webkit',
            use: Object.assign({}, devices['Desktop Safari']),
        },
        // Uncomment for mobile browsers support
        /* {
          name: 'Mobile Chrome',
          use: { ...devices['Pixel 5'] },
        },
        {
          name: 'Mobile Safari',
          use: { ...devices['iPhone 12'] },
        }, */
        // Uncomment for branded browsers
        /* {
          name: 'Microsoft Edge',
          use: { ...devices['Desktop Edge'], channel: 'msedge' },
        },
        {
          name: 'Google Chrome',
          use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        } */
    ] }));
//# sourceMappingURL=playwright.config.js.map