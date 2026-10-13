import { orderDbQuery } from './db';
import { OrderRecord } from './types';
import { expireOrder, markOrderPaid } from './index';

export interface ReconciliationOptions {
  staleMinutes?: number; // default: 30 minutes
  expireHours?: number; // default: 24 hours
}

export interface ReconciliationSummary {
  checked: number;
  autoCaptured: number;
  expired: number;
  errors: string[];
}

/**
 * Reconciles stale pending orders against payment status and timeout windows.
 */
export async function reconcilePendingOrders(
  options: ReconciliationOptions = {}
): Promise<ReconciliationSummary> {
  const staleMinutes = options.staleMinutes ?? 30;
  const expireHours = options.expireHours ?? 24;

  const now = Date.now();
  const staleThreshold = new Date(now - staleMinutes * 60 * 1000).toISOString();
  const expireThreshold = new Date(now - expireHours * 60 * 60 * 1000).toISOString();

  const summary: ReconciliationSummary = {
    checked: 0,
    autoCaptured: 0,
    expired: 0,
    errors: [],
  };

  try {
    const staleOrders = await orderDbQuery<OrderRecord>(
      `SELECT * FROM orders 
       WHERE status = 'pending_payment' AND created_at <= ? 
       ORDER BY created_at ASC 
       LIMIT 100;`,
      [staleThreshold]
    );

    summary.checked = staleOrders.length;

    for (const order of staleOrders) {
      try {
        // If order exceeds absolute expiry window (e.g. 24 hours), expire it
        if (order.created_at <= expireThreshold) {
          const expired = await expireOrder(order.id);
          if (expired) {
            summary.expired++;
          }
          continue;
        }

        // If order has razorpay_order_id and live credentials are present, check gateway
        if (order.razorpay_order_id) {
          const keyId = process.env.RAZORPAY_KEY_ID;
          const keySecret = process.env.RAZORPAY_KEY_SECRET;

          if (keyId && keySecret && !keyId.includes('placeholder')) {
            const authHeader = `Basic ${btoa(`${keyId}:${keySecret}`)}`;

            const res = await fetch(
              `https://api.razorpay.com/v1/orders/${order.razorpay_order_id}/payments`,
              {
                headers: {
                  Authorization: authHeader,
                },
              }
            );

            if (res.ok) {
              const data = await res.json();
              const items = data.items || [];
              const capturedPayment = items.find((p: any) => p.status === 'captured');

              if (capturedPayment) {
                await markOrderPaid({
                  orderId: order.id,
                  razorpayOrderId: order.razorpay_order_id,
                  payment: {
                    razorpayPaymentId: capturedPayment.id,
                    amount: capturedPayment.amount,
                    method: capturedPayment.method,
                    rawDetailsJson: JSON.stringify(capturedPayment),
                  },
                  actor: 'system',
                });
                summary.autoCaptured++;
              }
            }
          }
        }
      } catch (orderErr: any) {
        summary.errors.push(`Order ${order.order_number}: ${orderErr.message}`);
      }
    }
  } catch (err: any) {
    summary.errors.push(`Global query failure: ${err.message}`);
  }

  return summary;
}
