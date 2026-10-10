import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Bulk Orders Page Validation Suite', () => {
  test.beforeAll(() => {
    const dir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  test('no horizontal scroll at 375px and element bounding box within card', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/bulk-orders');
    await page.waitForLoadState('networkidle');

    // Check no horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Verify elements do not exceed card edges
    const cardsWithinBounds = await page.evaluate(() => {
      const cards = document.querySelectorAll('.rounded-\\[16px\\]');
      let allWithin = true;
      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const inputs = card.querySelectorAll('input, select, textarea, button, a');
        inputs.forEach(el => {
          const elRect = el.getBoundingClientRect();
          if (elRect.right > cardRect.right + 2 || elRect.left < cardRect.left - 2) {
            allWithin = false;
          }
        });
      });
      return allWithin;
    });
    expect(cardsWithinBounds).toBe(true);
  });

  test('mobile order below 1024px: form, Why Partner, Sample card', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/bulk-orders');
    await page.waitForLoadState('networkidle');

    const formHeading = page.locator('h2', { hasText: 'Request a Bulk Quote' });
    const whyPartnerHeading = page.locator('h2', { hasText: 'Why Partner With Us?' });
    const sampleHeading = page.locator('h3', { hasText: 'Need a Sample First?' });

    const formY = (await formHeading.boundingBox())?.y ?? 0;
    const whyPartnerY = (await whyPartnerHeading.boundingBox())?.y ?? 0;
    const sampleY = (await sampleHeading.boundingBox())?.y ?? 0;

    expect(formY).toBeLessThan(whyPartnerY);
    expect(whyPartnerY).toBeLessThan(sampleY);
  });

  test('accessible Tab order through form and sample button', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/bulk-orders');
    await page.waitForLoadState('networkidle');

    // Focus name input
    const nameInput = page.locator('#bulk-name');
    await nameInput.focus();
    await expect(nameInput).toBeFocused();

    // Tab through fields: company, phone, email, city, state, requirements, quantity, message, submit
    await page.keyboard.press('Tab');
    await expect(page.locator('#bulk-company')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('#bulk-phone')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('#bulk-email')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('#bulk-city')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('#bulk-state')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('#bulk-requirements')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('#bulk-estimatedQuantity')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('#bulk-message')).toBeFocused();

    await page.keyboard.press('Tab');
    const submitBtn = page.getByRole('button', { name: 'Submit Enquiry' });
    await expect(submitBtn).toBeFocused();

    // Verify sample button is also reachable and functional
    const sampleBtn = page.locator('a', { hasText: 'Request Free Sample' });
    await expect(sampleBtn).toBeVisible();
    await expect(sampleBtn).toHaveAttribute('href', '/samples');
  });

  test('form validation errors and screenshots capture', async ({ page }) => {
    // 1. Capture 1366px full page
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/bulk-orders');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/bulk-orders-1366px.png', fullPage: true });

    // 2. Capture 768px full page
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'screenshots/bulk-orders-768px.png', fullPage: true });

    // 3. Capture 375px full page
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ path: 'screenshots/bulk-orders-375px.png', fullPage: true });

    // 4. Trigger validation errors and capture screenshot
    await page.setViewportSize({ width: 1366, height: 900 });
    const submitBtn = page.getByRole('button', { name: 'Submit Enquiry' });
    await submitBtn.click();

    // Check error text is visible and linked with aria-describedby
    const nameError = page.locator('#bulk-name-error');
    await expect(nameError).toBeVisible();
    await expect(nameError).toHaveText('Contact person name is required');
    await expect(page.locator('#bulk-name')).toHaveAttribute('aria-describedby', 'bulk-name-error');
    await expect(page.locator('#bulk-name')).toHaveAttribute('aria-invalid', 'true');

    // Take screenshot with validation errors
    await page.screenshot({ path: 'screenshots/bulk-orders-errors-1366px.png', fullPage: true });
  });
});
