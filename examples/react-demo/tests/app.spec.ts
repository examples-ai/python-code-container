import { test, expect } from '@playwright/test';

test.describe('Code Container React Demo', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Code Container React Demo/);
    await expect(page.locator('h1')).toContainText('🚀 Code Container React Demo');
  });

  test('should display container status', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h3').filter({ hasText: '📊 Container Status' })).toBeVisible();

    // The container status section should be present (but may be empty if containers aren't initialized)
    const statusSection = page.locator('.card').filter({ hasText: '📊 Container Status' });
    await expect(statusSection).toBeVisible();
  });

  test('should display Node.js and Python containers', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h3').filter({ hasText: '🟢 Node.js Container' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: '🐍 Python Container' })).toBeVisible();
  });

  test('should display performance demo', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h3').filter({ hasText: '⚡ Performance Metrics' })).toBeVisible();
  });
});