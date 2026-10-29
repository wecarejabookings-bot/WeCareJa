import Stripe from 'stripe';

function jsonResponse(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
  });
}

function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.startsWith('sk_test_placeholder') || secretKey.length < 10) {
    return null;
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia' as any
  });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const stripe = getStripe();
    let event: Stripe.Event;

    if (stripe && webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } catch (err: any) {
        console.warn(`[Stripe Webhook Signature Verification Failed]:`, err.message);
        return jsonResponse({ error: `Webhook Error: ${err.message}` }, { status: 400 });
      }
    } else {
      // In testing/dev, parse the raw JSON directly
      try {
        event = JSON.parse(rawBody);
      } catch {
        return jsonResponse({ error: 'Invalid JSON payload' }, { status: 400 });
      }
    }

    console.log(`[Stripe Webhook Received Event]: ${event.type}`);

    // =========================================================================
    // Webhook Handler for: payment_intent.amount_capturable_updated
    // =========================================================================
    // When the $1.00 authorization succeeds, immediately void it so the client
    // is never charged (Amazon-style $1 auth verification guarantee)
    if (event.type === 'payment_intent.amount_capturable_updated') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`[Stripe Webhook] payment_intent.amount_capturable_updated for intent ${paymentIntent.id}, amount: ${paymentIntent.amount}`);

      if (stripe && paymentIntent.amount === 100 && paymentIntent.status === 'requires_capture') {
        try {
          await stripe.paymentIntents.cancel(paymentIntent.id, {
            cancellation_reason: 'abandoned'
          });
          console.log(`[Stripe Webhook] Successfully voided $1 verification hold on intent ${paymentIntent.id}`);
        } catch (cancelErr: any) {
          console.warn(`[Stripe Webhook] Intent already canceled or captured:`, cancelErr.message);
        }
      }
    }

    return jsonResponse({
      received: true,
      eventType: event.type
    });
  } catch (err: any) {
    console.error('[Stripe Webhook Handler Error]', err);
    return jsonResponse({ error: err.message }, { status: 500 });
  }
}
