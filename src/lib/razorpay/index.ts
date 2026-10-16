/**
 * ============================================================
 * RASVAT RAZORPAY SERVICE (Cloudflare Workers Runtime Compliant)
 * ============================================================
 * Uses native fetch with HTTP Basic Auth (NO Node Razorpay SDK).
 * Uses Web Crypto (crypto.subtle) for HMAC-SHA256 signature verification.
 */

export interface CreateRazorpayOrderInput {
  amount: number; // in integer paise (e.g. 29900 = Rs 299.00)
  currency?: string; // default "INR"
  receipt: string; // e.g. RSV-2610-00001
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string; // "order_..."
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface VerifyPaymentInput {
  orderId: string; // razorpay_order_id
  paymentId: string; // razorpay_payment_id
  signature: string; // razorpay_signature
  secret?: string; // optional override, defaults to process.env.RAZORPAY_KEY_SECRET
  keySecret?: string; // alias for secret
}

/**
 * Creates an authoritative order on Razorpay using HTTP Basic Auth.
 */
export async function createRazorpayOrder(
  input: CreateRazorpayOrderInput
): Promise<RazorpayOrderResult> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const mockMode = process.env.NODE_ENV !== 'production' && process.env.RAZORPAY_MOCK_MODE === 'true';
  const hasPlaceholderCredentials = [keyId, keySecret].some((value) =>
    value ? /placeholder|yourtestkey|yourwebhooksecret/i.test(value) : false
  );

  if ((!keyId || !keySecret || hasPlaceholderCredentials) && mockMode) {
    return {
      id: `order_mock_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      amount: input.amount,
      currency: input.currency || 'INR',
      receipt: input.receipt,
      status: 'created',
    };
  }

  if (!keyId || !keySecret || hasPlaceholderCredentials) {
    throw new Error('Set valid Razorpay credentials: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
  if (!/^rzp_(test|live)_/.test(keyId)) {
    throw new Error('RAZORPAY_KEY_ID must be a Razorpay test or live key ID.');
  }

  const authHeader = `Basic ${btoa(`${keyId}:${keySecret}`)}`;
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency || 'INR',
      receipt: input.receipt,
      notes: input.notes || {},
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(
      errData?.error?.description || `Razorpay API order creation failed with status ${res.status}`
    );
  }

  const data = await res.json();
  return {
    id: data.id,
    amount: data.amount,
    currency: data.currency,
    receipt: data.receipt,
    status: data.status,
  };
}

/**
 * Computes HMAC-SHA256 hex string using Web Crypto (crypto.subtle).
 */
export async function computeHmacSha256Hex(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verifies Razorpay checkout signature:
 * HMAC-SHA256(order_id + "|" + payment_id, secret) == signature
 * Constant-time comparison using Web Crypto.
 */
export async function verifyRazorpayPaymentSignature(
  input: VerifyPaymentInput
): Promise<boolean> {
  const secret = input.secret || input.keySecret || process.env.RAZORPAY_KEY_SECRET;

  if (!input.orderId || !input.paymentId || !input.signature || !secret) {
    return false;
  }

  const payload = `${input.orderId}|${input.paymentId}`;
  return verifyHmacSha256(payload, input.signature, secret);
}

/**
 * Verifies Razorpay Webhook signature:
 * HMAC-SHA256(rawBody, webhookSecret) == signature
 */
export async function verifyRazorpayWebhookSignature(
  rawBody: string,
  providedSignature: string,
  webhookSecret?: string
): Promise<boolean> {
  const secret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!rawBody || !providedSignature || !secret) {
    return false;
  }

  return verifyHmacSha256(rawBody, providedSignature, secret);
}

/**
 * Timing-safe HMAC-SHA256 signature verification via Web Crypto.
 */
export async function verifyHmacSha256(
  payload: string,
  providedSignatureHex: string,
  secret: string
): Promise<boolean> {
  try {
    const cleanProvided = providedSignatureHex.trim().toLowerCase();
    const expectedHex = await computeHmacSha256Hex(payload, secret);

    if (expectedHex.length !== cleanProvided.length) {
      return false;
    }

    // Constant-time XOR comparison to prevent timing attacks
    let mismatch = 0;
    for (let i = 0; i < expectedHex.length; i++) {
      mismatch |= expectedHex.charCodeAt(i) ^ cleanProvided.charCodeAt(i);
    }

    return mismatch === 0;
  } catch (err) {
    console.error('verifyHmacSha256 error:', err);
    return false;
  }
}
