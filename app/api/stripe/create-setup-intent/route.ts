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
    const body = await req.json().catch(() => ({}));
    const { customerId, email } = body || {};

    const stripe = getStripe();
    if (stripe) {
      let cust = customerId;
      if (!cust && email) {
        const customer = await stripe.customers.create({ email });
        cust = customer.id;
      }

      const setupIntent = await stripe.setupIntents.create({
        customer: cust || undefined,
        usage: 'off_session',
        description: 'WeCare Track Jamaica - Card verification setup intent'
      });

      return jsonResponse({
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id
      });
    }

    // Mock setup intent for testing
    return jsonResponse({
      clientSecret: `seti_mock_${Date.now()}_secret_${Math.random().toString(36).substring(2, 10)}`,
      setupIntentId: `seti_mock_${Date.now()}`
    });
  } catch (err: any) {
    return jsonResponse({ error: err.message }, { status: 400 });
  }
}
