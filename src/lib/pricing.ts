/**
 * Aron Bites Pure Pricing Module
 * Strictly operates on integer paise (1 INR = 100 paise) and integer grams.
 * Pure functions with zero side effects.
 */

/**
 * Calculates per-kilogram price in integer paise.
 * @param pricePaise Price of variant in paise
 * @param weightGrams Weight of variant in grams
 */
export function perKgPrice(pricePaise: number, weightGrams: number): number {
  if (weightGrams <= 0) return 0;
  return Math.round((pricePaise / weightGrams) * 1000);
}

/**
 * Finds the highest per-kg price in paise among a list of active variants.
 */
export function getHighestPerKgPrice(
  variants: { price: number; weight_grams: number; is_active?: boolean }[]
): number {
  const activeVariants = variants.filter((v) => v.is_active !== false && v.weight_grams > 0);
  if (activeVariants.length === 0) return 0;
  return Math.max(...activeVariants.map((v) => perKgPrice(v.price, v.weight_grams)));
}

/**
 * Calculates saving percentage against the highest per-kg price among active variants.
 * @param variantPricePaise Current variant price in paise
 * @param variantWeightGrams Current variant weight in grams
 * @param highestPerKgPricePaise Highest active per-kg price in paise
 */
export function savingPercent(
  variantPricePaise: number,
  variantWeightGrams: number,
  highestPerKgPricePaise: number
): number {
  if (highestPerKgPricePaise <= 0 || variantWeightGrams <= 0) return 0;
  const currentPerKg = perKgPrice(variantPricePaise, variantWeightGrams);
  if (currentPerKg >= highestPerKgPricePaise) return 0;
  const saving = Math.round(((highestPerKgPricePaise - currentPerKg) / highestPerKgPricePaise) * 100);
  return Math.max(0, saving);
}

/**
 * Formats integer paise into an Indian Rupee string (e.g., ₹90, ₹310, ₹1,990).
 * Displays decimal paise only if requested or if non-zero paise exists.
 */
export function formatINR(paise: number, options?: { showPaise?: boolean }): string {
  const rupees = paise / 100;
  const hasSubRupee = paise % 100 !== 0;

  if (options?.showPaise || hasSubRupee) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rupees);
  }

  // Format integer currency cleanly (e.g., ₹90)
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(rupees));

  return `₹${formattedNumber}`;
}

/**
 * Minimum cart value check.
 * Default minimum cart value is 19900 paise (Rs 199).
 */
export function checkMinimumCart(
  subtotalPaise: number,
  minCartValuePaise: number = 19900
): {
  isEligible: boolean;
  shortfallPaise: number;
  minCartValuePaise: number;
} {
  const isEligible = subtotalPaise >= minCartValuePaise;
  const shortfallPaise = Math.max(0, minCartValuePaise - subtotalPaise);
  return {
    isEligible,
    shortfallPaise,
    minCartValuePaise,
  };
}

/**
 * Clamps and aligns quantity by min, max, and step increments.
 */
export function clampQuantity(
  qty: number,
  minQty: number = 1,
  maxQty?: number | null,
  step: number = 1
): number {
  const effectiveMin = Math.max(1, minQty);
  const effectiveStep = Math.max(1, step);

  if (qty <= effectiveMin) return effectiveMin;

  // Align to step multiples from minQty
  const stepsCount = Math.round((qty - effectiveMin) / effectiveStep);
  let aligned = effectiveMin + stepsCount * effectiveStep;

  if (aligned < effectiveMin) aligned = effectiveMin;
  if (typeof maxQty === 'number' && maxQty > 0 && aligned > maxQty) {
    // Round down to closest valid step below maxQty
    const maxSteps = Math.floor((maxQty - effectiveMin) / effectiveStep);
    aligned = effectiveMin + maxSteps * effectiveStep;
  }

  return aligned;
}
