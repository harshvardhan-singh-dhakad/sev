import { test, expect } from '@playwright/test';

test.describe('Home Page functionality & design', () => {
  test('direct navigation to / loads all sections without errors', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // Verify Hero
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Real Taste of India/i })).toBeVisible();

    // Verify Category section
    await expect(page.getByRole('heading', { name: /Explore Our Sev/i })).toBeVisible();

    // Verify Best Sellers
    await expect(page.getByRole('heading', { name: /^Best Sellers$/i })).toBeVisible();

    // Verify Why Choose Us
    await expect(page.getByRole('heading', { name: /^Why Choose Us$/i })).toBeVisible();

    // Verify Bulk Order CTA
    await expect(page.getByRole('heading', { name: /Need Sev in Bulk\?/i })).toBeVisible();

    // Verify Sample CTA
    await expect(page.getByRole('heading', { name: /Taste Before You Order/i })).toBeVisible();

    // Verify Reviews
    await expect(page.getByRole('heading', { name: /What Our Customers Say/i })).toBeVisible();

    // Verify FAQ
    await expect(page.getByRole('heading', { name: /Frequently Asked Questions/i })).toBeVisible();

    // Verify Blog Preview
    await expect(page.getByRole('heading', { name: /Sev Stories & Insights/i })).toBeVisible();
  });

  test('client-side navigation from /bulk-orders to / works smoothly', async ({ page }) => {
    // Start at /bulk-orders
    await page.goto('/bulk-orders');
    await expect(page).toHaveURL(/\/bulk-orders/);

    // Click "Home" link in header
    const homeLink = page.locator('header').getByRole('link', { name: 'Home' }).first();
    await homeLink.click();

    // Should navigate to /
    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Real Taste of India/i })).toBeVisible();
  });

  test('FAQ accordion opens and closes properly', async ({ page }) => {
    await page.goto('/');

    const firstFaqTrigger = page.locator('button[id^="faq-"]').first();
    await expect(firstFaqTrigger).toBeVisible();

    // Click to open
    await firstFaqTrigger.click();
    await expect(firstFaqTrigger).toHaveAttribute('aria-expanded', 'true');
    const answer = page.locator('section[aria-labelledby="faq-heading"]').locator('p.text-sm').first();
    await expect(answer).toBeVisible();

    // Click again to close
    await firstFaqTrigger.click();
    await expect(firstFaqTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('mobile viewport has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });

  test('capture desktop and mobile screenshots', async ({ page }) => {
    // Desktop screenshot
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/home-desktop-full.png', fullPage: true });

    // Mobile screenshot
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/home-mobile-full.png', fullPage: true });
  });
});
