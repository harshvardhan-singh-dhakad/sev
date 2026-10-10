import { test, expect } from '@playwright/test';

test.describe('Explore Our Sev Categories Section', () => {
  test('has exactly 8 cards, valid links, and no mojibake', async ({ page }) => {
    await page.goto('/');

    const section = page.locator('#explore-our-sev-section');
    await expect(section).toBeVisible();

    // Verify heading
    await expect(section.locator('#categories-heading')).toHaveText('Explore Our Sev');

    // Exactly 8 category cards
    const cards = section.locator('a[id^="category-card-"]');
    await expect(cards).toHaveCount(8);

    // Each an <a> with a non-empty href
    for (let i = 0; i < 8; i++) {
      const card = cards.nth(i);
      const href = await card.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href?.length).toBeGreaterThan(0);
      expect(href).toMatch(/^\/shop\?category=[a-z0-9-]+$/);
    }

    // Section text has no match for /Ã|Â|â€|ð/
    const sectionText = await section.innerText();
    expect(sectionText).not.toMatch(/[ÃÂâð]/);

    // CTA button exists and links to /shop
    const cta = section.locator('#categories-view-all-btn');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/shop');
    await expect(cta).toContainText('View All Sev');
  });

  test('no horizontal scroll at 375px and accessible tab order', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const section = page.locator('#explore-our-sev-section');
    await expect(section).toBeVisible();

    // Verify no horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);

    // Tab order test
    // Scroll section into view
    await section.scrollIntoViewIfNeeded();

    // Focus the first card
    const firstCard = section.locator('a[id^="category-card-"]').first();
    await firstCard.focus();
    await expect(firstCard).toBeFocused();

    // Tab through remaining 7 cards
    for (let i = 1; i < 8; i++) {
      await page.keyboard.press('Tab');
      const currentCard = section.locator('a[id^="category-card-"]').nth(i);
      await expect(currentCard).toBeFocused();
    }

    // Tab to CTA
    await page.keyboard.press('Tab');
    const cta = section.locator('#categories-view-all-btn');
    await expect(cta).toBeFocused();
  });

  test('captures screenshots at 375, 768, 1024, 1366px plus hover and focus states', async ({ page }) => {
    const viewports = [
      { width: 375, height: 812, name: '375px' },
      { width: 768, height: 1024, name: '768px' },
      { width: 1024, height: 768, name: '1024px' },
      { width: 1366, height: 900, name: '1366px' },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const section = page.locator('#explore-our-sev-section');
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      await section.screenshot({
        path: `test-results/category-section-${vp.name}.png`,
      });
    }

    // Hover state screenshot (at 1366px)
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const section = page.locator('#explore-our-sev-section');
    await section.scrollIntoViewIfNeeded();

    const firstCard = section.locator('a[id^="category-card-"]').first();
    await firstCard.hover();
    await page.waitForTimeout(300);

    await section.screenshot({
      path: 'test-results/category-section-hover.png',
    });

    // Keyboard focus state screenshot (at 1366px)
    await firstCard.focus();
    await page.waitForTimeout(300);

    await section.screenshot({
      path: 'test-results/category-section-focus.png',
    });
  });
});
