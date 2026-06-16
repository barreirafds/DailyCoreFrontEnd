import { test, expect } from '@playwright/test';

test('homepage opens correctly', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/DailyCore/i);
});