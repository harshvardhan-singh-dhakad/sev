import { test, expect, Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test.describe('Admin Phase A1 Screenshots Capture', () => {
  const OWNER_EMAIL = 'owner@rasvat.in';
  const OWNER_PASS = 'RasvatOwner@2026';
  const outputDir = path.join(process.cwd(), 'screenshots', 'admin');

  test.beforeAll(() => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  });

  async function loginAsOwner(page: Page, width: number, height: number) {
    await page.setViewportSize({ width, height });
    await page.goto('/admin/login');
    await page.fill('#admin-email', OWNER_EMAIL);
    await page.fill('#admin-password', OWNER_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin$/);
    await page.waitForLoadState('networkidle');
  }

  const viewports = [
    { name: '1366px', width: 1366, height: 850 },
    { name: '375px', width: 375, height: 812 },
  ];

  for (const vp of viewports) {
    test(`Capture Admin Login at ${vp.name}`, async ({ page, context }) => {
      await context.clearCookies();
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/admin/login');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(outputDir, `login-${vp.name}.png`), fullPage: true });
    });

    test(`Capture Admin Shell / Dashboard at ${vp.name}`, async ({ page }) => {
      await loginAsOwner(page, vp.width, vp.height);
      await expect(page.locator('h1').first()).toContainText('Rasvat Operations Dashboard');
      await page.waitForTimeout(500);

      if (vp.width === 375) {
        await page.screenshot({ path: path.join(outputDir, `dashboard-${vp.name}.png`), fullPage: false });
        // Open mobile drawer
        const menuBtn = page.locator('header button').first();
        await menuBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(outputDir, `mobile-drawer-${vp.name}.png`), fullPage: false });
      } else {
        await page.screenshot({ path: path.join(outputDir, `dashboard-${vp.name}.png`), fullPage: false });
      }
    });

    test(`Capture Admin Settings at ${vp.name}`, async ({ page }) => {
      await loginAsOwner(page, vp.width, vp.height);
      await page.goto('/admin/settings');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1').first()).toContainText('Store Configuration & Rules');
      await expect(page.getByText('Brand / Store Name')).toBeVisible();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outputDir, `settings-${vp.name}.png`), fullPage: true });
    });

    test(`Capture Admin Audit Log at ${vp.name}`, async ({ page }) => {
      await loginAsOwner(page, vp.width, vp.height);
      await page.goto('/admin/audit-log');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1').first()).toContainText('Security Audit Trail');
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outputDir, `audit-log-${vp.name}.png`), fullPage: true });
    });

    test(`Capture Admin Media Library at ${vp.name}`, async ({ page }) => {
      await loginAsOwner(page, vp.width, vp.height);
      await page.goto('/admin/media');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1').first()).toContainText('Media Library & Assets');
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outputDir, `media-${vp.name}.png`), fullPage: true });
    });
  }
});
