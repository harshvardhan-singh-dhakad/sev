import { NextRequest, NextResponse } from 'next/server';
import {
  recordWebhookEvent,
  markWebhookProcessed,
  markOrderPaid,
  markPaymentFailed,
  recordRefund,
} from '@/lib/orders';
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    // 1. Read raw body as text for cryptographic HMAC verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing x-razorpay-signature header' },
        { status: 400 }
      );
    }

    // 2. Timing-safe cryptographic HMAC-SHA256 signature verification via Web Crypto
    const isValid = await verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.error('Razorpay Webhook: Invalid signature received');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // 3. Parse JSON payload
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const eventId = payload.id || request.headers.get('x-razorpay-event-id');
    const eventType = payload.event;

    if (!eventId || !eventType) {
      return NextResponse.json(
        { error: 'Missing event ID or event type in webhook payload' },
        { status: 400 }
      );
    }

    // 4. Idempotency Check & Recording in webhook_events ledger
    const summary = `${eventType}: ${payload.contains?.join(',') || 'entity'}`;
    const { isDuplicate } = await recordWebhookEvent(eventId, eventType, summary);

    if (isDuplicate) {
      return NextResponse.json({
        success: true,
        status: 'already_processed',
        message: `Webhook event ${eventId} already received & processed`,
      });
    }

    // 5. Handle supported event types
    switch (eventType) {
      case 'payment.captured': {
        const paymentEntity = payload.payload?.payment?.entity;
        if (!paymentEntity) {
          await markWebhookProcessed(eventId, 'ignored');
          break;
        }

        const razorpayOrderId = paymentEntity.order_id;
        const razorpayPaymentId = paymentEntity.id;
        const amount = paymentEntity.amount; // in paise
        const method = paymentEntity.method;

        if (razorpayOrderId) {
          await markOrderPaid({
            razorpayOrderId,
            payment: {
              razorpayPaymentId,
              amount,
              method,
              rawDetailsJson: JSON.stringify(paymentEntity),
            },
            actor: 'webhook',
          });
          await markWebhookProcessed(eventId, 'processed');
        } else {
          await markWebhookProcessed(eventId, 'ignored');
        }
        break;
      }

      case 'payment.failed': {
        const paymentEntity = payload.payload?.payment?.entity;
        if (!paymentEntity) {
          await markWebhookProcessed(eventId, 'ignored');
          break;
        }

        const razorpayOrderId = paymentEntity.order_id;
        const razorpayPaymentId = paymentEntity.id;
        const errorCode = paymentEntity.error_code || 'PAYMENT_FAILED';
        const errorDescription =
          paymentEntity.error_description || paymentEntity.error_reason || 'Payment failed';

        if (razorpayOrderId) {
          await markPaymentFailed({
            razorpayOrderId,
            razorpayPaymentId,
            errorCode,
            errorDescription,
            actor: 'webhook',
          });
          await markWebhookProcessed(eventId, 'processed');
        } else {
          await markWebhookProcessed(eventId, 'ignored');
        }
        break;
      }

      case 'refund.processed': {
        const refundEntity = payload.payload?.refund?.entity;
        const paymentEntity = payload.payload?.payment?.entity;

        if (!refundEntity) {
          await markWebhookProcessed(eventId, 'ignored');
          break;
        }

        const razorpayOrderId = paymentEntity?.order_id || refundEntity.notes?.order_id;
        const razorpayRefundId = refundEntity.id;
        const razorpayPaymentId = refundEntity.payment_id;
        const amount = refundEntity.amount; // in paise

        if (razorpayOrderId) {
          await recordRefund({
            razorpayOrderId,
            razorpayRefundId,
            razorpayPaymentId,
            amount,
            reason: refundEntity.notes?.reason || 'Refund processed via Razorpay Webhook',
            actor: 'webhook',
          });
          await markWebhookProcessed(eventId, 'processed');
        } else {
          await markWebhookProcessed(eventId, 'ignored');
        }
        break;
      }

      default: {
        // Non-critical event types (e.g. order.paid) safely acknowledged
        await markWebhookProcessed(eventId, 'ignored');
        break;
      }
    }

    return NextResponse.json({
      success: true,
      event: eventType,
      eventId,
    });
  } catch (err: any) {
    console.error('Razorpay webhook processing error:', err);
    return NextResponse.json(
      { error: err.message || 'Webhook processing internal error' },
      { status: 500 }
    );
  }
}
