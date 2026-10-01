import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const range = async (page: import('@playwright/test').Page) =>
	page.getByTestId('timeline-plot').evaluate((el) => ({
		start: Number((el as HTMLElement).dataset.start),
		end: Number((el as HTMLElement).dataset.end)
	}));
const errorsByPage = new WeakMap<import('@playwright/test').Page, string[]>();
test.beforeEach(async ({ page }) => {
	const errors: string[] = [];
	errorsByPage.set(page, errors);
	page.on('pageerror', (e) => errors.push(e.message));
});
test.afterEach(async ({ page }) => {
	expect(errorsByPage.get(page) ?? []).toEqual([]);
});
test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('.app')).toHaveAttribute('data-ready', 'true');
});
test('failed story retains summary and citations, retry recovers', async ({ page }) => {
	await page.route('**/data/declaration-bab.json', (r) => r.abort());
	await page
		.locator('.story-teasers')
		.getByRole('button', { name: /The Declaration of the Báb/ })
		.click();
	await expect(page.getByRole('button', { name: 'Retry story' })).toBeVisible();
	await expect(
		page.getByRole('dialog').getByRole('link', { name: 'The Life of the Báb · Bahai.org' })
	).toBeVisible();
	await page.unroute('**/data/declaration-bab.json');
	await page.getByRole('button', { name: 'Retry story' }).click();
	await expect(page.getByRole('button', { name: 'Retry story' })).not.toBeVisible();
	await expect(page.getByRole('status')).not.toBeVisible();
});
test('320px layout, larger reading size, orientation change, and dark contrast', async ({
	page
}) => {
	await page.setViewportSize({ width: 320, height: 740 });
	await page.getByRole('button', { name: 'How to explore' }).click();
	await page.getByRole('slider', { name: 'Reading size' }).focus();
	await page.keyboard.press('End');
	await page.getByRole('button', { name: 'Got it' }).click();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
		true
	);
	const before = await range(page);
	await page.setViewportSize({ width: 900, height: 500 });
	await expect.poll(() => range(page)).toEqual(before);
	await page.getByRole('button', { name: 'Switch to dark theme' }).click();
	const result = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
		.analyze();
	expect(result.violations).toEqual([]);
});
test('undated age is readable without claiming a calendar position', async ({ page }) => {
	if (await page.getByRole('button', { name: 'Browse periods', exact: true }).isVisible())
		await page.getByRole('button', { name: 'Browse periods', exact: true }).click();
	await page.getByRole('searchbox', { name: 'Find a period or event' }).fill('Golden Age');
	const before = await range(page);
	await page
		.locator('.search-results')
		.getByRole('button', { name: /The Golden Age/ })
		.click();
	await expect(
		page.getByRole('dialog').getByText('Future age · dates not specified', { exact: true })
	).toBeVisible();
	expect(await range(page)).toEqual(before);
	await expect(page.getByRole('dialog').getByRole('button', { name: /Explore this/ })).toHaveCount(
		0
	);
});
test('pointer cancellation, overview drag, and ctrl-wheel preserve usable state', async ({
	page
}) => {
	const plot = page.getByTestId('timeline-plot');
	await plot.scrollIntoViewIfNeeded();
	const b = (await plot.boundingBox())!;
	const before = await range(page);
	await plot.dispatchEvent('pointerdown', {
		pointerId: 99,
		button: 0,
		clientX: b.x + 90,
		clientY: b.y + 10
	});
	await plot.dispatchEvent('pointercancel', {
		pointerId: 99,
		button: 0,
		clientX: b.x + 90,
		clientY: b.y + 10
	});
	await plot.dispatchEvent('wheel', {
		ctrlKey: true,
		deltaY: -70,
		clientX: b.x + b.width / 2,
		clientY: b.y + 10
	});
	await expect
		.poll(async () => {
			const v = await range(page);
			return v.end - v.start;
		})
		.toBeLessThan(before.end - before.start);
	await page.getByRole('button', { name: 'Recorded history', exact: true }).last().click();
	const overview = page.getByRole('group', { name: 'Timeline overview' });
	await overview.scrollIntoViewIfNeeded();
	const o = (await overview.boundingBox())!;
	await page.mouse.move(o.x + 12, o.y + 20);
	await page.mouse.down();
	await page.mouse.move(o.x + o.width * 0.25, o.y + 20, { steps: 10 });
	await page.mouse.up();
	await expect
		.poll(async () => {
			const v = await range(page);
			return v.end - v.start;
		})
		.toBeLessThan(before.end - before.start);
});
test('Chromium native two-finger pinch keeps midpoint anchored', async ({
	page,
	context,
	browserName
}, info) => {
	test.skip(
		browserName !== 'chromium' || info.project.name !== 'android',
		'Native CDP touch test runs in Android emulation. Other engines exercise pointer logic and controls.'
	);
	const plot = page.getByTestId('timeline-plot');
	await plot.scrollIntoViewIfNeeded();
	const b = (await plot.boundingBox())!;
	const before = await range(page),
		x = b.x + b.width / 2,
		y = b.y + 75;
	const cdp = await context.newCDPSession(page);
	const points = (distance: number) => [
		{ id: 1, x: x - distance / 2, y, radiusX: 5, radiusY: 5 },
		{ id: 2, x: x + distance / 2, y, radiusX: 5, radiusY: 5 }
	];
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(80) });
	for (let distance = 90; distance <= 160; distance += 10)
		await cdp.send('Input.dispatchTouchEvent', {
			type: 'touchMove',
			touchPoints: points(distance)
		});
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	await expect
		.poll(async () => {
			const v = await range(page);
			return (v.end - v.start) / (before.end - before.start);
		})
		.toBeCloseTo(0.5, 1);
	const after = await range(page);
	expect((after.start + after.end) / 2).toBeCloseTo((before.start + before.end) / 2, 0);
	await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
	expect((await range(page)).end - (await range(page)).start).toBeGreaterThan(
		after.end - after.start
	);
});

test('malformed story JSON degrades to its sourced summary', async ({ page }) => {
	await page.route('**/data/declaration-bab.json', (r) => r.fulfill({ json: { paragraphs: 42 } }));
	await page
		.locator('.story-teasers')
		.getByRole('button', { name: /The Declaration of the Báb/ })
		.click();
	await expect(page.getByRole('button', { name: 'Retry story' })).toBeVisible();
	await expect(
		page
			.getByRole('dialog')
			.getByRole('heading', { name: 'The Declaration of the Báb', exact: true })
	).toBeVisible();
});

test('the home page provides a complete reading path without JavaScript', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto('http://127.0.0.1:4173/');
	await page.getByRole('link', { name: 'browse the reading index', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Reading index', exact: true })).toBeVisible();
	await page.getByRole('link', { name: /The Golden Age Future age/ }).click();
	await expect(page.getByRole('heading', { name: 'The Golden Age', exact: true })).toBeVisible();
	await context.close();
});

test('failed optional photograph leaves the story and source usable', async ({ page }) => {
	await page.route('**/single-image-3.jpg*', (r) => r.abort());
	await page
		.locator('.story-teasers')
		.getByRole('button', { name: /The Ascension of ‘Abdu’l-Bahá/ })
		.click();
	await expect(page.getByRole('link', { name: 'View the photo source' })).toBeVisible();
	await expect(
		page.getByRole('dialog').getByRole('link', { name: 'The Life of ‘Abdu’l-Bahá · Bahai.org' })
	).toBeVisible();
});
