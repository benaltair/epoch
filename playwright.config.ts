import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
	testDir: 'tests',
	fullyParallel: true,
	workers: 3,
	retries: process.env.CI ? 1 : 0,
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL: 'http://127.0.0.1:4173',
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure'
	},
	webServer: {
		command: process.env.EPOCH_CLOUDFLARE
			? 'npm run preview:cloudflare'
			: 'npm run preview -- --port 4173',
		url: 'http://127.0.0.1:4173',
		reuseExistingServer: !process.env.CI,
		timeout: 120000
	},
	projects: [
		{
			name: 'desktop-chromium',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } }
		},
		{
			name: 'desktop-firefox',
			use: { ...devices['Desktop Firefox'], viewport: { width: 1366, height: 900 } }
		},
		{
			name: 'desktop-webkit',
			use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 900 } }
		},
		{ name: 'iphone', use: { ...devices['iPhone 13'] } },
		{ name: 'android', use: { ...devices['Pixel 7'] } },
		{ name: 'ipad', use: { ...devices['iPad (gen 7)'] } }
	]
});
