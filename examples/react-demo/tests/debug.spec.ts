import { test, expect } from '@playwright/test';

test.describe('Debug', () => {
  test('should capture console errors and page content', async ({ page }) => {
    const consoleMessages: string[] = [];
    const errors: string[] = [];

    // Capture console messages
    page.on('console', (msg) => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // Capture errors
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');

    // Wait a bit for the page to load
    await page.waitForTimeout(2000);

    // Get page content
    const content = await page.content();
    console.log('Page HTML:', content);

    // Log console messages
    console.log('Console messages:', consoleMessages);

    // Log errors
    console.log('Page errors:', errors);

    // Take a screenshot
    await page.screenshot({ path: 'test-results/debug-screenshot.png' });

    // Just check that we can reach the page
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});