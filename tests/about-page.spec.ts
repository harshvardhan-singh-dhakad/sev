import { test, expect } from '@playwright/test';
import path from 'node:path';

test.describe('About Page Suite', () => {
  const screenshotsDir = path.join(process.cwd(), 'screenshots');

  test('1. Direct navigation to /about renders all sections without errors', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBe(200);

    // Title & Headings
    await expect(page).toHaveTitle(/Our Story & Heritage | Rasvat Authentic Sev/);
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('The Royal Crunch of');

    // Section Headings
    await expect(page.getByText('Why We Started Rasvat: Bringing Genuine Heritage Back')).toBeVisible();
    await expect(page.getByText('The Four Pillars of Rasvat Quality')).toBeVisible();
    await expect(page.getByText('Rasvat vs. Commercial Mass-Market Sev')).toBeVisible();
    await expect(page.getByText('Our Master Sev Portfolio')).toBeVisible();

    // CTA links
    await expect(page.locator('a[href="/shop"]').first()).toBeVisible();
    await expect(page.locator('a[href="/bulk-orders"]').first()).toBeVisible();
    await expect(page.locator('a[href="/samples"]').first()).toBeVisible();
  });

  test('2. Mobile viewport (375px) has zero horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    // Verify document does not horizontally scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // tolerate subpixel rounding
  });

  test('3. Capture desktop and mobile screenshots of About page', async ({ page }) => {
    // Desktop 1366px
    await page.setViewportSize({ width: 1366, height: 850 });
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, 'about-1366px.png'), fullPage: true });

    // Mobile 375px
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, 'about-375px.png'), fullPage: true });
  });
});
