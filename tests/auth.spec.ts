import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  
  test('login page renders with all required form elements', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('form')).toBeVisible();
    
    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');
    await expect(emailInput).toHaveAttribute('required');
    
    const passwordInput = page.locator('#password');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(passwordInput).toHaveAttribute('placeholder', '••••••••');
    await expect(passwordInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('minlength', '8');
    
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toContainText('Sign In');
    
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByText('Sign in to your Mantis account')).toBeVisible();
    
    const registerLink = page.getByRole('link', { name: /sign up/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('login form shows validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    const emailInput = page.locator('#email');
    const emailValidationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(emailValidationMessage).toBeTruthy();
    
    const passwordInput = page.locator('#password');
    const passwordValidationMessage = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(passwordValidationMessage).toBeTruthy();
    
    await expect(page).toHaveURL(/\/login/);
  });

  test('login form shows validation error for invalid email format', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    
    await emailInput.fill('invalid-email');
    await passwordInput.fill('validpassword123');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
    
    await expect(page).toHaveURL(/\/login/);
  });

  test('login form shows validation error for password too short', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    
    await emailInput.fill('valid@example.com');
    await passwordInput.fill('short');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    const validationMessage = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
    
    await expect(page).toHaveURL(/\/login/);
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token-12345',
          token_type: 'bearer'
        })
      });
    });

    await page.route('**/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: null
        })
      });
    });

    await page.goto('/login');
    
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('validpassword123');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    await expect(page).toHaveURL(/\/$/, { timeout: 5000 });
  });

  test('protected route redirects unauthenticated users to login', async ({ page }) => {
    await page.route('**/auth/me', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Unauthorized' })
      });
    });

    await page.goto('/');
    
    await page.waitForTimeout(500);
    
    await expect(page).toHaveURL(/\/login/);
  });

  test('login form displays error message on failed login', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Authentication failed' })
      });
    });

    await page.goto('/login');
    
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('wrongpassword');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    const errorMessage = page.getByText('Authentication failed');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    await expect(page).toHaveURL(/\/login/);
  });

  test('sign up link navigates to registration page', async ({ page }) => {
    await page.goto('/login');
    
    const registerLink = page.getByRole('link', { name: /sign up/i });
    await registerLink.click();
    
    await expect(page).toHaveURL(/\/register/);
  });

  test('login form inputs are disabled during submission', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token-12345',
          token_type: 'bearer'
        })
      });
    });

    await page.route('**/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: null
        })
      });
    });

    await page.goto('/login');
    
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('validpassword123');
    await submitButton.click();
    
    await expect(submitButton).toContainText('Signing in...');
    
    await expect(emailInput).toBeDisabled();
    await expect(passwordInput).toBeDisabled();
    await expect(submitButton).toBeDisabled();
  });

  test('logo is visible on login page', async ({ page }) => {
    await page.goto('/login');
    
    const logoContainer = page.locator('.max-w-md').first();
    await expect(logoContainer).toBeVisible();
  });
});