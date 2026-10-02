import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openEntry } from './helpers';
const state = async (page: import('@playwright/test').Page) => {
	await expect(page.locator('.app')).toHaveAttribute('data-navigating', 'false');
	return page.getByTestId('timeline-plot').evaluate((el) => ({
		start: Number((el as HTMLElement).dataset.start),
		end: Number((el as HTMLElement).dataset.end)
	}));
};
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
	await expect(page.getByRole('heading', { name: 'Bahá’í timeline' })).toBeVisible();
});
test('full cycle → history → age → event → sourced card → back', async ({ page }) => {
	await page.getByRole('button', { name: 'Whole cycle', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'The Bahá’í Cycle', exact: true })).toBeVisible();
	const broad = await state(page);
	expect(broad.end - broad.start).toBeGreaterThan(180_000_000);
	await page.getByRole('button', { name: 'Explore 1844 onward' }).click();
	await page.getByRole('button', { name: /The Heroic Age, .*Explore period/ }).click();
	await expect(page.getByRole('heading', { name: 'The Heroic Age', exact: true })).toBeVisible();
	await openEntry(page, 'The Declaration of the Báb');
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	await expect(
		dialog.getByRole('heading', { name: 'The Declaration of the Báb', exact: true })
	).toBeVisible();
	await expect(
		dialog.getByRole('link', { name: 'The Life of the Báb · Bahai.org' })
	).toHaveAttribute('href', 'https://www.bahai.org/the-bab/life-the-bab');
	await expect(dialog.getByText('23 May 1844', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'Close details' }).click();
	await expect(dialog).not.toBeVisible();
	await page.goBack();
	await expect(dialog).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(dialog).not.toBeVisible();
});
test('zoom controls, keyboard and URL restoration preserve dates', async ({ page }) => {
	const initial = await state(page);
	await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
	const zoomed = await state(page);
	expect(zoomed.end - zoomed.start).toBeCloseTo((initial.end - initial.start) / 2, 2);
	expect((zoomed.start + zoomed.end) / 2).toBeCloseTo((initial.start + initial.end) / 2, 2);
	const url = page.url();
	await page.reload();
	await expect(page.getByTestId('timeline-plot')).toHaveAttribute(
		'data-start',
		String(zoomed.start)
	);
	expect(page.url()).toBe(url);
	await page.getByTestId('timeline-plot').focus();
	await page.keyboard.press('ArrowRight');
	expect((await state(page)).start).toBeGreaterThan(zoomed.start);
	await page.keyboard.press('Home');
	await expect(page.getByRole('heading', { name: 'Bahá’í timeline' })).toBeVisible();
});
test('cards link to prerendered pages that work without JavaScript', async ({ page, browser }) => {
	await openEntry(page, 'The Ascension of ‘Abdu’l-Bahá');
	await expect(
		page
			.getByRole('dialog')
			.getByRole('heading', { name: 'The Ascension of ‘Abdu’l-Bahá', exact: true })
	).toBeVisible();
	const href = await page.getByRole('link', { name: 'Open page' }).getAttribute('href');
	const context = await browser.newContext({ javaScriptEnabled: false });
	const reading = await context.newPage();
	await reading.goto('http://127.0.0.1:4173' + href);
	await expect(
		reading.getByRole('heading', { name: 'The Ascension of ‘Abdu’l-Bahá', exact: true })
	).toBeVisible();
	await expect(
		reading.getByRole('link', { name: 'The Life of ‘Abdu’l-Bahá · Bahai.org' })
	).toBeVisible();
	await context.close();
});
test('reading list, hierarchy search and both themes fit the viewport', async ({ page }) => {
	await page.getByRole('button', { name: 'Reading list', exact: true }).click();
	await expect(page.locator('.chronological-list')).toBeVisible();
	await page.getByRole('button', { name: 'Switch to dark theme' }).click();
	await expect(page.locator('.app')).toHaveAttribute('data-theme', 'dark');
	await page.reload();
	await expect(page.locator('.app')).toHaveAttribute('data-theme', 'dark');
	if (await page.getByRole('button', { name: 'Browse periods', exact: true }).isVisible())
		await page.getByRole('button', { name: 'Browse periods', exact: true }).click();
	await page.getByRole('searchbox', { name: 'Find a period or event' }).fill('ten year');
	await page
		.locator('.search-results')
		.getByRole('button', { name: /Ten Year Crusade/ })
		.click();
	await expect(page.getByRole('heading', { name: 'Ten Year Crusade', exact: true })).toBeVisible();
	expect(
		await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
	).toBe(true);
});
test('overview and magnification remain finite at day scale', async ({ page }) => {
	await page.getByRole('button', { name: 'How to explore' }).click();
	await page.getByRole('slider', { name: 'Time magnification' }).focus();
	await page.keyboard.press('End');
	const day = await state(page);
	expect(day.end - day.start).toBeCloseTo(1, 2);
	await page.getByRole('button', { name: 'Got it' }).click();
	await expect(page.getByRole('button', { name: 'Zoom in', exact: true })).toBeDisabled();
	await page.getByRole('button', { name: 'Recorded history', exact: true }).last().click();
	await page.getByRole('button', { name: 'Overview', exact: true }).click();
	await page.locator('.range-options summary').click();
	const start = page.getByRole('slider', { name: 'Start of visible window' });
	await start.focus();
	await page.keyboard.press('ArrowRight');
	expect(Number.isFinite((await state(page)).start)).toBe(true);
});
test('accessible controls and no horizontal overflow', async ({ page }) => {
	const results = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
		.analyze();
	expect(results.violations).toEqual([]);
	await openEntry(page, 'The Declaration of the Báb');
	const card = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
	expect(card.violations).toEqual([]);
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
		true
	);
});
test('bounded rendering and error-free gesture navigation', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.getByRole('button', { name: 'Whole cycle', exact: true }).click();
	expect(await page.locator('.mark').count()).toBeLessThan(200);
	await page.getByRole('button', { name: 'Explore 1844 onward' }).click();
	expect(await page.locator('.mark').count()).toBeLessThan(200);
	await page.locator('.axis').scrollIntoViewIfNeeded();
	const box = await page.getByTestId('timeline-plot').boundingBox();
	if (!box) throw new Error('No plot');
	const before = await state(page);
	await page.mouse.move(box.x + box.width * 0.6, box.y + 17);
	await page.mouse.down();
	await page.mouse.move(box.x + box.width * 0.3, box.y + 17, { steps: 15 });
	await page.mouse.up();
	await expect.poll(async () => (await state(page)).start).toBeGreaterThan(before.start);
	expect(errors).toEqual([]);
});

