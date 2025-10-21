import { test, expect } from '@playwright/test';

test.describe('Code Container Demo', () => {
  test('should load the editor page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Code Container Python Demo/);
    await expect(page.locator('#editor-container')).toBeVisible();
    await expect(page.locator('#console-container')).toBeVisible();
  });

  test('should show run button and Python editor label', async ({ page }) => {
    await page.goto('/');

    const runButton = page.locator('#run-btn');
    const toolbar = page.locator('#toolbar');

    await expect(runButton).toBeVisible();
    await expect(toolbar).toContainText('Python Editor');
  });

  test('should show console with clear button', async ({ page }) => {
    await page.goto('/');

    const consoleOutput = page.locator('#console-output');
    const clearButton = page.locator('#clear-btn');

    await expect(consoleOutput).toBeVisible();
    await expect(clearButton).toBeVisible();
  });

  test('should initialize container and show logs', async ({ page }) => {
    await page.goto('/');

    const consoleOutput = page.locator('#console-output');

    // Wait for container initialization messages
    await expect(consoleOutput).toContainText('Initializing Python container', { timeout: 10000 });
    await expect(consoleOutput).toContainText('Python container ready', { timeout: 30000 });
  });

  test('should execute Python code', async ({ page }) => {
    await page.goto('/');

    const runButton = page.locator('#run-btn');
    const consoleOutput = page.locator('#console-output');

    // Wait for container to be ready
    await expect(consoleOutput).toContainText('Python container ready', { timeout: 30000 });

    // Click run button
    await runButton.click();

    // Check for Python execution logs
    await expect(consoleOutput).toContainText('Running Python code', { timeout: 5000 });
    await expect(consoleOutput).toContainText('Hello from Python', { timeout: 10000 });
    await expect(consoleOutput).toContainText('Execution completed', { timeout: 5000 });
  });

  test('should clear console', async ({ page }) => {
    await page.goto('/');

    const clearButton = page.locator('#clear-btn');
    const consoleOutput = page.locator('#console-output');

    // Wait for container to be ready (ensures we have content)
    await expect(consoleOutput).toContainText('Python container ready', { timeout: 30000 });

    // Click clear button
    await clearButton.click();

    // Console should be empty
    await expect(consoleOutput).toContainText('Console is empty');
    await expect(consoleOutput).not.toContainText('Python container ready');
  });
});
