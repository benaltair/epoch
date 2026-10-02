import { expect, type Page } from '@playwright/test';
export async function openEntry(page: Page, title: string) {
	await page.getByRole('button', { name: 'Browse periods', exact: true }).click();
	await page.getByRole('searchbox', { name: 'Find a period or event' }).fill(title);
	await page
		.locator('.search-results')
		.getByRole('button', { name: new RegExp(title) })
		.click();
	await expect(page.locator('.detail-dialog')).toBeVisible();
}
