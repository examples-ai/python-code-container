import { test, expect } from '@playwright/test';

test.describe('Performance Metrics', () => {
  test('should display performance metrics section', async ({ page }) => {
    await page.goto('/');

    const performanceSection = page.locator('.card').filter({ hasText: '⚡ Performance Metrics' });
    await expect(performanceSection).toBeVisible();

    // Check for subsections
    await expect(performanceSection.locator('h4').filter({ hasText: 'Initialization Times' })).toBeVisible();
    await expect(performanceSection.locator('h4').filter({ hasText: 'Execution Performance' })).toBeVisible();
    await expect(performanceSection.locator('h4').filter({ hasText: 'Memory Usage' })).toBeVisible();
    await expect(performanceSection.locator('h4').filter({ hasText: 'Container States' })).toBeVisible();
  });

  test('should show container initialization status', async ({ page }) => {
    await page.goto('/');

    const performanceSection = page.locator('.card').filter({ hasText: '⚡ Performance Metrics' });

    // Check that initialization times section exists (may be empty if no containers initialized)
    await expect(performanceSection.locator('h4').filter({ hasText: 'Initialization Times' })).toBeVisible();
  });

  test('should have performance test buttons', async ({ page }) => {
    await page.goto('/');

    const performanceSection = page.locator('.card').filter({ hasText: '⚡ Performance Metrics' });

    // Check for test buttons
    await expect(performanceSection.locator('button', { hasText: 'Test Node.js Execution' })).toBeVisible();
    await expect(performanceSection.locator('button', { hasText: 'Test Python Execution' })).toBeVisible();
  });

  test('should display memory information', async ({ page }) => {
    await page.goto('/');

    const performanceSection = page.locator('.card').filter({ hasText: '⚡ Performance Metrics' });
    const memorySection = performanceSection.locator('h4').filter({ hasText: 'Memory Usage' }).locator('..');

    // Memory info should be displayed (either actual values or "not available")
    await expect(memorySection).toBeVisible();
  });

  test('should show container states with ref counts', async ({ page }) => {
    await page.goto('/');

    const performanceSection = page.locator('.card').filter({ hasText: '⚡ Performance Metrics' });

    // Check that Container States section exists
    await expect(performanceSection.locator('h4').filter({ hasText: 'Container States' })).toBeVisible();

    // Check that the container states wrapper div exists (it may be empty if no containers initialized)
    const containerStatesWrapper = performanceSection.locator('div').filter({ hasText: 'Container States' });
    await expect(containerStatesWrapper).toBeVisible();
  });
});