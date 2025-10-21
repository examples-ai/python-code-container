import { test, expect } from '@playwright/test';

test.describe('Python Container', () => {
  test('should show Python editor and run button', async ({ page }) => {
    await page.goto('/');

    // Check for Python Editor label
    await expect(page.getByText('Python Editor')).toBeVisible();

    // Check for Run Code button
    await expect(page.getByRole('button', { name: 'Run Code' })).toBeVisible();

    // Check for console
    await expect(page.locator('#console-output')).toBeVisible();
  });

  test('should have pre-filled Python sample code', async ({ page }) => {
    await page.goto('/');

    // Check that editor contains Python code
    const editor = page.locator('.cm-content');
    await expect(editor).toContainText(/print\('Hello from Python!'\)/);
  });

  test('should run Python code when Run Code button is clicked', async ({ page }) => {
    await page.goto('/');

    // Wait for container to be ready
    await page.waitForTimeout(10000);

    // Click Run Code button
    await page.getByRole('button', { name: 'Run Code' }).click();

    // Wait for output
    await page.waitForTimeout(2000);

    // Check console output
    const consoleOutput = page.locator('#console-output');
    await expect(consoleOutput).toContainText('Hello from Python!');
  });
});