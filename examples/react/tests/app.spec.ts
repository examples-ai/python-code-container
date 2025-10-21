import { test, expect } from '@playwright/test';

test.describe('Python Code Container React Demo', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads with basic elements
    await expect(page.getByText('Python Editor')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Run Code' })).toBeVisible();
  });

  test('should display code editor and console', async ({ page }) => {
    await page.goto('/');

    // Check for code editor (CodeMirror)
    const editor = page.locator('.cm-editor');
    await expect(editor).toBeVisible();

    // Check for console output area
    const console = page.locator('#console-output');
    await expect(console).toBeVisible();
  });
});