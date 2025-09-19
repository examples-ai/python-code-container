import { test, expect } from '@playwright/test';

test.describe('Container Functionality', () => {
  test('should show Node.js container loading and ready states', async ({ page }) => {
    await page.goto('/');

    const nodeContainer = page.locator('.card').filter({ hasText: '🟢 Node.js Container' });
    await expect(nodeContainer).toBeVisible();

    // Check initial state
    await expect(nodeContainer.locator('.container-status')).toBeVisible();

    // Check for code editor
    await expect(nodeContainer.locator('.code-editor')).toBeVisible();

    // Check for execute button
    const executeButton = nodeContainer.locator('button', { hasText: 'Execute Node.js Code' });
    await expect(executeButton).toBeVisible();
  });

  test('should show Python container loading and ready states', async ({ page }) => {
    await page.goto('/');

    const pythonContainer = page.locator('.card').filter({ hasText: '🐍 Python Container' });
    await expect(pythonContainer).toBeVisible();

    // Check initial state
    await expect(pythonContainer.locator('.container-status')).toBeVisible();

    // Check for code editor
    await expect(pythonContainer.locator('.code-editor')).toBeVisible();

    // Check for execute button
    const executeButton = pythonContainer.locator('button', { hasText: 'Execute Python Code' });
    await expect(executeButton).toBeVisible();
  });

  test('should have pre-filled sample code', async ({ page }) => {
    await page.goto('/');

    // Check Node.js sample code
    const nodeTextarea = page.locator('.card').filter({ hasText: 'Node.js Container' }).locator('.code-editor');
    await expect(nodeTextarea).toHaveValue(/console\.log\('Hello from Node\.js!'\)/);

    // Check Python sample code
    const pythonTextarea = page.locator('.card').filter({ hasText: 'Python Container' }).locator('.code-editor');
    await expect(pythonTextarea).toHaveValue(/print\("Hello from Python!"\)/);
  });

  test('should allow editing code in text areas', async ({ page }) => {
    await page.goto('/');

    const nodeTextarea = page.locator('.card').filter({ hasText: 'Node.js Container' }).locator('.code-editor');

    // Clear and type new code
    await nodeTextarea.clear();
    await nodeTextarea.fill('console.log("Hello from Playwright test!");');

    await expect(nodeTextarea).toHaveValue('console.log("Hello from Playwright test!");');
  });
});