import { test, expect } from '@playwright/test';
import {
  perKgPrice,
  getHighestPerKgPrice,
  savingPercent,
  formatINR,
  checkMinimumCart,
  clampQuantity,
} from '../src/lib/pricing';

test.describe('Pricing Pure Module Unit Tests', () => {
  test('perKgPrice calculates correct paise/kg across standard pack sizes', () => {
    // Pack template: 10g: ₹5 (500p), 25g: ₹10 (1000p), 50g: ₹20 (2000p),
    // 100g: ₹40 (4000p), 250g: ₹90 (9000p), 500g: ₹160 (16000p), 1kg: ₹310 (31000p)
    expect(perKgPrice(500, 10)).toBe(50000); // ₹500/kg
    expect(perKgPrice(1000, 25)).toBe(40000); // ₹400/kg
    expect(perKgPrice(2000, 50)).toBe(40000); // ₹400/kg
    expect(perKgPrice(4000, 100)).toBe(40000); // ₹400/kg
    expect(perKgPrice(9000, 250)).toBe(36000); // ₹360/kg
    expect(perKgPrice(16000, 500)).toBe(32000); // ₹320/kg
    expect(perKgPrice(31000, 1000)).toBe(31000); // ₹310/kg

    // Edge cases
    expect(perKgPrice(0, 250)).toBe(0);
    expect(perKgPrice(500, 0)).toBe(0);
    expect(perKgPrice(500, -10)).toBe(0);
  });

  test('getHighestPerKgPrice identifies peak per-kg rate among variants', () => {
    const variants = [
      { price: 500, weight_grams: 10, is_active: true }, // 50000 p/kg (Highest)
      { price: 1000, weight_grams: 25, is_active: true }, // 40000 p/kg
      { price: 9000, weight_grams: 250, is_active: true }, // 36000 p/kg
      { price: 31000, weight_grams: 1000, is_active: true }, // 31000 p/kg
    ];

    expect(getHighestPerKgPrice(variants)).toBe(50000);
  });

  test('savingPercent calculates accurate savings against highest per-kg variant', () => {
    const highestPerKg = 50000; // ₹500/kg from the 10g trial pack

    // 10g has 0% savings (it is the baseline highest rate)
    expect(savingPercent(500, 10, highestPerKg)).toBe(0);

    // 250g @ 36000 p/kg: (50000 - 36000) / 50000 = 28%
    expect(savingPercent(9000, 250, highestPerKg)).toBe(28);

    // 500g @ 32000 p/kg: (50000 - 32000) / 50000 = 36%
    expect(savingPercent(16000, 500, highestPerKg)).toBe(36);

    // 1kg @ 31000 p/kg: (50000 - 31000) / 50000 = 38%
    expect(savingPercent(31000, 1000, highestPerKg)).toBe(38);

    // Guard cases
    expect(savingPercent(9000, 250, 0)).toBe(0);
    expect(savingPercent(60000, 1000, highestPerKg)).toBe(0); // If more expensive, 0%
  });

  test('formatINR formats currency according to Indian numbering standard without corrupt characters', () => {
    expect(formatINR(500)).toBe('₹5');
    expect(formatINR(9000)).toBe('₹90');
    expect(formatINR(19900)).toBe('₹199');
    expect(formatINR(31000)).toBe('₹310');
    expect(formatINR(199000)).toBe('₹1,990');

    // Fractional paise display
    expect(formatINR(9050, { showPaise: true })).toMatch(/₹\s?90\.50/);
    expect(formatINR(9050)).toMatch(/₹\s?90\.50/); // auto-displays if fractional
  });

  test('checkMinimumCart correctly flags eligibility and computes shortfall', () => {
    const minThreshold = 19900; // ₹199

    // Below threshold
    const below = checkMinimumCart(15000, minThreshold);
    expect(below.isEligible).toBe(false);
    expect(below.shortfallPaise).toBe(4900); // ₹49 short

    // Exactly at threshold
    const exact = checkMinimumCart(19900, minThreshold);
    expect(exact.isEligible).toBe(true);
    expect(exact.shortfallPaise).toBe(0);

    // Above threshold
    const above = checkMinimumCart(25000, minThreshold);
    expect(above.isEligible).toBe(true);
    expect(above.shortfallPaise).toBe(0);
  });

  test('clampQuantity enforces minimum, maximum, and step increments', () => {
    // Normal clamping
    expect(clampQuantity(0, 1, 10, 1)).toBe(1);
    expect(clampQuantity(15, 1, 10, 1)).toBe(10);
    expect(clampQuantity(4, 1, 10, 1)).toBe(4);

    // Step enforcement
    expect(clampQuantity(5, 1, 10, 2)).toBe(5); // 1 + 2*2 = 5
    expect(clampQuantity(4, 1, 10, 2)).toBe(5); // rounds to nearest step 5
    expect(clampQuantity(11, 1, 10, 2)).toBe(9); // nearest valid step <= 10
  });
});
