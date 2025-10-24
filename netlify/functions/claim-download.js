// netlify/functions/claim-download.js
import Stripe from 'stripe';
import { Store } from '../../lib/store.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { sessionId } = body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return { statusCode: 403, body: 'Not paid' };
    }

    const f = Store.getFile(sessionId);
    if (!f) return { statusCode: 404, body: 'File not ready' };

    const url = `/.netlify/functions/download-once?token=${encodeURIComponent(sessionId)}`;
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ downloadUrl: url })
    };
  } catch (e) {
    console.error('claim-download error', e);
    return { statusCode: 500, body: 'Failed to provide download' };
  }
};