test('the timeline fills the screen and sequential epochs never stagger', async ({ page }) => {
	const viewport = page.viewportSize()!;
	const app = (await page.locator('.app').boundingBox())!;
	const plot = (await page.getByTestId('timeline-plot').boundingBox())!;
	expect(app.height).toBeCloseTo(viewport.height, 0);
	expect(plot.width).toBeGreaterThan(viewport.width * 0.9);
	expect(plot.height).toBeGreaterThan(viewport.height * 0.6);
	expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(
		true
	);
	for (const id of ['formative', 'divine', 'plan']) {
		const rows = await page
			.locator(`[data-track="${id}"] .mark-position`)
			.evaluateAll((els) => els.map((el) => (el as HTMLElement).style.top));
		expect(new Set(rows).size).toBe(1);
	}
	await page.getByRole('button', { name: 'Browse periods', exact: true }).click();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('button', { name: 'Browse periods', exact: true })).toBeFocused();
});

test('period navigation animates briefly, retains context, and respects reduced motion', async ({
	page
}) => {
	await page.getByRole('button', { name: 'Browse periods', exact: true }).click();
	await page.getByRole('searchbox').fill('Ten Year Crusade');
	const motion = page.waitForFunction(
		() => document.querySelector('.app')?.getAttribute('data-navigating') === 'true'
	);
	await page
		.locator('.search-results')
		.getByRole('button', { name: /Ten Year Crusade/ })
		.click();
	await motion;
	await expect(page.locator('.app')).toHaveAttribute('data-navigating', 'false');
	const plot = (await page.getByTestId('timeline-plot').boundingBox())!;
	const mark = (await page
		.getByRole('button', { name: /Ten Year Crusade, .*Explore period/ })
		.boundingBox())!;
	expect(mark.width / plot.width).toBeLessThan(0.66);
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.getByRole('button', { name: 'Whole cycle', exact: true }).click();
	await expect(page.locator('.app')).toHaveAttribute('data-navigating', 'false');
	expect((await state(page)).end - (await state(page)).start).toBeGreaterThan(180_000_000);
});

test('canvas bands stay fixed while plan labels expand with zoom', async ({ page }) => {
	const before = await page.locator('[data-track="plan"]').boundingBox();
	const ageBefore = await page.locator('[data-track="age"]').boundingBox();
	if (page.viewportSize()!.width >= 900)
		await expect(page.locator('[data-entry="nine-year-plan"] .bar-label')).toHaveText('9YP');
	await page.getByRole('button', { name: 'Browse periods', exact: true }).click();
	await page.getByRole('searchbox').fill('Nine Year Plan');
	await page
		.locator('.search-results')
		.getByRole('button', { name: 'Nine Year Plan 2022 — 2031', exact: true })
		.click();
	await expect(page.locator('.app')).toHaveAttribute('data-navigating', 'false');
	await expect(page.locator('[data-entry="nine-year-plan"] .bar-label')).toHaveText(
		'Nine Year Plan'
	);
	const after = await page.locator('[data-track="plan"]').boundingBox();
	const ageAfter = await page.locator('[data-track="age"]').boundingBox();
	expect(after!.y).toBeCloseTo(before!.y, 0);
	expect(ageAfter!.y).toBeCloseTo(ageBefore!.y, 0);
	await page.getByRole('button', { name: 'Recorded history', exact: true }).click();
	await expect(page.locator('.app')).toHaveAttribute('data-navigating', 'false');
	expect((await page.locator('[data-track="ministry"]').boundingBox())!.height).toBeGreaterThan(
		100
	);
});
