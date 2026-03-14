import { test, expect } from '@playwright/test';

test.describe('Products Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('mantis_auth_token', 'test-token');
    });
    
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@test.com',
          name: 'Test User',
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: null
        })
      });
    });
    
    await page.route('**/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    await page.route('**/providers/config', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(null)
      });
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('dashboard page loads and renders main layout', async ({ page }) => {
    await expect(page.locator('.container').first()).toBeVisible({ timeout: 15000 });
    
    const heading = page.getByRole('heading', { name: /track product prices/i}).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('navbar is present on dashboard', async ({ page }) => {
    const navbar = page.locator('nav').filter({ hasText: 'mantis' }).first();
    await expect(navbar).toBeVisible({ timeout: 10000 });
  });

  test('sidebar navigation tabs are present', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible({ timeout: 10000 });
    
    await expect(page.getByRole('button', { name: 'Tracker' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'History' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' }).first()).toBeVisible();
  });

  test('empty state displays when no products tracked', async ({ page }) => {
    const emptyMessage = page.getByText(/nothing tracked yet/i).first();
    await expect(emptyMessage).toBeVisible({ timeout: 10000 });
    
    const urlInput = page.getByPlaceholder(/paste product url/i);
    await expect(urlInput).toBeVisible();
    
    const trackButton = page.getByRole('button', { name: 'Track', exact: true });
    await expect(trackButton).toBeVisible();
    
    await expect(trackButton).toBeDisabled();
  });

  test('add product input and button are present', async ({ page }) => {
    const urlInput = page.getByPlaceholder(/paste product url/i);
    await expect(urlInput).toBeVisible({ timeout: 10000 });
    await expect(urlInput).toBeEmpty();
    
    await urlInput.fill('https://example.com/product');
    await expect(urlInput).toHaveValue('https://example.com/product');
    
    const trackButton = page.getByRole('button', { name: 'Track', exact: true });
    await expect(trackButton).toBeVisible();
    await expect(trackButton).toBeEnabled();
  });

  test('settings tab is clickable', async ({ page }) => {
    const settingsTabs = page.getByRole('button', { name: 'Settings', exact: true });
    await expect(settingsTabs.first()).toBeVisible({ timeout: 10000 });
    await expect(settingsTabs.first()).toBeEnabled();
  });

  test('history tab is clickable', async ({ page }) => {
    const historyTabs = page.getByRole('button', { name: 'History', exact: true });
    await expect(historyTabs.first()).toBeVisible({ timeout: 10000 });
    await expect(historyTabs.first()).toBeEnabled();
  });

  test('page gracefully handles backend loading state', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByPlaceholder(/paste product url/i)).toBeVisible({ timeout: 15000 });
  });
});