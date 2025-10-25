// netlify/functions/create-checkout.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { draftId, email, priceId, successPath } = body;

    const successUrl = (process.env.PUBLIC_BASE_URL || '').replace(/\/+$/,'') + (successPath || '/caregiver/success.html') + '?session_id={CHECKOUT_SESSION_ID}';
    const cancelUrl = (process.env.PUBLIC_BASE_URL || '').replace(/\/+$/,'');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId || process.env.STRIPE_PRICE_ID, quantity: 1 }],
      customer_email: email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { draftId }
    });

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: session.url })
    };
  } catch (e) {
    console.error('create-checkout error', e);
    return { statusCode: 500, body: 'Failed to create checkout' };
  }
};
