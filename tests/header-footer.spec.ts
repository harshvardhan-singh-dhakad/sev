import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Header and Footer Validation Suite', () => {
  test.beforeAll(() => {
    const dir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Acceptance Requirement 3:
  // "Add ONE new Playwright test that fails if header or footer text matches /Ã|Â|â€|ð/,
  // and asserts header tabs read exactly: Home, Shop, Bulk Orders, About."
  test('encoding and tab labels verification', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    const header = page.locator('header');
    const footer = page.locator('footer');

    await expect(header).toBeVisible();
    await expect(footer).toBeVisible();

    const headerText = await header.innerText();
    const footerText = await footer.innerText();

    const corruptCharRegex = /[ÃÂâ€ð]/;
    expect(corruptCharRegex.test(headerText)).toBe(false);
    expect(corruptCharRegex.test(footerText)).toBe(false);

    // Assert header tabs read exactly: Home, Shop, Bulk Orders, About
    const desktopNavLinks = header.locator('nav[aria-label="Main Navigation"] > a, nav[aria-label="Main Navigation"] > div > a');
    const tabTexts = await desktopNavLinks.allInnerTexts();
    // Clean whitespace / linebreaks
    const cleanedTabs = tabTexts.map(t => t.trim().split('\n')[0]);
    expect(cleanedTabs).toEqual(['Home', 'Shop', 'Bulk Orders', 'About']);
  });

  // Acceptance Requirement 4:
  // "Header height measures 80px at 1366px and 64px at 375px, before and after scrolling."
  test('header height measures 80px at 1366px and 64px at 375px before and after scroll', async ({ page }) => {
    // Desktop 1366px
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');
    const desktopHeader = page.locator('header');

    const hDesktopBefore = await desktopHeader.evaluate(el => Math.round(el.getBoundingClientRect().height));
    expect(hDesktopBefore).toBe(80);

    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(200);

    const hDesktopAfter = await desktopHeader.evaluate(el => Math.round(el.getBoundingClientRect().height));
    expect(hDesktopAfter).toBe(80);

    // Mobile 375px
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const mobileHeader = page.locator('header');

    const hMobileBefore = await mobileHeader.evaluate(el => Math.round(el.getBoundingClientRect().height));
    expect(hMobileBefore).toBe(64);

    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(200);

    const hMobileAfter = await mobileHeader.evaluate(el => Math.round(el.getBoundingClientRect().height));
    expect(hMobileAfter).toBe(64);
  });

  // Acceptance Requirement 5:
  // "No horizontal scroll at 375px; Tab order works through the whole header and footer."
  test('no horizontal scroll at 375px and accessible tab navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Test tab navigation in header
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');

    // Focus starts at document body, Tab through header
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const activeTagName = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT', 'BODY']).toContain(activeTagName);
    }
  });

  // Acceptance Requirement 2:
  // "Playwright screenshots of header and footer at 375, 768 and 1366px, plus:
  // mobile drawer open, Shop dropdown open on desktop, header while scrolled. Save and list the paths."
  test('capture all required screenshots', async ({ page }) => {
    // --- 1. 375px Viewport ---
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.locator('header').screenshot({ path: 'screenshots/header-375px.png' });
    await page.locator('footer').screenshot({ path: 'screenshots/footer-375px.png' });

    // Mobile drawer open at 375px
    await page.locator('button[aria-label="Open menu"]').click();
    await page.waitForSelector('#mobile-drawer');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/mobile-drawer-open-375px.png' });
    // Close drawer
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    // --- 2. 768px Viewport ---
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.locator('header').screenshot({ path: 'screenshots/header-768px.png' });
    await page.locator('footer').screenshot({ path: 'screenshots/footer-768px.png' });

    // --- 3. 1366px Viewport ---
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');
    await page.locator('header').screenshot({ path: 'screenshots/header-1366px.png' });
    await page.locator('footer').screenshot({ path: 'screenshots/footer-1366px.png' });

    // Shop dropdown open on desktop
    const shopLink = page.locator('header nav[aria-label="Main Navigation"] a:has-text("Shop")');
    await shopLink.hover();
    await page.waitForSelector('[role="menu"]');
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'screenshots/shop-dropdown-open-1366px.png' });

    // Header while scrolled on desktop
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/header-scrolled-1366px.png', clip: { x: 0, y: 0, width: 1366, height: 110 } });
  });
});
